
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaInstagram } from 'react-icons/fa';
import Logo from "../assets/Logo/hand logo.png";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full bg-primary text-white pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-12 md:pb-8"
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Top footer with columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10 md:mb-12">
          {/* Column 1: About */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <img
                src={Logo}
                alt="Medicare Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover mr-2 sm:mr-3"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Medicare</h3>
            </div>
            <p className="text-white/70 text-sm sm:text-base md:text-sm leading-relaxed max-w-xs sm:max-w-md lg:max-w-none">
              Empowering individuals to take control of their health through
              accessible digital healthcare management.
            </p>
            <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6">
              {/* Social Media Icons */}
              <motion.a
                href="https://twitter.com/Medicares_india"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span className="sr-only">Twitter</span>
                <FaTwitter className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </motion.a>
              <motion.a
                href="https://instagram.com/medicaresindia"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </motion.a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="mt-6 sm:mt-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/aboutus" },
                { name: "Profile", path: "/profile" },
                { name: "Dashboard", path: "/dashboard" },
                { name: "Services", path: "/services" },
                { name: "Find Hospital", path: "/find-hospital" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <motion.li 
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-white transition-all duration-200 text-sm sm:text-base md:text-sm block py-1 hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="mt-6 sm:mt-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">Our Services</h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Report Management", path: "/reports" },
                { name: "Health Tips", path: "/services/health-tips" },
              ].map((service) => (
                <motion.li 
                  key={service.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={service.path}
                    className="text-white/70 hover:text-white transition-all duration-200 text-sm sm:text-base md:text-sm block py-1 hover:translate-x-1"
                  >
                    {service.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="mt-6 sm:mt-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">Contact Us</h3>
            <ul className="space-y-3 sm:space-y-4">
              <motion.li 
                className="flex items-center group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 mr-2 sm:mr-3 group-hover:text-white transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-white/70 text-sm sm:text-base md:text-sm group-hover:text-white transition-colors duration-200 break-all sm:break-normal">
                  support@medicares.in
                </span>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20 my-4 sm:my-6 md:my-8"></div>

        {/* Bottom footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6">
          <p className="text-xs sm:text-sm text-white/70 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Medicare. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                to="/privacy-policy"
                className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                to="/terms-of-service"
                className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                to="/cookie-policy"
                className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 