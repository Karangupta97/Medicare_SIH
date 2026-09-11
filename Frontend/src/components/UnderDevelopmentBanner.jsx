import React, { useState } from "react";
import {
  FaRocket,
  FaLaptopCode,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";

const UnderDevelopmentBanner = () => {
  const [showNotice, setShowNotice] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) {
    return null;
  }

  return (
    <section
      aria-label="Under Development Notice"
      className="relative bg-gradient-to-tr from-blue-700 via-indigo-700 to-purple-700 text-white rounded-2xl shadow-xl mx-2 sm:mx-8 my-4 sm:my-6 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row gap-3 sm:gap-4 border border-white/10 backdrop-blur-md"
    >
      {/* Close Button */}
      <button
        onClick={() => setShowBanner(false)}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close banner"
        type="button"
      >
        <FaTimes className="h-4 w-4 text-white hover:scale-110 transition-transform" />
      </button>

      {/* Left Section */}
      <div className="flex-1 w-full flex gap-3 sm:gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-400/20">
          <FaLaptopCode className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-300 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold">
              Website Under Development
            </h2>
            {/* <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              <FaRocket className="h-3 w-3 mr-1" />
              Expected Launch: September 2025
            </span> */}
          </div>

          <p className="text-sm text-white/90">
            We're building a next-generation healthcare platform for you.
            <br />
            <span className="italic text-yellow-100">
              All content is for demo and preview only.
            </span>
          </p>

          {/* Beta usage notice */}
          <div className="mt-2 mb-1 flex items-center gap-2 bg-blue-600/80 text-white text-xs sm:text-sm px-3 py-2 rounded-lg shadow">
            <FaInfoCircle className="mr-1 text-blue-200" />
            You can use this beta version to create your account and upload medical reports, but all data will be removed before the official launch.
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-pink-500/20 text-pink-200 border border-pink-400/30">
              <FaInfoCircle className="mr-1" /> Demo Data Only
            </span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <FaInfoCircle className="mr-1" /> Features May Change In Final
              Release
            </span>
          </div>

          {/* Notices */}
          <div className="mt-3 space-y-1 text-sm">
            <button
              className="flex items-center text-pink-200 focus:outline-none"
              onClick={() => setShowNotice((v) => !v)}
              aria-expanded={showNotice}
              aria-controls="important-notice-list"
              type="button"
            >
              <FaChevronDown
                className={`mr-2 text-pink-300 transition-transform duration-200 ${showNotice ? "rotate-0" : "-rotate-90"}`}
                aria-hidden="true"
              />
              <FaExclamationTriangle className="mr-2 text-pink-300" />
              <span className="font-bold">Important Notice:</span>
            </button>
            {showNotice && (
              <ul id="important-notice-list" className="pl-6 list-disc space-y-1">
                <li className="text-pink-100">
                  All numbers, statistics, and ratings are <u>not real</u> and are
                  for demonstration purposes only.
                </li>
                <li className="text-yellow-100">
                  Patient data, doctor profiles, and hospital information are{" "}
                  <strong>simulated</strong>.
                </li>
                <li className="text-blue-100">
                  Features, content, and design may{" "}
                  <strong>change at any time</strong> during development.
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Social Icons */}
      <div className="flex items-center sm:items-start gap-2 sm:gap-3 self-end sm:self-center mt-2 sm:mt-0">
        <a
          href="https://twitter.com/medicares_india"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Twitter"
        >
          <FaTwitter className="h-5 w-5 text-white hover:scale-110 transition-transform" />
        </a>
        <a
          href="https://instagram.com/medicaresindia"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Instagram"
        >
          <FaInstagram className="h-5 w-5 text-white hover:scale-110 transition-transform" />
        </a>
        <a
          href="mailto:support@medicares.in"
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Email"
        >
          <FaEnvelope className="h-5 w-5 text-white hover:scale-110 transition-transform" />
        </a>
      </div>
    </section>
  );
};

export default UnderDevelopmentBanner;
