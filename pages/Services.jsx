import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaChartLine,
  FaGift,
  FaMapMarkedAlt,
  FaRecycle,
  FaRoute,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Services({ darkMode }) {
  const [rewards, setRewards] = useState(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardError, setRewardError] = useState("");

  const services = [
    {
      icon: <FaCalendarCheck className="text-4xl text-green-500" />,
      title: "Smart Scheduling",
      desc: "Book pickups instantly and manage collection times effortlessly.",
    },
    {
      icon: <FaRecycle className="text-4xl text-green-500" />,
      title: "Recycling Tracking",
      desc: "Track your environmental impact through detailed recycling reports.",
    },
    {
      icon: <FaGift className="text-4xl text-green-500" />,
      title: "Rewards Program",
      desc: "Earn points and redeem rewards for completed recycling pickups.",
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl text-green-500" />,
      title: "Community Reports",
      desc: "Report illegal dumping and waste issues directly from the platform.",
    },
    {
      icon: <FaChartLine className="text-4xl text-green-500" />,
      title: "Analytics Dashboard",
      desc: "Visualize pickup trends, waste categories, and sustainability goals.",
    },
    {
      icon: <FaRoute className="text-4xl text-green-500" />,
      title: "Route Optimization",
      desc: "Reduce travel time and operational costs with intelligent routing.",
    },
  ];

  const loadRewards = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setRewards(null);
      return;
    }

    try {
      setRewardLoading(true);
      setRewardError("");

      const res = await fetch("/api/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load rewards");
      }

      setRewards(data.rewards);
    } catch (err) {
      setRewardError(err.message || "Failed to load rewards");
    } finally {
      setRewardLoading(false);
    }
  };

  const redeemReward = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setRewardError("Login to redeem rewards.");
      return;
    }

    try {
      setRewardLoading(true);
      setRewardError("");
      setRewardMessage("");

      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setRewards(data.rewards || rewards);
        throw new Error(data.error || "Unable to redeem reward");
      }

      setRewards(data.rewards);
      setRewardMessage(data.message || "Reward redeemed successfully");
    } catch (err) {
      setRewardError(err.message || "Unable to redeem reward");
    } finally {
      setRewardLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const points = rewards?.pointsAvailable || 0;
  const rewardCost = rewards?.rewardCost || 100;
  const progress = Math.min((points / rewardCost) * 100, 100);

  return (
    <section
      id="services"
      className={`py-24 transition-colors duration-500 ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold">Our Services</h2>

          <p className={`mt-4 text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Smart technology powering cleaner communities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                {service.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">{service.title}</h3>

              <p className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div
          className={`mt-12 p-8 rounded-3xl border ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-green-50 border-green-100"
          }`}
        >
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaGift className="text-3xl text-green-500" />
                <h3 className="text-3xl font-bold">Rewards Program</h3>
              </div>

              <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Earn 10 points for every completed pickup. Redeem {rewardCost} points for a Sesa Bin recycling reward.
              </p>

              <div className={`mt-6 h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-white"}`}>
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={`mt-4 grid sm:grid-cols-3 gap-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <p><span className="font-bold text-green-500">{points}</span> points available</p>
                <p><span className="font-bold text-green-500">{rewards?.completedPickups || 0}</span> completed pickups</p>
                <p><span className="font-bold text-green-500">{rewards?.pointsToNextReward ?? rewardCost}</span> points to next reward</p>
              </div>

              {!rewards && !rewardLoading && (
                <p className="mt-4 text-sm text-green-600">
                  Login and complete pickups to start earning rewards.
                </p>
              )}

              {rewardMessage && <p className="mt-4 text-sm text-green-500">{rewardMessage}</p>}
              {rewardError && <p className="mt-4 text-sm text-red-500">{rewardError}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={loadRewards}
                className={`px-6 py-3 rounded-xl border font-semibold ${
                  darkMode
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-green-200 hover:bg-white"
                }`}
              >
                Refresh Points
              </button>

              <button
                type="button"
                onClick={redeemReward}
                disabled={rewardLoading || !rewards?.redeemable}
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
              >
                {rewardLoading ? "Checking..." : "Redeem Reward"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
