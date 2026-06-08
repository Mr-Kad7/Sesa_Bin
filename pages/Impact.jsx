"use client";

import {
  FaTruck,
  FaRecycle,
  FaUsers,
  FaLeaf,
} from "react-icons/fa";

import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function Impact({ darkMode }) {
  const impacts = [
    {
      value: 15000,
      suffix: "+",
      label: "Pickups Completed",
      icon: <FaTruck />,
    },
    {
      value: 120,
      suffix: "T",
      label: "Waste Recycled",
      icon: <FaRecycle />,
    },
    {
      value: 50,
      suffix: "+",
      label: "Communities Served",
      icon: <FaUsers />,
    },
    {
      value: 8000,
      suffix: "+",
      label: "Trees Saved",
      icon: <FaLeaf />,
    },
  ];

  return (
    <section
      id="impact"
      className={`py-24 transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-r from-green-600 to-emerald-700 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-semibold mb-4">
            Sustainability Impact
          </span>

          <h2 className="text-5xl font-bold">
            Making Communities Cleaner
          </h2>

          <p className="mt-4 text-lg text-green-100 max-w-3xl mx-auto">
            Every pickup contributes to a healthier environment,
            reduced pollution, and a more sustainable future.
          </p>
        </div>

        {/* IMPACT CARDS */}
        <div className="grid md:grid-cols-4 gap-8">
          {impacts.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              className="
                bg-white/10
                backdrop-blur-lg
                rounded-3xl
                p-8
                border
                border-white/20
                text-center
                hover:scale-105
                hover:bg-white/15
                transition-all
                duration-300
              "
            >
              <div className="text-5xl mb-5 flex justify-center text-green-300">
                {item.icon}
              </div>

              <h3 className="text-4xl font-bold mb-3">
                <CountUp
                  end={item.value}
                  duration={3}
                  separator=","
                />
                {item.suffix}
              </h3>

              <p className="text-green-100">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}