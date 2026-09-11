import { FaBook, FaRunning, FaAppleAlt, FaUserAlt, FaPlus } from "react-icons/fa";

export default function BottomNavbar() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white px-6 py-4 rounded-full shadow-xl flex items-center gap-8 relative">
        {/* Left icons */}
        <FaBook className="text-gray-400 hover:text-blue-500 transition" size={22} />
        <FaRunning className="text-blue-600 transition" size={22} />

        {/* Floating central button */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
          <div className="bg-linear-to-br from-blue-500 to-indigo-500 p-4 rounded-full shadow-lg border-4 border-white">
            <FaPlus className="text-white" size={20} />
          </div>
        </div>

        {/* Right icons */}
        <FaAppleAlt className="text-gray-400 hover:text-blue-500 transition" size={22} />
        <FaUserAlt className="text-gray-400 hover:text-blue-500 transition" size={22} />
      </div>
    </div>
  );
}
