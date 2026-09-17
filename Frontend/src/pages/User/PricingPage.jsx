import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "../../store/Patient/authStore";
import {
  FiCheck,
  FiX,
  FiChevronDown,
  FiShield,
  FiUsers,
  FiUploadCloud,
  FiActivity,
  FiStar,
  FiZap,
  FiHeart,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Fallback prevents requests like ".../undefined/api/..." when env is missing or mis-set.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-sih.onrender.com";

/* ─────────────────────────── data ─────────────────────────── */

const plans = [
  {
    name: "Free",
    tagline: "Get started with essentials",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: FiHeart,
    color: "from-slate-500 to-slate-600",
    cardBg: "bg-white",
    ring: "ring-gray-200",
    cta: "Get Started Free",
    ctaStyle: "bg-gray-900 hover:bg-gray-800 text-white",
    planKey: "free",
    features: [
      "50 MB cloud storage",
      "Basic health records",
      "Emergency folder (limited)",
      "Email support",
      "Unlimited digital prescriptions",
    ],
  },
  {
    name: "Pro",
    tagline: "For individuals who want more",
    monthlyPrice: 11,
    annualPrice: 92,
    savePct: 30,
    icon: FiZap,
    popular: true,
    color: "from-[#252A61] to-[#4318FF]",
    cardBg: "bg-white",
    ring: "ring-[#252A61]/30",
    cta: "Buy Pro Plan",
    ctaStyle: "bg-[#252A61] hover:bg-[#3b3b98] text-white",
    planKey: "pro",
    features: [
      "500 MB cloud storage",
      "Full health records & analytics",
      "Emergency folder (full)",
      "Priority email & chat support",
      "Unlimited digital prescriptions",
      "Prescription reminders",
      "Share reports with doctors",
      "Family Vault — up to 3 members (1+2)",
    ],
  },
  {
    name: "Premium",
    tagline: "Complete family healthcare",
    monthlyPrice: 399,
    annualPrice: 3112,
    savePct: 35,
    icon: FiStar,
    color: "from-amber-500 to-orange-600",
    cardBg: "bg-white",
    ring: "ring-amber-300/40",
    cta: "Go Premium",
    ctaStyle:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white",
    planKey: "premium",
    features: [
      "Everything in Pro + 2 GB storage",
      "Family Vault — up to 7 members (1+6)",
      "AI health insights & trends",
      "Video consultations (coming soon)",
      "Dedicated account manager",
      "Advanced data export (PDF/CSV)",
      "Priority 24/7 support",
      "Early access to new features",
    ],
  },
];

const comparisonFeatures = [
  { name: "Storage", free: "50 MB", pro: "500 MB", premium: "2 GB" },
  { name: "Health Records", free: "Basic", pro: "Full + Analytics", premium: "Full + Analytics" },
  { name: "Emergency Folder", free: "Limited", pro: true, premium: true },
  { name: "Digital Prescriptions", free: "Unlimited", pro: "Unlimited", premium: "Unlimited" },
  { name: "Prescription Reminders", free: false, pro: true, premium: true },
  { name: "Share Reports with Doctors", free: false, pro: true, premium: true },
  { name: "Family Vault Members", free: false, pro: "Up to 3 (1+2)", premium: "Up to 7 (1+6)" },
  { name: "AI Health Insights", free: false, pro: false, premium: true },
  { name: "Video Consultations", free: false, pro: false, premium: "Coming Soon" },
  { name: "Data Export (PDF/CSV)", free: false, pro: "Basic", premium: "Advanced" },
  { name: "Support Level", free: "Email", pro: "Priority", premium: "24/7 Priority" },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get instant access to new features. When downgrading, your current plan benefits remain active until the end of your billing cycle.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "We offer a 14-day free trial for the Pro plan so you can explore all features before committing. No credit card required to start.",
  },
  {
    q: "How does the Family Vault work?",
    a: "Family Vault lets you manage medical records for your family members under one account. The head member can invite family members via their UMID, and each member's data remains private and secure with OTP-verified access.",
  },
  {
    q: "Are my medical records secure?",
    a: "Absolutely. We use end-to-end encryption, secure cloud storage (AWS S3), and comply with healthcare data protection standards. Your data is never shared without your explicit consent.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through Razorpay.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from your account settings. You'll continue to have access to your paid features until the end of your current billing period.",
  },
];

/* ─────────────────────── components ───────────────────────── */

const ToggleSwitch = ({ isAnnual, onToggle }) => (
  <div className="flex items-center justify-center gap-3 sm:gap-4">
    <span
      className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
        !isAnnual ? "text-gray-900" : "text-gray-400"
      }`}
    >
      Monthly
    </span>
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#252A61]/40 focus:ring-offset-2 ${
        isAnnual ? "bg-[#252A61]" : "bg-gray-300"
      }`}
      aria-label="Toggle billing period"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 sm:top-1 w-6 h-6 sm:w-6 sm:h-6 bg-white rounded-full shadow-md ${
          isAnnual ? "left-[calc(100%-1.625rem)] sm:left-[calc(100%-1.75rem)]" : "left-0.5 sm:left-1"
        }`}
      />
    </button>
    <span
      className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
        isAnnual ? "text-gray-900" : "text-gray-400"
      }`}
    >
      Annual
    </span>
    {isAnnual && (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"
      >
        Save up to 35%
      </motion.span>
    )}
  </div>
);

const PricingCard = ({ plan, isAnnual, index, onBuyNow, loadingPlan }) => {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const period = isAnnual ? "/year" : "/month";
  const Icon = plan.icon;
  const isLoading = loadingPlan === plan.planKey;
  const isFree = plan.monthlyPrice === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      aria-label={`${plan.name} plan`}
      className={`relative flex flex-col rounded-2xl sm:rounded-3xl border ${
        plan.popular
          ? "border-[#252A61]/20 shadow-xl shadow-[#252A61]/10"
          : "border-gray-200 shadow-lg shadow-gray-100/80"
      } ${plan.cardBg} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#252A61] to-[#4318FF]" />
      )}
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute -top-px right-4 sm:right-6"
        >
          <div className="bg-gradient-to-r from-[#252A61] to-[#4318FF] text-white text-xs font-bold px-3 py-1.5 rounded-b-lg shadow-lg">
            Most Popular
          </div>
        </motion.div>
      )}

      <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {plan.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{plan.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-end gap-1.5">
            {price === 0 ? (
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
                Free
              </span>
            ) : (
              <>
                <span className="text-base sm:text-lg font-medium text-gray-500 mb-1">
                  ₹
                </span>
                <motion.span
                  key={price}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-none"
                >
                  {price.toLocaleString("en-IN")}
                </motion.span>
                <span className="text-sm sm:text-base text-gray-400 mb-1">
                  {period}
                </span>
              </>
            )}
          </div>
          {isAnnual && plan.monthlyPrice > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-400 line-through"
              >
                ₹{(plan.monthlyPrice * 12).toLocaleString("en-IN")}/year
              </motion.p>
              {plan.savePct && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700"
                >
                  {plan.savePct}% OFF
                </motion.span>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 sm:space-y-3.5 mb-8 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  plan.popular
                    ? "bg-[#252A61]/10 text-[#252A61]"
                    : plan.name === "Premium"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <FiCheck className="w-3 h-3" strokeWidth={3} />
              </div>
              <span className="text-sm sm:text-[15px] text-gray-600 leading-snug">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isFree ? (
          <Link
            to="/signup"
            className={`w-full py-3 sm:py-3.5 rounded-xl text-center text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 block ${plan.ctaStyle}`}
          >
            {plan.cta}
            <FiArrowRight className="inline-block ml-2 w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={() => onBuyNow(plan, isAnnual)}
            disabled={!!loadingPlan}
            className={`w-full py-3 sm:py-3.5 rounded-xl text-center text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 ${plan.ctaStyle}`}
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                {plan.cta}
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.article>
  );
};

const ComparisonCell = ({ value }) => {
  if (value === true) {
    return (
      <div className="w-6 h-6 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <FiCheck className="w-3.5 h-3.5" strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 mx-auto rounded-full bg-gray-100 text-gray-300 flex items-center justify-center">
        <FiX className="w-3.5 h-3.5" strokeWidth={3} />
      </div>
    );
  }
  return (
    <span className="text-sm font-medium text-gray-700">{value}</span>
  );
};

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-200 hover:border-gray-300">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left bg-white hover:bg-gray-50/50 transition-colors"
    >
      <span className="text-sm sm:text-base font-semibold text-gray-800 pr-4">
        {item.q}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0"
      >
        <FiChevronDown className="w-5 h-5 text-gray-400" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="px-5 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-[15px] text-gray-500 leading-relaxed">
            {item.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─────────────────────── main page ────────────────────────── */

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUserData } = useAuthStore();
  const baseUrl = "https://www.medicares.in";
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing - Medicare",
    url: `${baseUrl}/pricing`,
    description:
      "Affordable Medicare health plans with transparent pricing. Choose the plan that fits your needs.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: plans.map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} Plan`,
        description: plan.tagline,
        price: String(plan.monthlyPrice),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `${baseUrl}/pricing`,
      })),
    },
  };

  const handleBuyNow = useCallback(
    async (plan, annual) => {
      if (!isAuthenticated) {
        toast.error("Please log in to purchase a plan.");
        navigate("/login");
        return;
      }

      setLoadingPlan(plan.planKey);

      try {
        // 1️⃣ Create Razorpay order on backend (axios interceptor auto-adds auth token)
        const { data } = await axios.post(
          `${API_URL}/api/payment/create-order`,
          {
            planName: plan.planKey,
            billingCycle: annual ? "annual" : "monthly",
          }
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to create order");
        }

        // 2️⃣ Open Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Medicare",
          description: `${plan.name} Plan — ${annual ? "Annual" : "Monthly"}`,
          order_id: data.orderId,
          handler: async function (response) {
            // 3️⃣ Verify payment on backend
            try {
              const verifyRes = await axios.post(
                `${API_URL}/api/payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }
              );

              if (verifyRes.data.success) {
                toast.success(
                  verifyRes.data.message || "Payment successful! Plan upgraded 🎉",
                  { duration: 5000 }
                );
                // Refresh user data so UI immediately reflects the new plan
                try {
                  await refreshUserData();
                } catch (refreshErr) {
                  console.warn("Could not refresh user data after payment:", refreshErr);
                }
              } else {
                toast.error("Payment verification failed. Please contact support.");
              }
            } catch (verifyErr) {
              console.error("Verification error:", verifyErr);
              toast.error(
                "Payment was received but verification failed. Please contact support."
              );
            } finally {
              setLoadingPlan(null);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#252A61",
          },
          modal: {
            ondismiss: function () {
              setLoadingPlan(null);
              toast("Payment cancelled.", { icon: "ℹ️" });
            },
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
          setLoadingPlan(null);
          console.error("Payment failed:", response.error);
          toast.error(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        });

        razorpay.open();
      } catch (error) {
        setLoadingPlan(null);
        console.error("Order creation error:", error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error(
            error.response?.data?.message ||
              "Something went wrong. Please try again."
          );
        }
      }
    },
    [navigate, isAuthenticated, user, refreshUserData]
  );

  return (
    <>
      <Helmet>
        <title>Pricing Plans | Medicare - Affordable Health Coverage India</title>
        <meta
          name="description"
          content="Explore Medicare pricing plans starting at INR 0/month. Transparent pricing for individuals and families."
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pricing | Medicare" />
        <meta
          property="og:description"
          content="Affordable health plans with clear pricing. Choose the right plan for you."
        />
        <meta property="og:url" content={`${baseUrl}/pricing`} />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />
        <link rel="canonical" href={`${baseUrl}/pricing`} />
        <script type="application/ld+json">
          {JSON.stringify(pricingSchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-8 pb-4 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#252A61]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252A61]/10 text-[#252A61] text-xs sm:text-sm font-semibold mb-4 sm:mb-5">
              <FiShield className="w-3.5 h-3.5" />
              Transparent Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Choose the{" "}
              <span className="bg-gradient-to-r from-[#252A61] to-[#4318FF] bg-clip-text text-transparent">
                right plan
              </span>{" "}
              for you
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl mx-auto text-base sm:text-lg text-gray-500 leading-relaxed">
              Start for free, upgrade when you need to. All plans include secure
              cloud storage and access to your medical records anytime, anywhere.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 sm:mt-10"
          >
            <ToggleSwitch
              isAnnual={isAnnual}
              onToggle={() => setIsAnnual(!isAnnual)}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section
        className="relative -mt-2 sm:-mt-4 pb-12 sm:pb-16 lg:pb-20"
        aria-label="Pricing plans"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-sm md:max-w-none mx-auto">
            {plans.map((plan, i) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                isAnnual={isAnnual}
                index={i}
                onBuyNow={handleBuyNow}
                loadingPlan={loadingPlan}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="bg-gray-50/80 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Compare all features
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              See exactly what's included in each plan to find the best fit for your needs.
            </p>
          </motion.div>

          {/* Mobile: toggle to show/hide */}
          <div className="lg:hidden text-center mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow transition-all"
            >
              {showComparison ? "Hide" : "Show"} comparison table
              <motion.div
                animate={{ rotate: showComparison ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
          </div>

          <AnimatePresence>
            {(showComparison || typeof window !== "undefined") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className={`overflow-hidden ${
                  !showComparison ? "hidden lg:block" : ""
                }`}
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 sm:px-6 py-4 sm:py-5 text-sm font-semibold text-gray-500 w-[40%]">
                          Features
                        </th>
                        <th className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                          <span className="text-sm font-bold text-gray-700">Free</span>
                        </th>
                        <th className="px-3 sm:px-6 py-4 sm:py-5 text-center bg-[#252A61]/[0.03]">
                          <span className="text-sm font-bold text-[#252A61]">
                            Pro
                          </span>
                          <span className="block text-[10px] text-[#252A61]/60 font-medium mt-0.5">
                            Popular
                          </span>
                        </th>
                        <th className="px-3 sm:px-6 py-4 sm:py-5 text-center">
                          <span className="text-sm font-bold text-amber-600">Premium</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((row, i) => (
                        <tr
                          key={i}
                          className={`border-b border-gray-100 last:border-b-0 ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm text-gray-700 font-medium">
                            {row.name}
                          </td>
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-center">
                            <ComparisonCell value={row.free} />
                          </td>
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-center bg-[#252A61]/[0.02]">
                            <ComparisonCell value={row.pro} />
                          </td>
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-center">
                            <ComparisonCell value={row.premium} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-10 sm:py-14 lg:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: FiShield,
                title: "Secure & Private",
                desc: "End-to-end encrypted",
              },
              {
                icon: FiUploadCloud,
                title: "Cloud Storage",
                desc: "Access from anywhere",
              },
              {
                icon: FiUsers,
                title: "Family Vault",
                desc: "Manage for loved ones",
              },
              {
                icon: FiActivity,
                title: "Health Insights",
                desc: "AI-powered analytics",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#252A61]/10 to-indigo-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#252A61]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500">
              Can't find what you're looking for?{" "}
              <Link
                to="/aboutus"
                className="text-[#252A61] font-medium hover:underline"
              >
                Contact us
              </Link>
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.05 }}
              >
                <FAQItem
                  item={item}
                  isOpen={openFAQ === i}
                  onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#252A61] to-[#4318FF]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Ready to take control of your{" "}
              <span className="text-amber-300">health records</span>?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
              Join thousands of patients who trust Medicare to store, manage, and
              share their medical records securely.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#252A61] font-bold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link
                to="/aboutus"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PricingPage;
