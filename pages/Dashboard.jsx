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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [collectorName, setCollectorName] = useState("");
  const [collectorEmail, setCollectorEmail] = useState("");
  const [eta, setEta] = useState("");
  const [assignError, setAssignError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchPickups();
    fetchNotifications();
  }, []);

  const fetchPickups = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch("/api/pickups", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPickups(Array.isArray(data) ? data : data.pickups || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch("/api/admin-notifications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      await fetch("/api/admin-notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: notificationId }),
      });

      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const updatePickupStatus = async (id, update) => {
    setActionError("");

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error("Admin token is missing. Please login again.");
      }

      const res = await fetch("/api/pickups", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...update }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update pickup status.");
      }

      fetchPickups();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      setActionError(err.message || "Pickup update failed.");
    }
  };

  const approvePickup = (id) => updatePickupStatus(id, { status: "Approved" });

  const assignPickup = (pickup) => {
    setSelectedPickup(pickup);
    setCollectorName(pickup.collector_name || "");
    setCollectorEmail(pickup.collector_email || "");
    setEta(pickup.eta || "");
    setAssignError("");
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedPickup(null);
  };

  const submitAssign = async (event) => {
    event.preventDefault();
    setAssignError("");

    if (!selectedPickup) return;
    if (!collectorName.trim() || !collectorEmail.trim()) {
      setAssignError("Collector name and email are required.");
      return;
    }

    await updatePickupStatus(selectedPickup.id, {
      status: "Assigned",
      collectorName: collectorName.trim(),
      collectorEmail: collectorEmail.trim(),
      eta: eta.trim() || null,
    });

    closeAssignModal();
  };

  const startPickup = (id) => updatePickupStatus(id, { status: "On the Way" });

  const completePickup = (id) => updatePickupStatus(id, { status: "Completed" });

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
  const statusCounts = {
    Pending: pickups.filter((i) => i.status === "Pending").length,
    Approved: pickups.filter((i) => i.status === "Approved").length,
    Assigned: pickups.filter((i) => i.status === "Assigned").length,
    "On the Way": pickups.filter((i) => i.status === "On the Way").length,
    Completed: pickups.filter((i) => i.status === "Completed").length,
  };

  const monthMap = pickups.reduce((map, pickup) => {
    const created = new Date(pickup.created_at);
    if (Number.isNaN(created.getTime())) return map;
    const label = created.toLocaleString("default", { month: "short", year: "numeric" });
    map[label] = (map[label] || 0) + 1;
    return map;
  }, {});

  const lineData = Object.entries(monthMap)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([month, pickups]) => ({ month, pickups }));

  const pieData = [
    { name: "Plastic", value: stats.plastic },
    { name: "Paper", value: stats.paper },
    { name: "Metal", value: stats.metal },
    { name: "Organic", value: stats.organic },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <section
      id="admin-dashboard"
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

        <div className={`grid gap-4 mb-10 ${darkMode ? "text-white" : "text-slate-900"}`}>
          <div className={`rounded-3xl p-6 ${darkMode ? "bg-slate-900 border border-slate-700" : "bg-white shadow"}`}>
            <h3 className="text-xl font-semibold mb-3">Pickup workflow</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 bg-green-50 text-green-900 border border-green-100">
                <p className="text-sm font-semibold">1. Pending</p>
                <p className="text-xs text-slate-600">New request awaits approval.</p>
              </div>
              <div className="rounded-2xl p-4 bg-yellow-50 text-yellow-900 border border-yellow-100">
                <p className="text-sm font-semibold">2. Approved</p>
                <p className="text-xs text-slate-600">Assign a collector next.</p>
              </div>
              <div className="rounded-2xl p-4 bg-orange-50 text-orange-900 border border-orange-100">
                <p className="text-sm font-semibold">3. Assigned</p>
                <p className="text-xs text-slate-600">Collector is ready and ETA is set.</p>
              </div>
              <div className="rounded-2xl p-4 bg-blue-50 text-blue-900 border border-blue-100">
                <p className="text-sm font-semibold">4. On the Way</p>
                <p className="text-xs text-slate-600">Collector is en route.</p>
              </div>
              <div className="rounded-2xl p-4 bg-slate-50 text-slate-900 border border-slate-100">
                <p className="text-sm font-semibold">5. Completed</p>
                <p className="text-xs text-slate-600">Pickup finished and feedback available.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`grid gap-4 mb-10 ${darkMode ? "text-white" : "text-slate-900"}`}>
          <div className={`rounded-3xl p-6 ${darkMode ? "bg-slate-900 border border-slate-700" : "bg-white shadow"}`}>
            <h3 className="text-xl font-semibold mb-4">Management action center</h3>
            <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              Use this panel to approve new pickups, assign collection teams, and mark pickups complete.
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl p-4 bg-green-50 text-green-900 border border-green-100">
                <p className="text-sm font-semibold mb-3">Pending approvals</p>
                {pickups.filter((pickup) => pickup.status === "Pending").slice(0, 3).map((pickup) => (
                  <div key={pickup.id} className="mb-4 last:mb-0">
                    <div className="font-medium">{pickup.name}</div>
                    <div className="text-xs text-slate-600">{pickup.location}</div>
                    <button
                      onClick={() => approvePickup(pickup.id)}
                      className="mt-2 inline-flex items-center rounded-full bg-green-600 text-white px-3 py-1 text-xs"
                    >
                      Approve
                    </button>
                  </div>
                ))}
                {pickups.filter((pickup) => pickup.status === "Pending").length === 0 && (
                  <p className="text-xs text-slate-500">No pending requests.</p>
                )}
              </div>
              <div className="rounded-2xl p-4 bg-yellow-50 text-yellow-900 border border-yellow-100">
                <p className="text-sm font-semibold mb-3">Ready to assign</p>
                {pickups.filter((pickup) => pickup.status === "Approved").slice(0, 3).map((pickup) => (
                  <div key={pickup.id} className="mb-4 last:mb-0">
                    <div className="font-medium">{pickup.name}</div>
                    <div className="text-xs text-slate-600">{pickup.location}</div>
                    <button
                      onClick={() => assignPickup(pickup)}
                      className="mt-2 inline-flex items-center rounded-full bg-yellow-600 text-white px-3 py-1 text-xs"
                    >
                      Assign team
                    </button>
                  </div>
                ))}
                {pickups.filter((pickup) => pickup.status === "Approved").length === 0 && (
                  <p className="text-xs text-slate-500">No approved pickups.</p>
                )}
              </div>
              <div className="rounded-2xl p-4 bg-blue-50 text-blue-900 border border-blue-100">
                <p className="text-sm font-semibold mb-3">Complete pickup</p>
                {pickups.filter((pickup) => pickup.status === "Assigned" || pickup.status === "On the Way").slice(0, 3).map((pickup) => (
                  <div key={pickup.id} className="mb-4 last:mb-0">
                    <div className="font-medium">{pickup.name}</div>
                    <div className="text-xs text-slate-600">{pickup.location}</div>
                    <button
                      onClick={() => completePickup(pickup.id)}
                      className="mt-2 inline-flex items-center rounded-full bg-blue-600 text-white px-3 py-1 text-xs"
                    >
                      Mark completed
                    </button>
                  </div>
                ))}
                {pickups.filter((pickup) => pickup.status === "Assigned" || pickup.status === "On the Way").length === 0 && (
                  <p className="text-xs text-slate-500">No active pickups.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-center text-green-500 mb-6">Loading...</p>
        )}

        {actionError && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
            {actionError}
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card title="Total Pickups" value={stats.total} darkMode={darkMode} />
          <Card title="Plastic" value={stats.plastic} darkMode={darkMode} />
          <Card title="Paper" value={stats.paper} darkMode={darkMode} />
          <Card title="Metal" value={stats.metal} darkMode={darkMode} />
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <Card title="Pending" value={statusCounts.Pending} darkMode={darkMode} />
          <Card title="Approved" value={statusCounts.Approved} darkMode={darkMode} />
          <Card title="Assigned" value={statusCounts.Assigned} darkMode={darkMode} />
          <Card title="On the Way" value={statusCounts["On the Way"]} darkMode={darkMode} />
          <Card title="Completed" value={statusCounts.Completed} darkMode={darkMode} />
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LINE CHART */}
          <div className={`p-6 rounded-3xl ${darkMode ? "bg-white/5" : "bg-white"}`}>
            <h3 className="text-2xl font-bold mb-4">Pickup Trend</h3>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData.length ? lineData : lineData.concat([{ month: "No data", pickups: 0 }])}>
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

        {/* ASSIGNMENT MODAL */}
        {showAssignModal && selectedPickup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className={`relative max-w-lg w-full p-6 rounded-3xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
              <button
                className="absolute top-4 right-4 text-gray-500"
                onClick={closeAssignModal}
              >
                ✕
              </button>
              <h3 className="text-3xl font-bold mb-4">Assign / Update Collector</h3>
              <p className="text-sm text-gray-500 mb-6">
                Assign or update collector details for <strong>{selectedPickup.name}</strong> at <strong>{selectedPickup.location}</strong>.
              </p>
              {selectedPickup.collector_name && (
                <div className="mb-4 text-sm text-slate-500">
                  Current collector: <strong>{selectedPickup.collector_name}</strong>
                  {selectedPickup.collector_email ? ` (${selectedPickup.collector_email})` : ""}
                  {selectedPickup.eta ? ` — ETA: ${selectedPickup.eta}` : ""}
                </div>
              )}

              <form onSubmit={submitAssign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Collector Name</label>
                  <input
                    className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`}
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="Collector name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Collector Email</label>
                  <input
                    className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`}
                    value={collectorEmail}
                    onChange={(e) => setCollectorEmail(e.target.value)}
                    placeholder="Collector email"
                    type="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ETA</label>
                  <input
                    className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50"}`}
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="ETA or expected arrival"
                  />
                </div>

                {assignError && <p className="text-sm text-red-500">{assignError}</p>}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-slate-300"
                    onClick={closeAssignModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">
                    Assign Collector
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        <div className={`mt-12 p-6 rounded-3xl ${darkMode ? "bg-white/5" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Admin Notifications</h3>
            {!notificationsLoading && (
              <span className="text-sm text-gray-500">
                {notifications.filter((n) => !n.is_read).length} unread
              </span>
            )}
          </div>

          {notificationsLoading ? (
            <p className="text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.is_read
                      ? "border-slate-200 bg-slate-50"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-gray-600 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="text-sm text-green-700 font-semibold"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <th className="text-left py-3">Approval / Assignment</th>
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

                  <td className="space-x-2">
                    {pickup.status === "Pending" && (
                      <button
                        onClick={() => approvePickup(pickup.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                    )}
                    {pickup.status === "Approved" && (
                      <button
                        onClick={() => assignPickup(pickup)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Assign
                      </button>
                    )}
                    {pickup.status === "Assigned" && (
                      <button
                        onClick={() => startPickup(pickup.id)}
                        className="bg-orange-600 text-white px-3 py-1 rounded"
                      >
                        On the Way
                      </button>
                    )}
                    {pickup.status === "Completed" && (
                      <span className="text-sm text-gray-500">Done</span>
                    )}
                  </td>

                  <td>
                    {(pickup.status === "Assigned" || pickup.status === "On the Way") ? (
                      <button
                        onClick={() => completePickup(pickup.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
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
