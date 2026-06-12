"use client";

export default function UserDashboard({
  darkMode,
  userInfo,
  userPickups,
  userNotifications,
  userLoading,
  notificationsLoading,
}) {
  const pickups = Array.isArray(userPickups) ? userPickups : [];
  const notifications = Array.isArray(userNotifications) ? userNotifications : [];

  const statusCounts = {
    Pending: pickups.filter((pickup) => pickup.status === "Pending").length,
    Approved: pickups.filter((pickup) => pickup.status === "Approved").length,
    Assigned: pickups.filter((pickup) => pickup.status === "Assigned").length,
    "On the Way": pickups.filter((pickup) => pickup.status === "On the Way").length,
    Completed: pickups.filter((pickup) => pickup.status === "Completed").length,
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <section
      id="dashboard"
      className={`py-24 ${darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-black"}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span
            className={`inline-block px-4 py-2 rounded-full font-semibold ${
              darkMode
                ? "bg-slate-800 text-slate-200"
                : "bg-green-100 text-green-700"
            }`}
          >
            {userInfo?.isAdmin ? "User Dashboard" : "My Dashboard"}
          </span>
          <h2 className="text-5xl font-bold mt-4">
            Welcome back{userInfo?.name ? `, ${userInfo.name}` : ""}
          </h2>
          <p className={`mt-4 ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
            {userInfo?.isAdmin
              ? "You can view your personal pickup activity here, in addition to admin analytics."
              : "Track your pickup requests, statuses, and notifications from your account."}
          </p>
        </div>

        {userLoading ? (
          <p className="text-center text-green-500 mb-10">Loading your dashboard...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-5 gap-6 mb-10">
              <DashboardCard
                title="Your Pickups"
                value={pickups.length}
                darkMode={darkMode}
              />
              <DashboardCard
                title="Pending"
                value={statusCounts.Pending}
                darkMode={darkMode}
              />
              <DashboardCard
                title="Approved"
                value={statusCounts.Approved}
                darkMode={darkMode}
              />
              <DashboardCard
                title="Completed"
                value={statusCounts.Completed}
                darkMode={darkMode}
              />
              <DashboardCard
                title="Unread Notifications"
                value={unreadCount}
                darkMode={darkMode}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              <div className={`rounded-3xl p-6 ${darkMode ? "bg-slate-900 border border-slate-700" : "bg-white shadow"}`}>
                <h3 className="text-2xl font-bold mb-4">Recent Notifications</h3>
                {notificationsLoading ? (
                  <p className="text-gray-500">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-gray-500">No notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-2xl border ${
                          notification.is_read
                            ? darkMode
                              ? "border-slate-700 bg-slate-950"
                              : "border-slate-200 bg-slate-50"
                            : darkMode
                            ? "border-green-700 bg-green-950"
                            : "border-green-200 bg-green-50"
                        }`}
                      >
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`rounded-3xl p-6 ${darkMode ? "bg-slate-900 border border-slate-700" : "bg-white shadow"}`}>
                <h3 className="text-2xl font-bold mb-4">Your Pickups</h3>
                {pickups.length === 0 ? (
                  <p className="text-gray-500">You have not scheduled any pickups yet.</p>
                ) : (
                  <div className="space-y-4">
                    {pickups.slice(0, 5).map((pickup) => (
                      <div
                        key={pickup.id}
                        className={`rounded-2xl p-4 ${darkMode ? "bg-slate-950 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">{pickup.name}</p>
                            <p className="text-sm text-slate-400">{pickup.location}</p>
                          </div>
                          <span className="text-sm font-semibold text-green-600">{pickup.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{pickup.waste_type || "Waste pickup"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function DashboardCard({ title, value, darkMode }) {
  return (
    <div className={`p-6 rounded-3xl shadow-lg ${darkMode ? "bg-white/5" : "bg-white"}`}>
      <p className={darkMode ? "text-slate-300" : "text-slate-500"}>{title}</p>
      <p className="text-4xl font-bold text-green-500 mt-4">{value}</p>
    </div>
  );
}
