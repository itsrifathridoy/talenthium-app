'use client';

import React from 'react';

interface VideoPlaceholderProps {
  hasPermission: boolean;
  errorMessage: string;
  speechText: string;
  status: string;
  isSpeaking: boolean;
  onStartConversation: () => Promise<void>;
  onEndConversation: () => Promise<void>;
  theme: "light" | "dark";
}

export default function VideoPlaceholder({
  hasPermission,
  errorMessage,
  speechText,
  status,
  isSpeaking,
  onStartConversation,
  onEndConversation,
  theme
}: VideoPlaceholderProps) {
  return (
    <div className="absolute inset-0 h-full w-full">
      <div
        className={`h-full w-full rounded-2xl border relative overflow-hidden ${
          theme === "light"
            ? "border-emerald-300/50 bg-gradient-to-br from-white via-emerald-50 to-emerald-200/60"
            : "border-emerald-300/15 bg-[#060f0c]"
        }`}
        style={{
          boxShadow: theme === "light"
            ? 'inset 0 0 0 1px rgba(16,185,129,0.12), inset 0 0 80px rgba(16,185,129,0.1), 0 0 30px rgba(16,185,129,0.08)'
            : 'inset 0 0 0 1px rgba(16,185,129,0.08), inset 0 0 60px rgba(0,0,0,0.4)'
        }}
      >
        {/* AI Speaking Animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Glowing Iridescent Sphere */}
          <div className="relative mb-8">
            {/* Main Sphere */}
            <div 
              className={`w-32 h-32 rounded-full relative transition-all duration-1000 ${
                isSpeaking 
                  ? 'scale-110 shadow-2xl' 
                  : 'scale-100 shadow-lg'
              }`}
              style={{
                background: isSpeaking 
                  ? 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6, #1d4ed8, #7c3aed)'
                  : 'radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8, #7c3aed, #1e40af)',
                boxShadow: isSpeaking
                  ? '0 0 60px rgba(139, 92, 246, 0.6), 0 0 120px rgba(59, 130, 246, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.1)'
                  : '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Inner Glow */}
              <div 
                className={`absolute inset-2 rounded-full transition-all duration-1000 ${
                  isSpeaking ? 'opacity-80' : 'opacity-60'
                }`}
                style={{
                  background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.3), rgba(139, 92, 246, 0.2), transparent)',
                  filter: 'blur(1px)'
                }}
              />
              
              {/* Animated Highlights */}
              {isSpeaking && (
                <>
                  <div 
                    className="absolute top-4 left-6 w-3 h-3 rounded-full animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, #a78bfa, #8b5cf6)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                  <div 
                    className="absolute bottom-6 right-4 w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, #60a5fa, #3b82f6)',
                      animation: 'pulse 1.5s ease-in-out infinite 0.5s'
                    }}
                  />
                  <div 
                    className="absolute top-8 right-8 w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, #34d399, #10b981)',
                      animation: 'pulse 1.5s ease-in-out infinite 1s'
                    }}
                  />
                </>
              )}
            </div>

            {/* Outer Aura */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                isSpeaking ? 'scale-150 opacity-30' : 'scale-125 opacity-20'
              }`}
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2), transparent)',
                filter: 'blur(8px)'
              }}
            />
          </div>

          {/* AI Label */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 tracking-wide ${
              theme === "light" ? "text-emerald-800" : "text-white"
            }`}>
              AI Interviewer
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isSpeaking ? 'bg-emerald-400 scale-125' : 'bg-emerald-600 scale-100'
              }`} />
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isSpeaking 
                  ? theme === "light" ? 'text-emerald-600' : 'text-emerald-400'
                  : theme === "light" ? 'text-emerald-700' : 'text-emerald-300'
              }`}>
                {isSpeaking ? 'Speaking...' : 'Listening...'}
              </span>
            </div>
          </div>

          {/* Speech Text */}
          <div className="max-w-2xl mx-auto px-6 mb-8">
            <div className={`border rounded-xl p-4 backdrop-blur-sm ${
              theme === "light"
                ? "bg-white/60 border-emerald-200/40"
                : "bg-emerald-900/20 border-emerald-300/20"
            }`}>
              <p className={`text-center leading-relaxed ${
                theme === "light" ? "text-emerald-800" : "text-emerald-100"
              }`}>
                {speechText}
              </p>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="flex flex-col items-center space-y-4">
            {status === "connected" ? (
              <button
                onClick={onEndConversation}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>🔴</span>
                <span>End Conversation</span>
              </button>
            ) : (
              <button
                onClick={onStartConversation}
                disabled={!hasPermission}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>🎤</span>
                <span>Start Interview</span>
              </button>
            )}

            {/* Status Messages */}
            {errorMessage && (
              <div className={`rounded-lg p-3 max-w-md border ${
                theme === "light"
                  ? "bg-red-50/80 border-red-200/50"
                  : "bg-red-900/30 border-red-500/30"
              }`}>
                <p className={`text-sm text-center ${
                  theme === "light" ? "text-red-700" : "text-red-200"
                }`}>{errorMessage}</p>
              </div>
            )}
            
            {!hasPermission && (
              <div className={`rounded-lg p-3 max-w-md border ${
                theme === "light"
                  ? "bg-yellow-50/80 border-yellow-200/50"
                  : "bg-yellow-900/30 border-yellow-500/30"
              }`}>
                <p className={`text-sm text-center ${
                  theme === "light" ? "text-yellow-700" : "text-yellow-200"
                }`}>
                  Please allow microphone access to use voice chat
                </p>
              </div>
            )}

            {status === "connected" && (
              <div className={`rounded-lg p-3 max-w-md border ${
                theme === "light"
                  ? "bg-emerald-50/80 border-emerald-200/50"
                  : "bg-emerald-900/30 border-emerald-500/30"
              }`}>
                <p className={`text-sm text-center ${
                  theme === "light" ? "text-emerald-700" : "text-emerald-200"
                }`}>
                  Connected to AI Interviewer
                </p>
              </div>
            )}
          </div>

          {/* Subtle Background Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isSpeaking ? 'opacity-20' : 'opacity-10'
              }`}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



