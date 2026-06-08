"use client";

import { motion } from "framer-motion";

export default function Testimonials({ darkMode }) {
  const testimonials = [
    {
      name: "Kwame Mensah",
      role: "Resident",
      text: "Sesa Bin has completely changed how we manage waste in our community.",
    },
    {
      name: "Ama Boateng",
      role: "Business Owner",
      text: "Scheduling pickups is effortless and the dashboard gives excellent insights.",
    },
    {
      name: "Kofi Asare",
      role: "Community Leader",
      text: "Cleaner streets, happier residents, and better recycling rates.",
    },
  ];

  return (
    <section
      id="testimonials"
      className={`py-24 transition-colors duration-500 ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            Testimonials
          </span>

          <h2 className="text-5xl font-bold mt-6">
            What People Say
          </h2>

          <p
            className={`mt-4 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Trusted by communities and businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              className={`p-8 rounded-3xl border backdrop-blur-xl ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold">
                    {item.name}
                  </h3>

                  <p
                    className={`text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {item.role}
                  </p>
                </div>

              </div>

              <p
                className={`leading-relaxed ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                "{item.text}"
              </p>

              <div className="mt-6 text-yellow-400 text-xl">
                ⭐⭐⭐⭐⭐
              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}
