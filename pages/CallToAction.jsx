"use client";

import { motion } from "framer-motion";

export default function CallToAction({ darkMode, onGetStarted, onSchedule }) {
  return (
    <section
      className={`py-24 px-6 transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            relative
            overflow-hidden
            rounded-[40px]
            p-12
            md:p-16
            bg-gradient-to-r
            from-green-600
            via-emerald-600
            to-green-700
            text-white
            shadow-2xl
          "
        >

          {/* Glow Effects */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">

            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
              Join The Movement
            </span>

            <h2 className="text-4xl md:text-6xl font-bold mt-6">
              Build A Cleaner Future
            </h2>

            <p className="mt-6 text-lg md:text-xl text-green-100 max-w-3xl mx-auto">
              Schedule waste pickups, monitor recycling impact,
              earn rewards, and contribute to sustainable communities.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">


              <button onClick={() => onGetStarted && onGetStarted()} className="
                bg-white
                text-green-700
                px-8
                py-4
                rounded-2xl
                font-bold
                hover:scale-105
                transition
                shadow-lg
              ">
                Get Started
              </button>

              <button onClick={() => onSchedule && onSchedule()} className="
                border
                border-white/40
                bg-white/10
                backdrop-blur-md
                px-8
                py-4
                rounded-2xl
                font-bold
                hover:bg-white/20
                transition
              ">
                Schedule Pickup
              </button>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}