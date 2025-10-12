// Mock API responses for different content types
export const mockResponses = {
  image: [
    {
      prediction: 'REAL',
      confidence: 0.92,
      explanation: 'Natural facial features and lighting patterns detected. No signs of digital manipulation found in the image analysis.'
    },
    {
      prediction: 'FAKE',
      confidence: 0.87,
      explanation: 'Inconsistent lighting and unnatural facial boundaries suggest digital face replacement. Detected artifacts typical of deepfake generation.'
    },
    {
      prediction: 'REAL',
      confidence: 0.78,
      explanation: 'Authentic image metadata and compression artifacts indicate genuine content. Natural skin texture and eye reflections present.'
    },
    {
      prediction: 'FAKE',
      confidence: 0.94,
      explanation: 'Facial warping artifacts and inconsistent pixel patterns detected. High probability of AI-generated synthetic face.'
    }
  ],
  
  video: [
    {
      prediction: 'FAKE',
      confidence: 0.94,
      explanation: 'Lip-sync mismatch detected across multiple frames. Facial movements do not align with audio patterns, indicating voice dubbing or face replacement.'
    },
    {
      prediction: 'REAL',
      confidence: 0.89,
      explanation: 'Consistent temporal features and natural motion blur indicate authentic video. No frame-to-frame inconsistencies detected.'
    },
    {
      prediction: 'FAKE',
      confidence: 0.76,
      explanation: 'Subtle facial warping artifacts detected in 23% of analyzed frames. Possible deepfake video with advanced generation techniques.'
    },
    {
      prediction: 'REAL',
      confidence: 0.83,
      explanation: 'Natural lighting variations and authentic camera shake patterns. Video compression artifacts consistent with genuine recording.'
    }
  ],
  
  audio: [
    {
      prediction: 'FAKE',
      confidence: 0.91,
      explanation: 'Spectral analysis reveals synthetic voice generation patterns. Unnatural formant frequencies and missing vocal tract resonance.'
    },
    {
      prediction: 'REAL',
      confidence: 0.85,
      explanation: 'Natural vocal tract resonance and breathing patterns detected. Authentic background noise and microphone characteristics present.'
    },
    {
      prediction: 'FAKE',
      confidence: 0.73,
      explanation: 'Unusual frequency patterns in the 2-4kHz range suggest voice cloning technology. Detected repetitive prosodic patterns.'
    },
    {
      prediction: 'REAL',
      confidence: 0.88,
      explanation: 'Consistent speaker characteristics and natural speech rhythm. No signs of synthetic voice generation detected.'
    }
  ],
  
  text: [
    {
      prediction: 'FAKE',
      confidence: 0.88,
      explanation: 'Writing patterns and vocabulary usage consistent with large language model generation. Detected repetitive sentence structures and formal tone.'
    },
    {
      prediction: 'REAL',
      confidence: 0.82,
      explanation: 'Natural language flow and personal writing style indicators suggest human authorship. Unique expressions and informal language patterns present.'
    },
    {
      prediction: 'FAKE',
      confidence: 0.79,
      explanation: 'High coherence and grammatical perfection typical of AI-generated content. Lacks personal anecdotes and emotional nuances.'
    },
    {
      prediction: 'REAL',
      confidence: 0.75,
      explanation: 'Inconsistent writing quality and personal voice detected. Natural errors and colloquialisms indicate human authorship.'
    }
  ]
};

// Simulate API delay with realistic timing
export const simulateApiDelay = () => {
  const baseDelay = 1500; // 1.5 seconds minimum
  const randomDelay = Math.random() * 3000; // Up to 3 additional seconds
  return baseDelay + randomDelay;
};

// Main mock API function
export const mockAnalyzeContent = async (content, contentType) => {
  // Simulate processing delay
  const delay = simulateApiDelay();
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Get appropriate responses for content type
  const responses = mockResponses[contentType] || mockResponses.text;
  
  // Add some logic based on content characteristics
  let selectedResponse;
  
  if (contentType === 'text' && content) {
    // Simple heuristics for text analysis
    const text = content.toLowerCase();
    const hasPersonalPronouns = /\b(i|me|my|myself|we|us|our)\b/.test(text);
    const hasEmotions = /\b(feel|love|hate|excited|sad|happy|angry)\b/.test(text);
    const isVeryFormal = !/\b(gonna|wanna|kinda|sorta|yeah|ok|okay)\b/.test(text) && text.length > 100;
    
    if (hasPersonalPronouns && hasEmotions && !isVeryFormal) {
      // More likely to be real
      selectedResponse = responses.filter(r => r.prediction === 'REAL')[Math.floor(Math.random() * 2)];
    } else if (isVeryFormal && text.length > 200) {
      // More likely to be AI-generated
      selectedResponse = responses.filter(r => r.prediction === 'FAKE')[Math.floor(Math.random() * 2)];
    }
  }
  
  // If no specific logic applied, use random selection
  if (!selectedResponse) {
    selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  }
  
  return {
    ...selectedResponse,
    timestamp: new Date().toISOString(),
    processingTime: Math.round(delay),
    contentType
  };
};

// Error simulation for testing
export const mockApiError = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  throw new Error('Analysis service temporarily unavailable. Please try again.');
};

// File size validation
export const validateFileSize = (file, maxSizeMB = 50) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// File type validation
export const validateFileType = (file, allowedTypes = ['image', 'video', 'audio']) => {
  return allowedTypes.some(type => file.type.startsWith(type + '/'));
};

// Content validation for text
export const validateTextContent = (text, minLength = 10, maxLength = 10000) => {
  const trimmedText = text.trim();
  return trimmedText.length >= minLength && trimmedText.length <= maxLength;
};
