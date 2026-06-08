"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard({ darkMode }) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch("/api/pickups", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      // Ensure we always set an array for pickups.
      setPickups(Array.isArray(data) ? data : data.pickups || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: complete pickup function
  const completePickup = async (id) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await fetch("/api/pickups", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id,
          status: "Completed",
        }),
      });

      fetchPickups();
    } catch (err) {
      console.error(err);
    }
  };

  // STATS FROM DATABASE
  const normalize = (val) => (val || "").toLowerCase().trim();

const stats = {
  total: pickups.length,
  plastic: pickups.filter((i) => normalize(i.waste_type) === "plastic").length,
  paper: pickups.filter((i) => normalize(i.waste_type) === "paper").length,
  metal: pickups.filter((i) => normalize(i.waste_type) === "metal").length,
  organic: pickups.filter((i) => normalize(i.waste_type) === "organic").length,
};
  // PIE DATA (FIXED — THIS WAS YOUR MAIN BUG)
  const pieData = [
    { name: "Plastic", value: stats.plastic },
    { name: "Paper", value: stats.paper },
    { name: "Metal", value: stats.metal },
    { name: "Organic", value: stats.organic },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  const lineData = [
    { month: "Jan", pickups: 120 },
    { month: "Feb", pickups: 180 },
    { month: "Mar", pickups: 250 },
    { month: "Apr", pickups: 320 },
    { month: "May", pickups: 410 },
    { month: "Jun", pickups: 500 },
  ];

  return (
    <section
      id="dashboard"
      className={`py-24 ${
        darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-4">
            Admin View
          </span>
          <h2 className="text-5xl font-bold">Dashboard Analytics</h2>
          <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
            This admin view shows submitted pickup requests and collection insights.
          </p>
        </div>

        {loading && (
          <p className="text-center text-green-500 mb-6">Loading...</p>
        )}

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card title="Total Pickups" value={stats.total} darkMode={darkMode} />
          <Card title="Plastic" value={stats.plastic} darkMode={darkMode} />
          <Card title="Paper" value={stats.paper} darkMode={darkMode} />
          <Card title="Metal" value={stats.metal} darkMode={darkMode} />
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LINE CHART */}
          <div className={`p-6 rounded-3xl ${darkMode ? "bg-white/5" : "bg-white"}`}>
            <h3 className="text-2xl font-bold mb-4">Pickup Trend</h3>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pickups" stroke="#10B981" strokeWidth={4} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART (FIXED AND WORKING) */}
          <div className={`p-8 rounded-3xl shadow ${darkMode ? "bg-white/5" : "bg-white"}`}>
            <h3 className="text-2xl font-bold mb-6">Waste Composition</h3>

            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div
          className={`mt-12 p-6 rounded-3xl ${
            darkMode ? "bg-white/5" : "bg-white"
          }`}
        >
          <h3 className="text-2xl font-bold mb-6">Recent Pickups</h3>

          <table className="w-full">
            <thead>
              <tr className={darkMode ? "border-b border-white/10" : "border-b"}>
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Location</th>
                <th className="text-left py-3">Waste Type</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {pickups.map((pickup) => (
                <tr key={pickup.id} className={darkMode ? "border-b border-white/10" : "border-b"}>
                  <td className="py-4">{pickup.name}</td>
                  <td>{pickup.location}</td>
                  <td>{pickup.waste_type}</td>
                  <td>
                    <span
                      className={
                        pickup.status === "Completed"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }
                    >
                      {pickup.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => completePickup(pickup.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}

// CARD COMPONENT
function Card({ title, value, darkMode }) {
  return (
    <div
      className={`p-6 rounded-3xl shadow-lg ${
        darkMode ? "bg-white/5" : "bg-white"
      }`}
    >
      <h3 className={darkMode ? "text-gray-300" : "text-gray-500"}>{title}</h3>
      <p className="text-4xl font-bold text-green-500 mt-2">{value}</p>
    </div>
  );
}
