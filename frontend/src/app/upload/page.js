'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please upload a valid video file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select a video file first.');
      return;
    }

    setIsUploading(true);
    setError('');

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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              PROTECT REALITY
            </h1>
            <p className="text-cyan-400 text-xl font-semibold">
              AI Deepfake Defense
            </p>
          </div>

          {/* Upload Button CTA */}
          <div>
            <button
              onClick={() => document.getElementById('fileInput').click()}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/50"
            >
              Upload Video for Analysis
            </button>
          </div>

          {/* Upload Area */}
          {/* <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative bg-[#1a1f35]/30 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-cyan-500/30'
            }`}
          >
            <input
              id="fileInput"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-center space-y-4">
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    Change file
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Drop your video here or{' '}
                      <button
                        onClick={() => document.getElementById('fileInput').click()}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Supports MP4, AVI, MOV formats
                    </p>
                  </div>
                </>
              )}
            </div>
          </div> */}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          {selectedFile && (
            <div className="text-center">
              <button
                onClick={handleAnalysis}
                disabled={isUploading}
                className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/50 disabled:shadow-none"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Misinformation</h3>
              <p className="text-gray-400 text-sm">
                Deeptake videos on spread false information and manipulate public-opinion.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Impersonation</h3>
              <p className="text-gray-400 text-sm">
                Deeptakes can be used to impersonate individuals for malicious purposes.
              </p>
            </div>

            <div className="bg-[#1a1f35]/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Fraud</h3>
              <p className="text-gray-400 text-sm">
                Financial seams and fraud can be facilitated through deeptake technology
              </p>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-12 pt-12 border-t border-cyan-500/20">
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-2xl text-cyan-400">1</span>
                <span className="text-sm">UPLOAD</span>
              </div>
              <div className="w-12 h-px bg-cyan-500/30" />
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span className="text-sm">SCAN</span>
              </div>
              <div className="w-12 h-px bg-cyan-500/30" />
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">VALIDATE</span>
              </div>
              <div className="w-12 h-px bg-cyan-500/30" />
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">REPORT</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
            <span className="text-cyan-400 font-semibold">AI-Powered</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400 font-semibold">Real-Time Forensics</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400 font-semibold">Zero-Trust Detection</span>
          </div>
        </div>
      </main>
    </div>
  );
}
