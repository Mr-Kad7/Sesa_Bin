import { motion } from "framer-motion";

export default function Hero({ darkMode, onGetStarted, onSchedule }) {
  return (
    <section
      id="home"
      className={`relative overflow-hidden pt-36 pb-24 transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-900"
      }`}
    >

      {/* Background Glow 1 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      {/* Background Glow 2 */}
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      {/* Background Glow 3 */}
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🌱 Smart Waste Management Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Transforming Waste Into
            <span className="text-green-600">
              {" "}Sustainable Value
            </span>
          </h1>

          <p className={`mt-6 text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Schedule pickups, monitor recycling impact,
            earn rewards, and help create cleaner communities
            through technology.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">

            <button onClick={() => onGetStarted && onGetStarted()} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300">
  Get Started
</button>

<button onClick={() => onSchedule && onSchedule()} className={`border px-8 py-4 rounded-2xl font-semibold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"
}`}>
  Schedule Pickup
</button>

          </div>

          {/* SMALL STATS */}
          <div className="mt-10 flex gap-8">

            <div>
              <h3 className="text-3xl font-bold text-green-600">
                15K+
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-500"}>
                Pickups
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-600">
                120T
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-500"}>
                Recycled
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-600">
                50+
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-500"}>
                Communities
              </p>
            </div>

          </div>

        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >

          <img
            src="/images/hero.jpg"
            alt="Waste Management"
            className="rounded-3xl shadow-2xl w-full"
          />

          {/* FLOATING CARD 1 */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
            }}
            className={`absolute -top-6 -left-6 p-4 rounded-2xl shadow-xl ${
              darkMode ? "bg-slate-800 text-white" : "bg-white"
            }`}
          >
            <p className="text-gray-500 text-sm">
              Waste Collected
            </p>

            <h3 className="text-2xl font-bold text-green-600">
              120 Tons
            </h3>
          </motion.div>

          {/* FLOATING CARD 2 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className={`absolute bottom-6 -right-6 p-4 rounded-2xl shadow-xl ${
              darkMode ? "bg-slate-800 text-white" : "bg-white"
            }`}
          >
            <p className="text-gray-500 text-sm">
              Active Users
            </p>

            <h3 className="text-2xl font-bold text-green-600">
              8,000+
            </h3>
          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}
