'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const analysisStartTimeRef = useRef(null);
  const router = useRouter();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleHeroDragOver = (e) => {
    e.preventDefault();
    setIsHeroDragging(true);
  };

  const handleHeroDragLeave = () => {
    setIsHeroDragging(false);
  };

  const handleHeroDrop = (e) => {
    handleDrop(e);
    setIsHeroDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setIsHeroDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setShowVideo(false);
      setError('');
    } else {
      setError('Please upload a valid video file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowVideo(false);
      setError('');
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select a video file first.');
      return;
    }

    setShowVideo(true);
    setIsUploading(true);
    setError('');
    analysisStartTimeRef.current = Date.now();

    // Wait for video to load and adjust playback speed
    setTimeout(() => {
      if (videoRef.current) {
        const videoDuration = videoRef.current.duration;
        // Estimate analysis will take 40-60 seconds, adjust playback speed accordingly
        const estimatedAnalysisTime = 55; // seconds (increased for longer analysis)
        if (videoDuration > 0) {
          const playbackRate = videoDuration / estimatedAnalysisTime;
          videoRef.current.playbackRate = Math.min(Math.max(playbackRate, 0.25), 1.5); // Keep between 0.25x and 1.5x (slower)
        }
      }
    }, 100);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Server returned an error.');
      }

      const data = await response.json();

      // Calculate actual analysis time and adjust video if still playing
      const analysisTime = (Date.now() - analysisStartTimeRef.current) / 1000;
      if (videoRef.current && !videoRef.current.ended) {
        const remainingTime = videoRef.current.duration - videoRef.current.currentTime;
        if (remainingTime > 0.5) {
          // Speed up to finish in 0.5 seconds
          videoRef.current.playbackRate = remainingTime / 0.5;
        }
      }

      // Wait a moment for video to finish if needed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Store result in sessionStorage and navigate to results page
      sessionStorage.setItem('analysisResult', JSON.stringify({
        prediction: data.label,
        predictionData: data.prediction_data || {},
        gradcamUrls: data.gradcam_urls || [],
        frameUrls: data.frame_urls || [],
        rawOutput: data.raw_output,
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));

      router.push('/results');

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      if (videoRef.current) {
        videoRef.current.playbackRate = 1;
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <main className="w-full px-4 sm:px-8 lg:px-16 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Upload CTA */}
          <div className="space-y-8 mt-7">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                PROTECT
                <br />
                <span className="text-white">REALITY</span>
              </h1>
              <p className="text-2xl text-cyan-400 font-semibold">
                AI Deepfake Defense Upload
              </p>
              <p className="text-xl text-white">
                Upload a video to analyze deepfake likelihood. We keep your media local to your session for privacy.
              </p>
            </div>
          </div>

          {/* Right Side - Preview Media */}
          <div
            className="relative w-full h-[350px] overflow-hidden rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 bg-[#0f1324]"
            onDragOver={handleHeroDragOver}
            onDragLeave={handleHeroDragLeave}
            onDrop={handleHeroDrop}
          >
            {!showVideo || !selectedFile ? (
              <img
                src="/models/upload.jpg"
                alt="Upload preview"
                className={`w-full h-full object-cover transition-opacity duration-200 ${isHeroDragging ? 'opacity-60' : 'opacity-90'}`}
              />
            ) : (
              <video
                ref={videoRef}
                src="/models/upload.mp4"
                autoPlay
                loop={true}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {!showVideo && (
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`absolute inset-0 flex items-center justify-center border-2 border-dashed transition-all bg-[#0f1324]/60 ${isHeroDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-cyan-500/40'
                  }`}
              >
                <div className="space-y-3 text-center px-4">
                  <div className="w-14 h-14 mx-auto bg-cyan-500/15 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {selectedFile ? (
                    <>
                      <p className="text-white font-semibold">{selectedFile.name}</p>
                      <p className="text-gray-300 text-sm">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-semibold">Drag & drop on the preview</p>
                      <p className="text-gray-300 text-sm">or click to browse</p>
                    </>
                  )}
                </div>
              </button>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/40 via-transparent to-[#0a0e1a]/30 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4 gap-10 bg-[#1a1f35]/40 rounded-2xl border border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/10 mt-4">
          <div className='flex items-center justify-between gap-10'>
            <div className="flex w-full md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-white font-semibold">Video Upload</p>
              <p className="text-gray-400 text-sm">MP4, MOV, AVI · Max ~200MB recommended</p>
              {selectedFile && (
                <p className="text-cyan-300 text-sm">
                  {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/40 w-full md:w-auto"
              >
                Choose File
              </button>
          </div>

          <div className='w-full flex items-center justify-between gap-4'>
            <button
              onClick={handleAnalysis}
              disabled={isUploading || !selectedFile}
              className="flex-1 px-32 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/40 disabled:shadow-none text-center"
            >
              {isUploading ? 'Analyzing...' : 'Start Analysis'}
            </button>

            <input
              id="fileInput"
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {selectedFile && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-3 text-sm text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 rounded-lg"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 pt-4">
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
