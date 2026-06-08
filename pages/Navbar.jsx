import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({
  darkMode,
  setDarkMode,
  onLogin,
  onRegister,
  onLogout,
  isLoggedIn,
}) {
  const [isOpen, setIsOpen] = useState(false);
  console.log("Navbar loaded");
  console.log("isLoggedIn:", isLoggedIn);

  const links = [
    { name: "Home", href: "#home" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Services", href: "#services" },
    { name: "Impact", href: "#impact" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b shadow-lg transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950/90 border-slate-800 text-white"
          : "bg-white/80 border-white/20 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3 text-2xl font-extrabold text-green-600">
          <img
            src="/images/sesa-bin-logo.jpeg"
            alt="Sesa Bin logo"
            className="h-14 w-14 rounded-full object-cover"
          />
          Sesa Bin
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-6">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className="hover:text-green-600 transition"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* BUTTONS */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-xl border"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            onClick={onLogin}
            className="px-5 py-2 rounded-xl border border-green-600 text-green-600 hover:bg-green-50 transition"
          >
            Login
          </button>

          <button
             onClick={onRegister}
            className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition shadow-lg"
          >
            Register
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className={`md:hidden shadow-lg px-6 py-6 ${
          darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-700"
        }`}>
          <ul className="flex flex-col gap-5">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className="cursor-pointer hover:text-green-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={onLogin}
              className="border border-green-600 text-green-600 py-3 rounded-xl"
            >
              Login
            </button>

            <button
              onClick={onRegister}
              className="bg-green-600 text-white py-3 rounded-xl"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
