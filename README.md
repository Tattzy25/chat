# 🚀 Modern Chat Application

A sleek, modern chat application with **Groq AI integration**, featuring a **jet black theme** with **neon purple accents** and comprehensive file upload capabilities.

## ✨ Features

### 🎨 **Modern UI Design**
- **Jet Black Theme** with neon purple (#BB86FC) highlights
- **Collapsible Sidebar** with organized sections
- **Responsive Design** that works on all devices
- **Professional Layout** with smooth animations

### 🤖 **AI Integration**
- **Groq API Integration** for fast AI responses
- **Custom System Prompts** for personalized conversations
- **Real-time Messaging** with typing indicators
- **Message History** with local storage

### 📁 **File Management**
- **Image Upload Support** (PNG, JPG, JPEG, GIF, WebP)
- **Drag & Drop Interface** for easy file selection
- **Image Thumbnails** with preview functionality
- **File Size Validation** (max 10MB per file)

### 🔧 **Advanced Features**
- **Error Handling System** with user-friendly notifications
- **Copy Message Functionality** for easy sharing
- **Conversation Persistence** using localStorage
- **Connection Testing** for API validation
- **Modular Architecture** for easy maintenance

## 🏗️ **Architecture**

This application follows a **modular architecture** pattern for maintainability and scalability:

```
chat/
├── index.html              # Main HTML structure
├── style.css              # Complete styling system
├── js/
│   ├── main.js            # Application controller
│   └── modules/
│       ├── config.js      # Configuration & constants
│       ├── dom.js         # DOM element management
│       ├── notifications.js # Toast notification system
│       ├── errorHandler.js # Error handling & validation
│       ├── storage.js     # localStorage management
│       ├── fileManager.js # File upload & processing
│       ├── messageHandler.js # Message display & formatting
│       ├── apiClient.js   # Groq API communication
│       └── ui.js          # UI state & interactions
```

## 🚀 **Quick Start**

### 1. **Setup**
```bash
# Clone the repository
git clone https://github.com/Tattzy25/chat.git
cd chat

# Install live-server (if not already installed)
npm install -g live-server

# Start the development server
live-server
```

### 2. **Configuration**
1. **Get Groq API Key**: Visit [Groq Console](https://console.groq.com/) and create an account
2. **Set API Key**: In the app sidebar, go to "Settings" and enter your Groq API key
3. **Optional**: Set a custom system prompt for personalized AI behavior

### 3. **Usage**
- **Send Messages**: Type in the message box and press Enter or click Send
- **Upload Images**: Click the 📎 button or drag & drop images
- **Test Connection**: Use the "Test Connection" button in settings
- **Clear Chat**: Use "Clear Conversation" to start fresh

## 🛠️ **Technologies Used**

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **API**: Groq AI for chat responses
- **Storage**: localStorage for conversation persistence
- **Architecture**: Modular design with ES6 imports/exports
- **Styling**: CSS Custom Properties with modern flexbox layout

## 🎨 **Design System**

### **Color Palette**
- **Background**: `#000000` (Pure Black)
- **Primary**: `#BB86FC` (Neon Purple)
- **Surface**: `#1e1e1e` (Dark Gray)
- **Text**: `#ffffff` (White)
- **Accent**: `#03DAC6` (Cyan accent)

### **Typography**
- **Font Family**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Modern spacing** and sizing for optimal readability

## 🔧 **Configuration Options**

### **API Settings**
- **Groq API Key**: Required for AI functionality
- **System Prompt**: Optional custom instructions for AI behavior

### **File Upload Limits**
- **Max File Size**: 10MB per file
- **Max Files**: 5 files at once
- **Supported Types**: PNG, JPG, JPEG, GIF, WebP

### **UI Preferences**
- **Sidebar State**: Automatically saved (expanded/collapsed)
- **Section States**: Individual section preferences remembered

## 📱 **Browser Compatibility**

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design works on all devices

## 🔒 **Privacy & Security**

- **Local Storage**: All data stored locally in your browser
- **No Server**: No personal data sent to external servers (except Groq API)
- **API Key Security**: Keys stored locally, never transmitted except to Groq
- **No Analytics**: No tracking or analytics code included

## 🐛 **Error Handling**

The application includes comprehensive error handling:

- **Network Errors**: Automatic retry suggestions
- **File Upload Errors**: Clear validation messages
- **API Errors**: User-friendly error explanations
- **Client Errors**: Graceful degradation with notifications

## 🔄 **Development**

### **Adding New Features**
1. Create new module in `js/modules/`
2. Import in `main.js`
3. Add initialization logic
4. Update this README

### **Modifying Existing Features**
- **UI Changes**: Edit appropriate module in `js/modules/`
- **Styling**: Update `style.css`
- **Configuration**: Modify `js/modules/config.js`

## 📝 **License**

This project is open source and available under the MIT License.

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📞 **Support**

If you encounter any issues or have questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for modern web development**