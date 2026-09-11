import React, { useState } from "react";

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
  </svg>
);

const PincodeLookup = () => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    setPin(value);
    setError("");
    setResult(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("Please enter a valid 6-digit PIN code.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/pincode/${pin}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "PIN code not found");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 flex items-center justify-center gap-2">
          <span role="img" aria-label="pin">📍</span> Indian PIN Code Lookup
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Find address details for any valid 6-digit Indian PIN code.</p>
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="pincode">
            Enter PIN Code
          </label>
          <div className="flex gap-2 items-center">
            <input
              id="pincode"
              type="text"
              maxLength={6}
              value={pin}
              onChange={handleChange}
              placeholder="e.g. 110001"
              className="flex-1 border border-blue-200 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              autoComplete="off"
              inputMode="numeric"
            />
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-semibold text-white transition bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={pin.length !== 6 || loading}
            >
              <span>Search</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </button>
          </div>
        </form>
        {loading && (
          <div className="flex flex-col items-center mt-6">
            <Spinner />
            <span className="text-blue-600 mt-2">Looking up PIN code...</span>
          </div>
        )}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-center animate-fade-in">
            <svg className="inline h-5 w-5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
            {error}
          </div>
        )}
        {result && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 animate-fade-in">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
              Address Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">State:</span> <span className="text-gray-900">{result.state}</span></div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">District:</span> <span className="text-gray-900">{result.district}</span></div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Office:</span> <span className="text-gray-900">{result.office}</span></div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Division:</span> <span className="text-gray-900">{result.division}</span></div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Region:</span> <span className="text-gray-900">{result.region}</span></div>
              <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Country:</span> <span className="text-gray-900">{result.country}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PincodeLookup;
