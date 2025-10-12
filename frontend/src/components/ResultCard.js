export default function ResultCard({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing content...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { prediction, confidence, explanation } = result;
  const isReal = prediction === 'REAL';
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return isReal ? 'text-green-600' : 'text-red-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceBarColor = (confidence) => {
    if (confidence >= 0.8) return isReal ? 'bg-green-500' : 'bg-red-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="space-y-4">
        {/* Prediction Result */}
        <div className="text-center">
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold
            ${isReal 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
            }
          `}>
            <span className="mr-2">
              {isReal ? '✅' : '❌'}
            </span>
            {prediction}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Confidence</span>
            <span className={`text-sm font-semibold ${getConfidenceColor(confidence)}`}>
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          
          {/* Confidence Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getConfidenceBarColor(confidence)}`}
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Details</h4>
            <p className="text-sm text-gray-600">{explanation}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          Analysis completed • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
