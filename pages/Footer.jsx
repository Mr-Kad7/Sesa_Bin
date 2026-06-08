"use client";

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaArrowUp,
} from "react-icons/fa";

export default function Footer({ darkMode }) {
  return (
    <footer
      id="contact"
      className={`pt-20 pb-10 transition-colors duration-500 ${
        darkMode
          ? "bg-black text-white"
          : "bg-slate-900 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP SECTION */}
        <div className="grid md:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/sesa-bin-logo.jpeg"
                alt="Sesa Bin logo"
                className="h-16 w-16 rounded-full object-cover"
              />
              <h2 className="text-3xl font-bold text-green-400">
                Sesa Bin
              </h2>
            </div>

            <p className="text-gray-400 mt-4 leading-relaxed">
              Smart waste collection and recycling platform
              helping communities stay cleaner and greener.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mt-6">

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition cursor-pointer">
                <FaFacebook />
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition cursor-pointer">
                <FaTwitter />
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition cursor-pointer">
                <FaInstagram />
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition cursor-pointer">
                <FaLinkedin />
              </div>

            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="font-bold text-lg mb-5">
              Company
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-green-400 cursor-pointer">
                About Us
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                Careers
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                Blog
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                Contact
              </li>
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="font-bold text-lg mb-5">
              Services
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>Pickup Scheduling</li>
              <li>Recycling Tracking</li>
              <li>Rewards Program</li>
              <li>Route Optimization</li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="font-bold text-lg mb-5">
              Newsletter
            </h3>

            <p className="text-gray-400 mb-4">
              Get sustainability updates directly to your inbox.
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-l-xl text-black outline-none"
              />

              <button className="bg-green-600 px-5 rounded-r-xl hover:bg-green-600 transition">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 mt-14 pt-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Sesa Bin. All rights reserved.
            </p>

            <a
              href="#home"
              className="
                flex items-center gap-2
                text-green-400
                hover:text-green-300
                transition
              "
            >
              Back to Top
              <FaArrowUp />
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}
