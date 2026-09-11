import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FiX, FiDownload, FiShare2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const QRCodeModal = ({ isOpen, onClose, userUmid, logo }) => {
  if (!isOpen) return null;

  // Use a frontend URL that will be properly handled by React Router
  const origin = window.location.origin;
  // Ensure we use a valid frontend route that will be handled by React Router
  const qrValue = `${origin}/emergency/${userUmid}`;

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    const a = document.createElement("a");
    a.download = `medicare-qr-${userUmid}.png`;
    a.href = canvas.toDataURL("image/png", 1.0);
    a.click();
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Medicare QR Code',
          text: 'Scan this QR code to access my Medicare information',
          url: qrValue,
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(qrValue);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="bg-white rounded-xl shadow-2xl p-5 md:p-6 max-w-sm w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-blue-100 p-1.5 rounded-lg mr-2">
                <img src={logo} alt="Medicare" className="w-5 h-5" />
              </span>
              Your Medicare QR
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <FiX size={20} />
            </motion.button>
          </div>
          <div className="flex justify-center mb-5">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-linear-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow-sm"
            >
              <QRCodeCanvas
                value={qrValue}
                size={240}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
                style={{ borderRadius: "10px" }}
                imageSettings={{
                  src: logo,
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                  radius: 8,
                }}
              />
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Scan this QR code to view your Emergency Folder (blood type, allergies, emergency contact, and selected reports). Share with responders in emergencies.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={downloadQRCode}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full"
              >
                <FiDownload className="mr-2" />
                Download QR
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={shareQRCode}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors w-full"
              >
                <FiShare2 className="mr-2" />
                Share Link
              </motion.button>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Medicare ID: <span className="font-semibold">{userUmid}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeModal;