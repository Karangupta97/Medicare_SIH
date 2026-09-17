import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserMd, FaStethoscope, FaHeartbeat, FaNotesMedical } from "react-icons/fa";
import loginIllustration from "@/assets/Login.png";
import signupIllustration from "@/assets/Sing.png";

/**
 * Shared visual shell for the Aadhaar auth flows.
 *
 * Reuses the PAST email Login/Signup UI/UX EXACTLY:
 *  - Login  → form on the LEFT, illustration panel on the RIGHT (Login.png).
 *  - Signup → illustration panel on the LEFT, form on the RIGHT (Sing.png).
 *  - Same #F4F7FE backdrop + SVG pattern, mobile medical-icon grid, the
 *    #4318FF gradient feature overlay with side-specific feature copy + CTA,
 *    and the #2B3674 / #707EAE / #4318FF brand palette with framer-motion.
 *
 * Only the auth *logic* differs from the old pages — the look is identical.
 */

// Feature copy per side, matching the live medicares.in pages.
const SIGNIN_FEATURES = [
  ["Secure Access", "24/7 secure access to your medical records"],
  ["Appointment Management", "Schedule and manage your appointments"],
  ["Digital Records", "Access your complete medical history"],
  ["Prescription Management", "View and manage your prescriptions"],
  ["Billing & Insurance", "Track your medical bills and claims"],
  ["Health Tracking", "Monitor your health metrics"],
];

const SIGNUP_FEATURES = [
  ["Unique Medical ID", "Get your personal UID for seamless healthcare access"],
  ["Digital Medical Card", "Store blood group and emergency contact details"],
  ["QR Code Access", "Quick access to complete medical history via QR"],
  ["Emergency Access", "24/7 emergency contact information available"],
  ["Universal Access", "Use your UID at any healthcare facility"],
  ["Secure Records", "All medical history securely stored in QR"],
];

/** The purple illustration + feature-overlay panel (shared by both sides). */
function IllustrationPanel({ side }) {
  const isSignup = side === "signup";
  const features = isSignup ? SIGNUP_FEATURES : SIGNIN_FEATURES;
  const image = isSignup ? signupIllustration : loginIllustration;
  const ctaText = isSignup ? "Get your unique medical ID and digital card today!" : "Ready to take control of your healthcare journey?";
  const ctaLink = isSignup ? "Create Your Medical Profile" : "Get Started Today";
  const ctaTo = isSignup ? "/signup" : "/signup";

  return (
    <div className="hidden lg:flex lg:w-[55%] bg-white items-center justify-center relative">
      <div className="w-full max-w-4xl p-20">
        <div className="relative w-full h-full">
          <img src={image} alt="Medicare portal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="bg-linear-to-b from-[#4318FF]/70 via-[#4318FF]/50 to-[#4318FF]/30 backdrop-blur-[2px] w-full h-full rounded-[40px]">
              <div className="h-full flex flex-col justify-center px-12">
                <h2 className="text-[42px] font-bold text-white text-center tracking-tight mb-8 drop-shadow-lg">
                  Medicare Portal
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {[features.slice(0, 3), features.slice(3, 6)].map((col, ci) => (
                    <div key={ci} className="space-y-4">
                      {col.map(([title, desc]) => (
                        <div
                          key={title}
                          className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-[2px] border border-white/10"
                        >
                          <div className="w-2.5 h-2.5 bg-white rounded-full mt-2" />
                          <div>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">{title}</h3>
                            <p className="text-white/90 text-base mt-2 drop-shadow-sm">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-white/90 text-lg mb-4 drop-shadow-md">{ctaText}</p>
                  <Link
                    to={ctaTo}
                    className="inline-block bg-white/90 text-[#4318FF] px-8 py-3 rounded-2xl font-semibold text-base hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-[2px]"
                  >
                    {ctaLink}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AuthShell = ({ title, subtitle, error, children, footer, side = "signin" }) => {
  const isSignup = side === "signup";

  // The form column (used on either the left or right depending on side).
  const formColumn = (
    // The form column is the ONLY scrollable region — if a step (e.g. the PIN
    // keypad on a short screen) is taller than the card, it scrolls internally
    // while the page/card stay pinned to the viewport.
    <div className="w-full lg:w-[45%] p-6 sm:p-10 md:p-14 lg:p-20 flex items-center overflow-y-auto">
      <div className="max-w-[460px] mx-auto w-full py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-[28px] sm:text-[40px] font-bold text-[#2B3674] mb-3 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[16px] sm:text-[19px] text-[#707EAE] leading-relaxed">{subtitle}</p>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-3 sm:p-4 bg-red-50 text-red-700 rounded-[12px] sm:rounded-[16px] text-[14px] sm:text-[15px] border border-red-100 flex items-center gap-2"
              role="alert"
              aria-live="assertive"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5 sm:space-y-6">{children}</div>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center pt-6 sm:pt-8 text-[14px] sm:text-[16px] text-[#707EAE]"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    // h-screen + overflow-hidden pins the auth screen to the viewport so the
    // page itself never scrolls vertically.
    <div className="h-screen flex items-center justify-center bg-[#F4F7FE] p-2 sm:p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234318FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Mobile medical icon grid backdrop */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-linear-to-br from-[#4318FF]/3 via-[#4318FF]/5 to-transparent" />
        <div className="absolute inset-0 grid grid-cols-2 gap-3 p-4">
          {[
            { Icon: FaUserMd, label: "Medical Staff" },
            { Icon: FaStethoscope, label: "Health Check" },
            { Icon: FaHeartbeat, label: "Vital Signs" },
            { Icon: FaNotesMedical, label: "Medical Records" },
          ].map(({ Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <Icon className="text-2xl sm:text-3xl text-[#4318FF]" />
              </div>
              <span className="mt-2 text-xs sm:text-sm text-[#4318FF] font-medium">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        // Card fills the available height but is capped at the viewport (minus
        // outer padding) and clips overflow, so nothing pushes the page taller.
        className="w-full max-w-[1400px] h-full sm:h-[min(900px,calc(100vh-2rem))] flex bg-white rounded-none sm:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
        {/* Signup: illustration LEFT + form RIGHT. Login: form LEFT + illustration RIGHT. */}
        {isSignup ? (
          <>
            <IllustrationPanel side="signup" />
            {formColumn}
          </>
        ) : (
          <>
            {formColumn}
            <IllustrationPanel side="signin" />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthShell;
