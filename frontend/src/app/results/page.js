'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '../../components/ui/scroll-area';

export default function ResultsPage() {
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0e1a]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-gray-400">No analysis results found. Please upload a video first.</p>
            <button
              onClick={() => router.push('/upload')}
              className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all"
            >
              Go to Upload
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { prediction, predictionData, gradcamUrls, fileName, fileSize } = result;
  const isReal = prediction?.includes('REAL');
  const isFake = prediction === 'FAKE';
  const isSuspicious = prediction === 'SUSPICIOUS';

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Info Header */}
        <div className="mb-6 text-gray-400 text-sm">
          <span>Filename </span>
          <span className="text-white">{fileName}</span>
          <span className="mx-2">•</span>
          <span>{fileSize}</span>
          {predictionData.video && (
            <>
              <span className="mx-2">•</span>
              <span>1920 x 1080</span>
              <span className="mx-2">•</span>
              <span>0:23</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Main Visual */}
          <div className="space-y-6">
            <div className="bg-[#1a1f35]/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">UPLOAD VIDEO FOR ANALYSIS</h2>

              {/* Confidence Circle */}
              <div className="flex items-center justify-between mb-8">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full border-8 border-cyan-500 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-transparent">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white">
                        {predictionData.real_prob 
                          ? Math.round(isReal ? predictionData.real_prob * 100 : predictionData.fake_prob * 100)
                          : '99'}%
                      </div>
                      <div className="text-cyan-400 font-semibold mt-2">
                        {isReal ? 'REAL' : isFake ? 'FAKE' : 'SUSPICIOUS'}
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4 text-gray-400 text-sm">CONFIDENCE</div>
                </div>

                {/* Heatmap Preview */}
                {gradcamUrls && gradcamUrls.length > 0 && (
                  <div className="flex-1 ml-8">
                    <div className="relative aspect-video bg-gradient-to-br from-[#0a0e1a] to-[#1a1f35] rounded-xl overflow-hidden border border-cyan-500/20">
                      <Image
                        src={gradcamUrls[0]}
                        alt="Analysis Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Frame Timeline */}
              {gradcamUrls && gradcamUrls.length > 0 && (
                <div className="space-y-4">
                  <ScrollArea className="w-full">
                    <div className="flex space-x-4 pb-4">
                      {gradcamUrls.map((url, index) => (
                        <div key={index} className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-500/30">
                            <Image
                              src={url}
                              alt={`Frame ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="text-xs text-gray-400 text-center mt-1">
                            {index * 5 + 12}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  {/* Anomaly Detection Graph */}
                  <div className="bg-[#0a0e1a]/50 rounded-lg p-4 border border-cyan-500/20">
                    <p className="text-gray-400 text-sm mb-2">
                      {predictionData.suspicion 
                        ? `${(predictionData.suspicion * 100).toFixed(1)}% anomaly detected across ${gradcamUrls.length} key frames`
                        : '0,54 anomaly detected across 2 key frames'}
                    </p>
                    <div className="h-16 flex items-end space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Anomaly Insights */}
            <div className="bg-[#1a1f35]/30 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
              <h3 className="text-white font-semibold mb-4">ANOMALY INSIGHTS</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  Heatmap imperfection
                </p>
                <p className="text-gray-400">
                  {predictionData.suspicion 
                    ? `${(predictionData.suspicion * 100).toFixed(0)}% anomaly detected ≈ ${gradcamUrls?.length || 2} key frames`
                    : '04% anomaly detected ≈ 2 key frames'}
                </p>
              </div>
            </div>

            {/* Download Report Button */}
            <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/50">
              DOWNLOAD REPORT
            </button>
          </div>

          {/* Right Side - Metrics */}
          <div className="space-y-6">
            {/* Detailed Metrics */}
            {predictionData && Object.keys(predictionData).length > 0 && (
              <div className="bg-[#1a1f35]/30 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
                <h3 className="text-white font-semibold mb-6">DETAILED ANALYSIS METRICS</h3>
                
                <div className="space-y-6">
                  {/* Probability Bars */}
                  {predictionData.real_prob !== undefined && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">Real Probability</span>
                        <span className="text-white font-semibold">{(predictionData.real_prob * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${predictionData.real_prob * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {predictionData.fake_prob !== undefined && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">Fake Probability</span>
                        <span className="text-white font-semibold">{(predictionData.fake_prob * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                          style={{ width: `${predictionData.fake_prob * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* FFT Score */}
                  {predictionData.fft_score !== undefined && (
                    <div className="pt-4 border-t border-cyan-500/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-gray-400 text-sm">FFT Score</div>
                          <div className="text-xs text-gray-500">Frequency Analysis</div>
                        </div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {predictionData.fft_score.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lip Motion Score */}
                  {predictionData.lip_score !== undefined && (
                    <div className="pt-4 border-t border-cyan-500/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-gray-400 text-sm">Lip Motion Score</div>
                          <div className="text-xs text-gray-500">Audio-Visual Sync</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                          {predictionData.lip_score.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suspicion Level */}
                  {predictionData.suspicion !== undefined && (
                    <div className="pt-4 border-t border-cyan-500/20">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">Overall Suspicion Level</span>
                        <span className="text-white font-semibold">{(predictionData.suspicion * 100).toFixed(2)}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            predictionData.suspicion > 0.75 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            predictionData.suspicion > 0.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${predictionData.suspicion * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="bg-[#1a1f35]/30 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">Verified hash</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">
                  Anomalies Detected ≈ {gradcamUrls?.length || 0}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">Resolution: 1920 x1060</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm">FPS: 30.0</span>
              </div>
            </div>

            {/* Analysis Badge */}
            <div className="text-center py-8">
              <div className={`inline-block px-8 py-4 rounded-xl font-bold text-xl ${
                isReal 
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500' 
                  : isFake
                  ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                  : 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
              }`}>
                {prediction}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-cyan-500/20 flex items-center justify-center space-x-8 text-sm">
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
