"use client";

import { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Stats from "./Stats";
import Services from "./Services";
import Dashboard from "./Dashboard";
import Footer from "./Footer";
import Reveal from "./Reveal";
import HowItWorks from "./HowItworks";
import Testimonials from "./Testimonials";
import Impact from "./Impact";
import CallToAction from "./CallToAction";
import ScrollToTop from "./ScrollToTop";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [token, setToken] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  /* ---------------- LOAD SESSION ---------------- */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // Prefer DOM form values (more reliable for UI typing timing), then fallback to React state
    const form = e.target;
    const formData = new FormData(form);
    const payload = {
      email: (formData.get("email") || loginData.email || "").toString().trim().toLowerCase(),
      password: (formData.get("password") || loginData.password || "").toString(),
    };
    // client-side validation
    if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      setLoginError("Please enter a valid email address");
      return;
    }
    if (!payload.password || payload.password.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return;
    }

    setLoginError("");
    setLoginLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setShowLogin(false);
      setLoginError("");
      setLoginSuccess("Login successful");

      // redirect/anchor to dashboard
      try {
        window.location.hash = '#dashboard';
      } catch (e) {}
    } else {
      setLoginError(data.error || "Invalid credentials");
      setLoginSuccess("");
    }

  } catch (err) {
    console.error(err);
  }
  finally {
    setLoginLoading(false);
  }
};
  /* ---------------- REGISTER ---------------- */
  const handleRegister = async (e) => {
  e.preventDefault();

  try {
    // Use React state but fall back to actual form DOM values when needed
    const form = e.target;
    const formData = new FormData(form);
    const payload = {
      name: registerData.name || formData.get("name") || "",
      email: registerData.email || formData.get("email") || "",
      phone: registerData.phone || formData.get("phone") || "",
      password: registerData.password || formData.get("password") || "",
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      setRegisterError("");
      setRegisterSuccess("Account created successfully");
      setShowRegister(false);
      setShowLogin(true);
      // reset register form state
      setRegisterData({ name: "", email: "", phone: "", password: "" });
    } else {
      setRegisterError(data.error || data.message || "Registration failed");
      setRegisterSuccess("");
    }
  } catch (err) {
    console.error(err);
  }
};
  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setShowLogin(false);
    setShowRegister(false);
  };

  // Close modals on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowRegister(false);
        setShowSchedule(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSchedule = () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setShowLogin(true);
      setShowRegister(false);
      return;
    }
    setShowSchedule(true);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setScheduleError("");
    setScheduleSuccess("");
    setScheduleLoading(true);

    try {
      const form = e.target;
      const fd = new FormData(form);
      const payload = {
        name: (fd.get("name") || "").toString(),
        wasteType: (fd.get("wasteType") || "Other").toString(),
        quantity: (fd.get("quantity") || "").toString(),
        location: (fd.get("location") || "").toString(),
      };

      const token = localStorage.getItem("token");
      if (!token) {
        setScheduleError("You must be logged in to schedule a pickup.");
        setShowLogin(true);
        setShowSchedule(false);
        return;
      }

      const res = await fetch("/api/pickups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to schedule pickup");
      }

      const data = await res.json();
      setScheduleSuccess("Pickup scheduled successfully");
      setShowSchedule(false);
      // refresh dashboard
      try { window.location.reload(); } catch (e) {}
    } catch (err) {
      console.error(err);
      setScheduleError(err.message || "Server error");
    } finally {
      setScheduleLoading(false);
    }
  };


  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* NAVBAR */}
      <Reveal>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogin={() => {
            setShowLogin(true);
            setShowRegister(false);
          }}
          onRegister={() => {
            setShowRegister(true);
            setShowLogin(false);
          }}
          onLogout={handleLogout}
          isLoggedIn={!!token}
        />
      </Reveal>

      {/* HERO */}
      <Reveal>
        <Hero darkMode={darkMode} onGetStarted={() => { setShowRegister(true); setShowLogin(false); }} onSchedule={() => openSchedule()} />
      </Reveal>

      {/* HowItWorks */}
      <Reveal>
        <HowItWorks darkMode={darkMode} />
        </Reveal>
      <Reveal>
        <CallToAction darkMode={darkMode} onGetStarted={() => { setShowRegister(true); setShowLogin(false); }} onSchedule={() => openSchedule()} />
      </Reveal>
      <Reveal>
        <Stats darkMode={darkMode} />
      </Reveal>

      {/* SERVICES */}
      <Reveal>
        <Services darkMode={darkMode} />
      </Reveal>
      
      {/* TESTIMONIALS */}
      <Reveal>
        <Testimonials darkMode={darkMode} />
      </Reveal>

      {/* REGISTER FORM (MODAL) */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegister(false)} />
          <div className={`relative max-w-md w-full p-8 rounded-xl shadow z-10 ${
            darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-900"
          }`}>
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowRegister(false)}>✕</button>
            <h2 className="text-3xl font-bold mb-6">Create Account</h2>

            <form className="space-y-4" onSubmit={handleRegister}>
              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="name"
                placeholder="Full Name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
              />

              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />

              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="phone"
                placeholder="Phone"
                value={registerData.phone}
                onChange={(e) =>
                  setRegisterData({ ...registerData, phone: e.target.value })
                }
              />

              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="password"
                placeholder="Password"
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
              />

              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded">
                Register
              </button>
              {registerError && (
                <p className="text-red-500 mt-2">{registerError}</p>
              )}
              {registerSuccess && (
                <p className="text-green-600 mt-2">{registerSuccess}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* LOGIN FORM (MODAL) */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogin(false)} />
          <div className={`relative max-w-md w-full p-8 rounded-xl shadow z-10 ${
            darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-900"
          }`}>
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowLogin(false)}>✕</button>
            <h2 className="text-3xl font-bold mb-6">Login</h2>

            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
              />

              <input
                className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`}
                name="password"
                placeholder="Password"
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded flex items-center justify-center gap-2"
                disabled={loginLoading}
              >
                {loginLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{loginLoading ? "Logging in..." : "Login"}</span>
              </button>
              {loginError && (
                <p className="text-red-500 mt-2">{loginError}</p>
              )}
              {loginSuccess && (
                <p className="text-green-600 mt-2">{loginSuccess}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE PICKUP (MODAL) */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSchedule(false)} />
          <div className={`relative max-w-md w-full p-8 rounded-xl shadow z-10 ${
            darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-900"
          }`}>
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowSchedule(false)}>✕</button>
            <h2 className="text-3xl font-bold mb-6">Schedule Pickup</h2>

            <form className="space-y-4" onSubmit={handleSchedule}>
              <input className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`} name="name" placeholder="Full Name" />
              <select className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`} name="wasteType">
                <option>Plastic</option>
                <option>Paper</option>
                <option>Metal</option>
                <option>Organic</option>
                <option>Other</option>
              </select>
              <input className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`} name="quantity" placeholder="Quantity (e.g. 2 bags)" />
              <input className={`w-full border p-3 rounded ${darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}`} name="location" placeholder="Pickup location / address" />

              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded" disabled={scheduleLoading}>{scheduleLoading ? 'Scheduling...' : 'Schedule Pickup'}</button>

              {scheduleError && <p className="text-red-500 mt-2">{scheduleError}</p>}
              {scheduleSuccess && <p className="text-green-600 mt-2">{scheduleSuccess}</p>}
            </form>
          </div>
        </div>
      )}

      {/*DASHBOARD*/}
      <Reveal>
        {token ? (
  <Dashboard darkMode={darkMode} />
) : (
  <div className={`text-center py-20 ${darkMode ? "bg-slate-950 text-gray-300" : "text-gray-500"}`}>
    Please login to view dashboard
  </div>
)}
      </Reveal>

      {/* IMPACT */}
      <Reveal>
        <Impact darkMode={darkMode} />
      </Reveal>

      {/* FOOTER */}
      <Reveal>
        <Footer darkMode={darkMode} />
      </Reveal>
    </main>
  );
}
