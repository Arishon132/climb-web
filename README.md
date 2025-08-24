# 🏔️ Climbing App

A modern React Native/Expo application for managing climbing gyms with interactive maps, gym details, and a beautiful user interface.

## ✨ Features

- **🗺️ Interactive Maps** - Google Maps integration with gym locations
- **🏢 Gym Management** - Add, edit, and delete climbing gyms
- **📱 Cross-Platform** - Works on web, iOS, and Android
- **🔍 Search Functionality** - Find gyms quickly
- **⭐ Rating System** - Visual gym ratings
- **📏 Distance Info** - See how far each gym is
- **🕒 Opening Hours** - Detailed gym schedules
- **🎨 Modern UI** - Beautiful, responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/climbing-app.git
   cd climbing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **Web**: Press `w` or visit `http://localhost:8081`
   - **iOS**: Press `i` (requires iOS Simulator)
   - **Android**: Press `a` (requires Android Emulator)

## 📱 App Structure

```
ClimbingApp/
├── App.js                 # Main app component with navigation
├── WelcomeScreen.js       # Landing page
├── GymList.js            # Gym listing with search and CRUD
├── GymDetails.js         # Detailed gym view with map
├── screens/
│   └── EditGymScreen.js  # Gym editing interface
├── components/
│   └── Map/              # Cross-platform map components
│       ├── Map.native.js # React Native Maps (mobile)
│       ├── Map.web.js    # Google Maps iframe (web)
│       └── index.js      # Platform-specific exports
└── assets/               # Images and static files
```

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Screen navigation
- **React Native Maps** - Mobile map integration
- **Google Maps** - Web map integration
- **React Native Web** - Web compatibility

## 🎨 Features in Detail

### Gym Management
- Add new climbing gyms with detailed information
- Edit existing gym details and hours
- Delete gyms with confirmation
- Search and filter gyms by name or location

### Interactive Maps
- **Web**: Google Maps iframe with gym markers
- **Mobile**: Native map components with directions
- Floating gym information cards
- Action buttons for directions and coordinates

### Modern UI/UX
- Clean, card-based design
- Professional color scheme
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Intuitive navigation

## 🔧 Development

### Running the App

```bash
# Start development server
npx expo start

# Start with web support
npx expo start --web

# Start with cache cleared
npx expo start -c
```

### Building for Production

```bash
# Build for web
npx expo build:web

# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ using React Native and Expo**
