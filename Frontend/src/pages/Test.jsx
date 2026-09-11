import React, { useState, useRef, useEffect } from "react";
import myVideo from "../assets/Email.mp4"; // Adjust the path as needed

const Test = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true); // Initially true for first-time sending

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setOtp(new Array(6).fill(""));
    setTimer(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    console.log("Resend OTP Triggered!"); // Replace with API call
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (e.key === "Delete") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      pastedData.split("").forEach((digit, idx) => {
        inputRefs.current[idx].value = digit;
      });
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-linear-to-b from-[#B8C5FD] to-[#E8C3D5]">
      <div className="w-[1700px] h-[900px] left-[110px] top-[10px] absolute opacity-60 bg-[#f0f7ff] rounded-[72px] blur-[3px] backdrop-blur-[100px]" />
      <div className="w-[1600px] h-[800px] opacity-60 absolute  rounded-[72px]  ">
        {/*blur-[3px]*/}
        {/* <img
          className="w-[686px] h-[800px]  left-5 top-5 absolute rounded-[75px]"
          src="https://placehold.co/686x800"
          alt="Login Image"
        /> */}
        <video
          className="w-[686px] h-[800px]  left-5 top-5 absolute rounded-[75px] shadow-2xl "
          autoPlay
          loop
          muted
        >
          <source src={myVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="w-[511.03px] h-[521px] absolute left-[55%] top-80 ">
        {/*change top left  */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-4xl text-[#252A61] font-bold font-['Montserrat Alternates'] mb-2">
            Verify Your Email
          </h2>
          <p className="text-1xl font-['Montserrat Alternates'] text-[#252A61]">
            Enter the 6-digit code sent to your email address
          </p>

          <div className="flex space-x-2" onPaste={handlePaste}>
            {otp.map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                className="w-[63px] h-[63px] text-center text-xl font-['Montserrat Alternates'] border rounded-md text-[#252A61] bg-[#f0f7ff] rounded-[50px] border-2 mt-2 mb-1"
                value={otp[index]}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="mt-4 mb-8">
            {canResend ? (
              <button className="text-black-600" onClick={handleResend}>
                Resend Code
              </button>
            ) : (
              <p className="text-gray-600">Resend Code in {timer}s</p>
            )}
          </div>

          <button
            type="submit"
            className="w-[250px] h-[60.4px] bg-[#252A61] text-white text-2xl font-semibold font-['Montserrat Alternates'] px-6 py-2 rounded-[50px] mt-4 hover:bg-[#252A80] transition"
            onClick={() => console.log("OTP Submitted:", otp.join(""))}
          >
            Verify Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
