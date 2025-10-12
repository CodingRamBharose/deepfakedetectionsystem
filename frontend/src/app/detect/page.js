'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import FileUpload from '../../components/FileUpload';
import ResultCard from '../../components/ResultCard';
import Loader from '../../components/Loader';
import { mockAnalyzeContent, validateFileSize, validateFileType, validateTextContent } from '../../utils/mockApi';

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'

  // Validation and error handling
  const validateInput = (file, text) => {
    if (file) {
      if (!validateFileSize(file, 50)) {
        throw new Error('File size must be less than 50MB');
      }
      if (!validateFileType(file, ['image', 'video', 'audio'])) {
        throw new Error('Unsupported file type. Please upload an image, video, or audio file.');
      }
    }

    if (text && !validateTextContent(text, 10, 10000)) {
      throw new Error('Text must be between 10 and 10,000 characters');
    }
  };

  const handleDetection = async () => {
    if (!selectedFile && !textInput.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      let contentType = 'text';
      let content = textInput.trim();

      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) contentType = 'image';
        else if (selectedFile.type.startsWith('video/')) contentType = 'video';
        else if (selectedFile.type.startsWith('audio/')) contentType = 'audio';
        content = selectedFile;
      }

      // Validate input before processing
      validateInput(selectedFile, textInput);

      const analysisResult = await mockAnalyzeContent(content, contentType);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        prediction: 'ERROR',
        confidence: 0,
        explanation: error.message || 'Analysis failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasContent = selectedFile || textInput.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DeepFake Detection
            </h1>
            <p className="text-gray-600">
              Upload a file or enter text to analyze for synthetic content
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('file')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 File Upload
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 Text Analysis
              </button>
            </div>
          </div>

          {/* Content Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'file' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Media File</h3>
                <FileUpload 
                  onFileSelect={setSelectedFile}
                  acceptedTypes="image/*,video/*,audio/*"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Enter Text for Analysis</h3>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste or type the text you want to analyze for AI generation..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500">
                  {textInput.length} characters
                </p>
              </div>
            )}
          </div>

          {/* Detection Button */}
          {hasContent && (
            <div className="text-center">
              <button
                onClick={handleDetection}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" text="" />
                    <span className="ml-2">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔍</span>
                    Detect DeepFake
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Section */}
          {(isLoading || result) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Analysis Results
              </h3>
              <ResultCard result={result} isLoading={isLoading} />
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our AI analyzes multiple features including facial movements, audio patterns, and text characteristics</li>
              <li>• Results include confidence scores and detailed explanations</li>
              <li>• Processing typically takes 2-10 seconds depending on file size</li>
              <li>• All uploaded content is processed securely and not stored</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
