'use client';

import Navbar from '../../components/Navbar';

export default function AwarenessPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white">
                DEEPFAKE AWARENESS
              </h1>
              <p className="text-xl text-gray-300">
                Learn to identify deepfake content
                <br />
                and protect yourself from deception
                <br />
                and digital manipulation.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">What is a Deepfake?</h3>
                    <p className="text-gray-400 text-sm">
                      Deepfakes are sytntnetic media in which a persons likeness is replaced with 
                      someone elses, often using AI-based techni-ques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">How It Works</h3>
                    <p className="text-gray-400 text-sm">
                      AI algorithms analyze and swap-facial features in images on videos, 
                      producing highly reali-stic but fake content that is
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">Risks & Prevention</h3>
                    <p className="text-gray-400 text-sm">
                      Deeptakes can be used for fraud, defamation, or misinformation. 
                      Be vigilant by checking visual inconsistencies or unnatural movements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/50">
              READ MORE
            </button>
          </div>

          {/* Right Side - Visual */}
          <div className="relative">
            <div className="bg-[#1a1f35]/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                {/* Main Visual Area */}
                <div className="relative aspect-video bg-gradient-to-br from-[#0a0e1a] to-[#1a1f35] rounded-xl overflow-hidden border border-cyan-500/20">
                  {/* Grid overlay */}
                  <div className="absolute inset-0">
                    <div className="w-full h-full" style={{
                      backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                  </div>

                  {/* Wireframe face */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      {/* Face outline */}
                      <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full" />
                      <div className="absolute inset-4 border border-cyan-400/30 rounded-full" />
                      
                      {/* Scanning lines */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                      </div>
                      
                      {/* Feature points */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                          style={{
                            left: `${20 + Math.cos(i * Math.PI / 4) * 40 + 50}%`,
                            top: `${20 + Math.sin(i * Math.PI / 4) * 40 + 50}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Split effect overlay */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-purple-500/20 to-transparent" />
                </div>

                {/* Detection indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1f35]/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="text-xs text-gray-400 mb-1">Face Detection</div>
                    <div className="text-lg font-bold text-cyan-400">Active</div>
                  </div>
                  <div className="bg-[#1a1f35]/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="text-xs text-gray-400 mb-1">AI Analysis</div>
                    <div className="text-lg font-bold text-cyan-400">Running</div>
                  </div>
                </div>

                {/* Warning signs */}
                <div className="bg-[#1a1f35]/50 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Warning Signs to Look For
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Unnatural blinking or facial movements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Mismatched skin tones or lighting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Audio-visual sync issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span>Blurred or distorted edges around face</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-24 text-center space-y-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Protect Yourself from Digital Deception
            </h2>
            <p className="text-gray-400 text-lg">
              Stay informed about the latest deepfake detection techniques and learn how to verify 
              the authenticity of digital content you encounter online.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <button className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/50">
              Learn More
            </button>
            <button className="px-8 py-3 bg-[#1a1f35] hover:bg-[#242942] text-white font-semibold rounded-lg border border-cyan-500/30 transition-all">
              Report Deepfake
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-cyan-500/20 flex items-center justify-center space-x-8 text-sm">
          <span className="text-cyan-400 font-semibold">AI-Powered</span>
          <span className="text-gray-500">•</span>
          <span className="text-cyan-400 font-semibold">Real-Time Forensics</span>
          <span className="text-gray-500">•</span>
          <span className="text-cyan-400 font-semibold">Zero-Trust Detection</span>
        </div>
      </main>
    </div>
  );
}
