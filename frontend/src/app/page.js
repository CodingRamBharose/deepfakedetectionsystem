import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              DeepFake Detection
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI-powered detection for images, videos, audio, and text.
              Protect yourself from synthetic media with our cutting-edge technology.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🖼️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Images</h3>
              <p className="text-sm text-gray-600">Detect manipulated photos and synthetic faces</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Videos</h3>
              <p className="text-sm text-gray-600">Identify deepfake videos and face swaps</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="font-semibold text-gray-900 mb-2">Audio</h3>
              <p className="text-sm text-gray-600">Spot voice cloning and synthetic speech</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-900 mb-2">Text</h3>
              <p className="text-sm text-gray-600">Analyze AI-generated content and text</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              href="/detect"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🔍</span>
              Start Detection
            </Link>
          </div>

          {/* Stats */}
          <div className="pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">99.2%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">&lt; 5s</div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">1M+</div>
                <div className="text-sm text-gray-600">Files Analyzed</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
