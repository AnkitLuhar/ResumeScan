import React from "react";
import logo from "../assets/logo.png";

const ResumeScanLoaderClean = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        {/* Hexagonal grid background */}
        <div className="absolute inset-0 w-96 h-96 opacity-20">
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 border border-blue-400/30"
              style={{
                left: `${(i % 6) * 64}px`,
                top: `${Math.floor(i / 6) * 64}px`,
                animation: `pulse-hex ${2 + (i % 3)}s infinite ${i * 0.1}s`,
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          ))}
        </div>

        {/* Central logo container */}
        <div className="relative w-64 h-64">
          {/* Rotating circles - reduced to 3 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 rounded-full animate-spin-slow"
                style={{
                  width: `${160 + i * 40}px`,
                  height: `${160 + i * 40}px`,
                  borderColor: `rgba(59, 130, 246, ${0.2 + i * 0.1})`,
                  animationDuration: `${8 + i * 2}s`,
                  animationDirection: i % 2 ? "reverse" : "normal",
                }}
              >
                <div
                  className="absolute w-2 h-2 bg-blue-400 rounded-full blur-sm"
                  style={{
                    top: "50%",
                    left: "-1px",
                    animation: `pulse 2s infinite ${i * 0.5}s`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Main logo with effects */}
          <div className="relative w-40 h-40 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700 rounded-lg shadow-2xl transform -rotate-45 animate-logo-float">
            {/* Logo container */}
            <div className="absolute inset-0 rotate-45 p-4">
              <img
                src={logo}
                alt="ResumeScan Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* White curved corner */}
            <div className="absolute top-0 right-0 w-10 h-10 bg-gray-900 rounded-bl-full" />

            {/* Scanning effects */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-1 bg-blue-400/30 blur-sm"
                  style={{
                    animation: `scan-line-diagonal 2s infinite ${i * 0.4}s`,
                    transform: "rotate(45deg)",
                  }}
                />
              ))}
            </div>

            {/* Digital particles */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `digital-particle 1.5s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reduced orbiting elements to 4 */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 right-0"
              style={{
                animation: `orbit-custom-${i} ${4 + i}s linear infinite`,
              }}
            >
              <div className="relative">
                <div className="absolute w-6 h-6 bg-blue-400 rounded-full blur-sm" />
                <div className="absolute w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Animated text */}
        <div className="mt-12 text-center">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse">
            RESUMESCAN
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {["SCANNING", "ANALYZING", "PROCESSING"].map((text, i) => (
              <span
                key={i}
                className="text-blue-400 text-sm tracking-wider animate-text-cycle"
                style={{ animationDelay: `${i * 1.5}s` }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-hex {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        @keyframes scan-line-diagonal {
          0% { transform: translateY(-200%) rotate(45deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(200%) rotate(45deg); opacity: 0; }
        }

        @keyframes digital-particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(20px, -20px) scale(0); opacity: 0; }
        }

        @keyframes logo-float {
          0%, 100% { transform: rotate(-45deg) translateY(0); }
          50% { transform: rotate(-45deg) translateY(-10px); }
        }

        ${[...Array(4)]
          .map(
            (_, i) => `
          @keyframes orbit-custom-${i} {
            0% { transform: rotate(${i * 90}deg) translateX(${
              80 + i * 15
            }px) rotate(${-i * 90}deg); }
            100% { transform: rotate(${360 + i * 90}deg) translateX(${
              80 + i * 15
            }px) rotate(${-360 - i * 90}deg); }
          }
        `
          )
          .join("")}

        @keyframes text-cycle {
          0%, 33% { opacity: 1; transform: translateY(0); }
          34%, 100% { opacity: 0; transform: translateY(10px); }
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        .animate-logo-float {
          animation: logo-float 4s ease-in-out infinite;
        }

        .animate-text-cycle {
          animation: text-cycle 4.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default ResumeScanLoaderClean;
