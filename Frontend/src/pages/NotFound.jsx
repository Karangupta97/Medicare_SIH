import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaHeartbeat,
  FaStethoscope,
  FaNotesMedical,
  FaHospital,
} from "react-icons/fa";

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate normalized position (-1 to 1) from center
        setMousePosition({
          x: (e.clientX - centerX) / (window.innerWidth / 2),
          y: (e.clientY - centerY) / (window.innerHeight / 2)
        });
      } else {
        setMousePosition({
          x: (e.clientX / window.innerWidth) - 0.5,
          y: (e.clientY / window.innerHeight) - 0.5
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Enhanced background with advanced medical-themed gradients */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100 z-0">
        {/* Larger, more refined background elements with parallax effect */}
        <div className="w-full h-full absolute inset-0 overflow-hidden">
          {/* Blue gradient blob with enhanced parallax */}
          <div 
            className="absolute w-[120%] h-[120%] top-[-20%] right-[-20%] bg-linear-to-br from-[#a1b5fa] to-accent opacity-50 rounded-full blur-[80px] transition-transform duration-200 ease-out"
            style={{ 
              transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
              filter: `hue-rotate(${mousePosition.x * 15}deg)`
            }}
          ></div>
          
          {/* Purple gradient blob with enhanced parallax */}
          <div 
            className="absolute w-full h-full bottom-[-10%] left-[-10%] bg-linear-to-tr from-purple-300 to-blue-200 opacity-50 rounded-full blur-[100px] transition-transform duration-200 ease-out"
            style={{ 
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
              filter: `hue-rotate(${mousePosition.y * -15}deg)`
            }}
          ></div>

          {/* Additional cyan blob with rotation effect */}
          <div 
            className="absolute w-[80%] h-[80%] top-[20%] left-[30%] bg-linear-to-tr from-cyan-200 to-indigo-200 opacity-40 rounded-full blur-[120px] transition-all duration-300 ease-out"
            style={{ 
              transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * 15}px) rotate(${mousePosition.x * 5}deg)`,
              filter: `brightness(${1 + Math.abs(mousePosition.x) * 0.2})`
            }}
          ></div>
          
          {/* Dynamic lighting effect based on mouse position */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 40}% ${50 + mousePosition.y * 40}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)`,
            }}
          ></div>
          
          {/* Enhanced floating particles with glow */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => {
              const size = Math.random() * 12 + 3;
              const isGlowing = Math.random() > 0.7;
              
              return (
                <div 
                  key={i}
                  className={`absolute rounded-full ${isGlowing ? 'animate-pulse-glow' : ''}`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    background: isGlowing 
                      ? `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(189,244,255,0.6) 40%, rgba(89,178,255,0) 70%)`
                      : 'rgba(255,255,255,0.4)',
                    boxShadow: isGlowing ? '0 0 8px 2px rgba(255,255,255,0.3)' : 'none',
                    animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    transform: `scale(${1 + Math.abs(mousePosition.x) * 0.2})`,
                    transition: 'transform 400ms ease-out'
                  }}
                ></div>
              );
            })}
          </div>
          
          {/* Enhanced background gradients for depth with animation */}
          <div className="absolute top-0 right-0 w-full h-60 bg-linear-to-b from-blue-200 to-transparent opacity-40 animate-breathe-light"></div>
          <div className="absolute bottom-0 left-0 w-full h-60 bg-linear-to-t from-purple-200 to-transparent opacity-40 animate-breathe-light animation-delay-300"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-60 bg-linear-to-tl from-indigo-300 to-transparent opacity-30 animate-breathe-light animation-delay-600"></div>
          <div className="absolute top-0 left-0 w-1/2 h-60 bg-linear-to-br from-blue-300 to-transparent opacity-30 animate-breathe-light animation-delay-900"></div>
        </div>
      </div>
      
      {/* Content container with improved elevation and animations */}
      <div 
        ref={containerRef}
        className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full px-4"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Enhanced medical cross symbol with better animations */}
        <div className="mb-6 transform hover:rotate-45 transition-transform duration-300 hover:shadow-xl">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#252A61] rounded-md flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="text-white text-4xl md:text-5xl font-bold relative z-10">+</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-indigo-500 animate-pulse-wave mix-blend-overlay"></div>
            </div>
          </div>
          <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-[#252A61] rounded-md opacity-30 blur-md animate-pulse"></div>
          <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-md opacity-50 blur-lg filter animate-ping-slow" style={{ background: 'rgba(79, 70, 229, 0.2)' }}></div>
        </div>

        {/* Main 404 display with enhanced visuals and animations */}
        <div 
          className="relative py-4 transform-gpu"
          style={{ 
            transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * -5}deg) translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 0)`,
            transition: 'transform 400ms ease-out'
          }}
        >
          {/* Medical icons around the 404 with enhanced styling and interactions */}
          <div className="absolute -top-12 -left-8 md:-left-16 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse hover:shadow-xl hover:scale-110 transition-all duration-300">
            <FaHeartbeat className="text-red-500 text-2xl md:text-3xl" />
            <div className="absolute inset-0 rounded-full border-2 border-red-400 opacity-50 animate-ping"></div>
            <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-70 bg-red-500 blur-xl transition-opacity duration-300 -z-10"></div>
          </div>
          
          <div className="absolute -bottom-10 -right-8 md:-right-16 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse delay-100 hover:shadow-xl hover:scale-110 transition-all duration-300">
            <FaStethoscope className="text-[#252A61] text-2xl md:text-3xl" />
            <div className="absolute inset-0 rounded-full border-2 border-[#252A61] opacity-50 animate-ping animation-delay-300"></div>
            <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-70 bg-[#252A61] blur-xl transition-opacity duration-300 -z-10"></div>
          </div>
          
          <div className="absolute -top-8 -right-6 md:-right-12 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse delay-200 hover:shadow-xl hover:scale-110 transition-all duration-300">
            <FaNotesMedical className="text-green-500 text-xl md:text-2xl" />
            <div className="absolute inset-0 rounded-full border-2 border-green-400 opacity-50 animate-ping animation-delay-600"></div>
            <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-70 bg-green-500 blur-xl transition-opacity duration-300 -z-10"></div>
          </div>
          
          <div className="absolute -bottom-8 -left-6 md:-left-12 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse delay-300 hover:shadow-xl hover:scale-110 transition-all duration-300">
            <FaHospital className="text-blue-500 text-xl md:text-2xl" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping animation-delay-900"></div>
            <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-70 bg-blue-500 blur-xl transition-opacity duration-300 -z-10"></div>
          </div>
          
          {/* Giant 404 text with enhanced styling and 3D effects */}
          <div className="relative group perspective-1000">
            {/* Enhanced backdrop specifically for the 404 area */}
            <div className="absolute -inset-20 -z-10 opacity-70">
              {/* Animated background orbs specific to 404 area */}
              <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-linear-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-[80px] animate-orbit-slow"></div>
              <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-linear-to-r from-indigo-500/20 to-pink-500/20 rounded-full blur-[60px] animate-orbit-slow animation-delay-300" style={{ animationDirection: "reverse" }}></div>
              <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-linear-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-[70px] animate-orbit-slow animation-delay-600"></div>
              
              {/* Digital medical grid pattern for 404 background */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20px 20px, rgba(79, 70, 229, 0.4) 2px, transparent 0),
                    linear-gradient(to right, rgba(79, 70, 229, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(79, 70, 229, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px, 20px 20px, 20px 20px',
                  animation: 'shift-bg 15s linear infinite',
                  transform: `rotate(${mousePosition.x * 2}deg) scale(${1 + Math.abs(mousePosition.y) * 0.1})`
                }}></div>
              </div>
              
              {/* Animated 3D perspective plane */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute inset-0 transform-gpu" style={{
                  backgroundSize: '30px 30px',
                  backgroundImage: 'linear-gradient(to right, rgba(79, 70, 229, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 70, 229, 0.2) 1px, transparent 1px)',
                  transform: `perspective(1000px) rotateX(${60 + mousePosition.y * 10}deg) rotateY(${mousePosition.x * 5}deg) translateZ(-100px) scale(2)`,
                  transformOrigin: 'center center',
                }}></div>
              </div>
              
              {/* Pulsing radial background */}
              <div className="absolute inset-0 opacity-30 overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%, rgba(99, 102, 241, 0.5) 0%, rgba(99, 102, 241, 0.2) 30%, transparent 70%)`,
                    animation: 'pulse-radial 4s ease-in-out infinite',
                  }}
                ></div>
              </div>
              
              {/* Animated spotlight effect */}
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at ${50 + mousePosition.x * 40}% ${50 + mousePosition.y * 40}%, rgba(255, 255, 255, 0.8) 0%, transparent 50%)`,
                  animation: 'spotlight-drift 10s infinite alternate ease-in-out',
                }}
              ></div>
              
              {/* Digital scan line effect */}
              <div className="absolute inset-0 overflow-hidden opacity-5">
                <div className="absolute inset-0 animate-scan-line"></div>
              </div>
            </div>

            {/* Replace white shadows with colored shadows for depth */}
            <h1 className="text-[12rem] sm:text-[18rem] md:text-[25rem] font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-900/20 to-indigo-900/20 opacity-80 blur-xl absolute inset-0 select-none transform translate-x-3 translate-y-3">
              404
            </h1>
            <h1 className="text-[12rem] sm:text-[18rem] md:text-[25rem] font-bold text-transparent bg-clip-text bg-linear-to-br from-purple-800/20 to-indigo-800/20 opacity-80 blur-lg absolute inset-0 select-none transform translate-x-2 translate-y-2">
              404
            </h1>
            <h1 className="text-[12rem] sm:text-[18rem] md:text-[25rem] font-bold text-transparent bg-clip-text bg-linear-to-br from-cyan-700/30 to-blue-700/30 opacity-80 blur-sm absolute inset-0 select-none transform translate-x-1 translate-y-1">
              404
            </h1>
            
            {/* Main text with enhanced styling and subtle hover animation */}
            <h1 
              className="text-[12rem] sm:text-[18rem] md:text-[25rem] font-bold text-transparent bg-clip-text bg-linear-to-br from-[#2b3a8c] via-[#4c5ec9] to-[#6d74dd] leading-none tracking-tight relative transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ 
                textShadow: '0 4px 12px rgba(37, 42, 97, 0.3), 0 8px 24px rgba(76, 94, 201, 0.2)',
                animation: 'float-subtle 6s ease-in-out infinite',
              }}
            >
              404
            </h1>
            
            {/* Metallic texture overlay for more realistic effect */}
            <div 
              className="absolute inset-0 bg-linear-to-t from-transparent via-white to-transparent opacity-50 mix-blend-overlay group-hover:opacity-70 transition-opacity duration-300"
              style={{
                backgroundSize: '200% 100%',
                backgroundPosition: 'right bottom',
                animation: 'shine-shift 4s linear infinite'
              }}
            ></div>
            
            {/* Enhanced animated glint effect */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{
                animation: isHovering ? 'enhance-glint 2s ease-out' : 'none'
              }}
            >
              <div 
                className="absolute h-[300%] w-[50px] bg-linear-to-b from-transparent via-white to-transparent opacity-30 rotate-12 blur-sm -top-full group-hover:animate-sweep-light"
                style={{ 
                  left: '-30%',
                }}
              ></div>
            </div>
            
            {/* Animated glow effect */}
            <div className="absolute inset-0 z-[-1] opacity-40 blur-2xl">
              <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 to-purple-500/20 animate-pulse-slow"></div>
            </div>
            
            {/* Enhanced backdrop glow */}
            <div 
              className="absolute inset-0 -z-10 opacity-40 blur-[60px] group-hover:opacity-60 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, rgba(79, 70, 229, 0.5) 0%, rgba(66, 153, 225, 0.3) 50%, transparent 70%)`,
                transform: `scale(${isHovering ? 1.2 : 1})`,
                transition: 'transform 800ms ease-out'
              }}
            ></div>
            
            {/* Additional interactive elements */}
            <div className="absolute inset-0 overflow-hidden -z-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`glow-${i}`}
                  className="absolute bg-linear-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
                  style={{
                    width: `${Math.random() * 120 + 50}px`,
                    height: `${Math.random() * 120 + 50}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float-glow ${Math.random() * 15 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random() * 0.3 + 0.1,
                    transform: `scale(${isHovering ? (Math.random() * 0.3 + 1.1) : 1})`,
                    transition: 'transform 800ms ease-out'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced animated heartbeat line with glow effect */}
        <div className="w-56 md:w-80 h-16 relative mb-8 mt-4 hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-blue-500 opacity-10 blur-md rounded-full"></div>
          <svg viewBox="0 0 400 50" className="w-full h-full drop-shadow-lg">
            <defs>
              <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#252A61" />
                <stop offset="50%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#252A61" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path 
              className="animate-drawEkg"
              d="M0,25 L60,25 L80,10 L100,40 L120,25 L180,25 L200,0 L220,50 L240,25 L300,25 L320,10 L340,40 L360,25 L400,25" 
              fill="none" 
              stroke="url(#heartbeatGradient)" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            />
            {/* Additional highlight line for more dramatic effect */}
            <path 
              className="animate-drawEkg animation-delay-300"
              d="M0,25 L60,25 L80,10 L100,40 L120,25 L180,25 L200,0 L220,50 L240,25 L300,25 L320,10 L340,40 L360,25 L400,25" 
              fill="none" 
              stroke="white" 
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              opacity="0.4"
            />
          </svg>
        </div>
        
        {/* Enhanced button with more sophisticated hover effects and animations */}
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#252A61] text-white rounded-full text-lg hover:bg-[#3b3b98] transition-all duration-300 hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full bg-linear-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
          <span className="absolute -inset-full w-[300%] h-full bg-linear-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-shimmer"></span>
          <FaHome className="mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10">Return to Medicare Home</span>
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none blur-md" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(79, 70, 229, 0.5) 70%, transparent 100%)' }}></div>
        </Link>
      </div>
    </div>
  );
};

// Update the styles section with enhanced animations
const styles = `
@keyframes drawEkg {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}

@keyframes shine {
  from {
    left: -100%;
    opacity: 0.5;
  }
  to {
    left: 100%;
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-30px) translateX(15px);
  }
  50% {
    transform: translateY(-10px) translateX(-15px);
  }
  75% {
    transform: translateY(-20px) translateX(10px);
  }
}

@keyframes float-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-glow {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translateY(-30px) translateX(20px) scale(1.2);
    opacity: 0.3;
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pulse-wave {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.7;
    box-shadow: 0 0 8px 2px rgba(255,255,255,0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 12px 3px rgba(255,255,255,0.5);
  }
}

@keyframes breathe-light {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes sweep-light {
  0% {
    left: -50%;
  }
  100% {
    left: 150%;
  }
}

@keyframes ping-slow {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

@keyframes shine-shift {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes enhance-glint {
  0% {
    opacity: 0.5;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}

@keyframes orbit-slow {
  0% {
    transform: rotate(0deg) translateX(50px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(50px) rotate(-360deg);
  }
}

@keyframes shift-bg {
  0% {
    background-position: 0 0, 0 0, 0 0;
  }
  100% {
    background-position: 40px 40px, 20px 20px, 20px 20px;
  }
}

@keyframes pulse-radial {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

@keyframes spotlight-drift {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes scan-line {
  0% {
    top: -100%;
    height: 10px;
    background: linear-gradient(to bottom, transparent, rgba(79, 70, 229, 0.5), transparent);
  }
  100% {
    top: 200%;
    height: 10px;
    background: linear-gradient(to bottom, transparent, rgba(79, 70, 229, 0.5), transparent);
  }
}

.animate-drawEkg {
  animation: drawEkg 2s ease-in-out forwards;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-shine {
  animation: shine 3s infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-pulse-wave {
  animation: pulse-wave 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-breathe-light {
  animation: breathe-light 4s ease-in-out infinite;
}

.animate-sweep-light {
  animation: sweep-light 1.5s ease-out forwards;
}

.animate-ping-slow {
  animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-orbit-slow {
  animation: orbit-slow 20s linear infinite;
}

.animate-scan-line {
  animation: scan-line 4s ease-in-out infinite;
}

.perspective-1000 {
  perspective: 1000px;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-900 {
  animation-delay: 900ms;
}
`;

// Inject the styles into the page
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default NotFound;
