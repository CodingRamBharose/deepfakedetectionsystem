'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import FaceScanner from '@/components/three/FaceScanner';


export default function Home() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    // Preload both videos
    video1.load();
    video2.load();
    
    // Start first video
    video1.play().catch(err => console.log('Autoplay prevented:', err));

    const handleVideo1Ended = () => {
      setActiveVideo(2);
      video2.currentTime = 0;
      video2.play();
    };

    const handleVideo2Ended = () => {
      setActiveVideo(1);
      video1.currentTime = 0;
      video1.play();
    };

    video1.addEventListener('ended', handleVideo1Ended);
    video2.addEventListener('ended', handleVideo2Ended);

    return () => {
      video1.removeEventListener('ended', handleVideo1Ended);
      video2.removeEventListener('ended', handleVideo2Ended);
    };
  }, []);
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                PROTECT
                <br />
                <span className="text-white">REALITY</span>
              </h1>
              <p className="text-2xl text-cyan-400 font-semibold">
                AI Deepfake Defense
              </p>
            </div>

            <Link
              href="/upload"
              className="inline-block px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/50"
            >
              Start Deepfake Scan
            </Link>
          </div>

          {/* Right Side - Video Display */}
          <div className="relative w-full h-[350px] overflow-hidden rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            {/* Forward video */}
            <video
              ref={video1Ref}
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-contain ${activeVideo === 1 ? 'opacity-80' : 'opacity-0'}`}
            >
              <source src="/models/homepage.mp4" type="video/mp4" />
            </video>
            {/* Reverse video */}
            <video
              ref={video2Ref}
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-contain ${activeVideo === 2 ? 'opacity-80' : 'opacity-0'}`}
            >
              <source src="/models/homepage-reverse.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/40 via-transparent to-[#0a0e1a]/40 pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Misinformation</h3>
                <p className="text-gray-400 text-sm">
                  Deeptake videos can spread false information and manipulate public opinion.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Impersonation</h3>
                <p className="text-gray-400 text-sm">
                  Deeptakes can be used to impersonate individuals for malicious purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Fraud</h3>
                <p className="text-gray-400 text-sm">
                  Financial scams and fraud can be facilitated through deeptake technology.
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Section */}
        <div className="mt-24 pt-12 border-t border-cyan-500/20">
          <div className="flex items-center justify-center space-x-12 text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">1</span>
              <span className="text-sm">UPLOAD</span>
            </div>
            <div className="w-12 h-px bg-cyan-500/30" />
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-sm">SCAN</span>
            </div>
            <div className="w-12 h-px bg-cyan-500/30" />
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">VALIDATE</span>
            </div>
            <div className="w-12 h-px bg-cyan-500/30" />
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">REPORT</span>
            </div>
          </div>
        </div>

        {/* Footer Tags */}
        <div className="mt-12 flex items-center justify-center space-x-8 text-sm">
          <span className="text-cyan-400 font-semibold">AI-POWERED</span>
          <span className="text-gray-500">•</span>
          <span className="text-cyan-400 font-semibold">REAL-TIME FORENSICS</span>
          <span className="text-gray-500">•</span>
          <span className="text-cyan-400 font-semibold">ZERO-TRUST DETECTION</span>
        </div>
      </main>
    </div>
  );
}
