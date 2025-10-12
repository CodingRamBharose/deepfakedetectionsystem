# DeepFake Detection Frontend

A clean, production-ready Next.js frontend for multimodal deepfake detection with Tailwind CSS styling.

## 🚀 Features

- **Landing Page** (`/`) - Clean introduction with feature overview and call-to-action
- **Detection Page** (`/detect`) - File upload and text analysis with real-time results
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Mock API Integration** - Simulated backend responses for testing
- **File Upload** - Drag & drop interface for images, videos, and audio
- **Text Analysis** - Direct text input for AI-generated content detection
- **Real-time Results** - Confidence scores, predictions, and detailed explanations

## 📁 Project Structure

```
frontend/src/
├── app/
│   ├── detect/
│   │   └── page.js          # Detection page with upload & analysis
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.js           # Root layout with metadata
│   └── page.js             # Landing page
├── components/
│   ├── FileUpload.js       # Drag & drop file upload component
│   ├── Loader.js           # Loading spinners and animations
│   ├── Navbar.js           # Navigation header
│   └── ResultCard.js       # Analysis results display
└── utils/
    └── mockApi.js          # Mock API responses and validation
```

## 🎨 Design System

### Colors
- **Primary**: Blue (`blue-600`, `blue-700`)
- **Success**: Green (`green-600`, `green-100`)
- **Error**: Red (`red-600`, `red-100`)
- **Warning**: Yellow (`yellow-600`, `yellow-100`)
- **Neutral**: Gray shades (`gray-50` to `gray-900`)

### Components
- **Rounded corners**: `rounded-lg` (8px)
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Spacing**: Consistent padding and margins using Tailwind scale
- **Typography**: Geist Sans font with proper hierarchy

## 🔧 Mock API

The frontend includes a comprehensive mock API system:

### Content Types Supported
- **Images** - Face manipulation detection
- **Videos** - Deepfake and lip-sync analysis
- **Audio** - Voice cloning detection
- **Text** - AI-generated content analysis

### Mock Response Structure
```javascript
{
  prediction: 'REAL' | 'FAKE',
  confidence: 0.0-1.0,
  explanation: 'Detailed analysis explanation',
  timestamp: '2024-01-01T00:00:00.000Z',
  processingTime: 2500,
  contentType: 'image' | 'video' | 'audio' | 'text'
}
```

### Validation Features
- File size limits (50MB max)
- File type validation
- Text length validation (10-10,000 characters)
- Error handling with user-friendly messages

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to `http://localhost:3000`

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with title and subtitle
- Feature grid showcasing supported content types
- Statistics section
- Call-to-action button linking to detection page

### Detection Page (`/detect`)
- Tab-based interface (File Upload / Text Analysis)
- Drag & drop file upload with preview
- Text input area with character counter
- Real-time analysis with loading states
- Results display with confidence visualization
- Informational help section

## 🎯 Key Features

### File Upload Component
- Drag & drop functionality
- Click to upload fallback
- File type icons and size display
- Visual feedback for different states
- File removal option

### Result Card Component
- Color-coded predictions (green for REAL, red for FAKE)
- Confidence score with progress bar
- Detailed explanation text
- Timestamp and processing time
- Error state handling

### Loading States
- Multiple spinner designs
- Context-aware loading messages
- Smooth transitions and animations

## 🔮 Future Enhancements

When connecting to a real backend:

1. **Replace mock API calls** in `/utils/mockApi.js`
2. **Add authentication** if required
3. **Implement file upload** to backend storage
4. **Add progress tracking** for large file processing
5. **Include batch processing** for multiple files
6. **Add result history** and user accounts

## 🛠 Customization

### Styling
- All styles use Tailwind CSS utility classes
- Custom CSS variables in `globals.css`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`

### Mock Data
- Modify responses in `/utils/mockApi.js`
- Adjust processing delays and confidence scores
- Add new content types or analysis features

### Components
- All components are modular and reusable
- Props-based configuration
- Consistent naming and structure

## 📊 Performance

- **Optimized images** with Next.js Image component
- **Code splitting** with dynamic imports
- **Responsive design** for all screen sizes
- **Accessibility** features with proper ARIA labels
- **SEO optimized** with proper metadata

## 🔒 Security Considerations

- Client-side file validation
- File size limits
- Content type restrictions
- XSS protection with proper escaping
- No sensitive data in client-side code

---

**Ready for production!** This frontend provides a solid foundation for your deepfake detection application with clean code, modern design, and excellent user experience.
