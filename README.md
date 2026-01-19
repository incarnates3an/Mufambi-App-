# Mufambi - AI Ride-Hailing Application

A next-generation AI-powered ride-hailing application with intelligent ride matching, real-time tracking, and a customizable AI companion for an enhanced travel experience.

## Features

### For Passengers
- **AI Companion**: Personalized AI assistant with voice interaction powered by Google Gemini
- **Smart Ride Matching**: Intelligent driver bidding system with real-time matching
- **Entertainment Hub**: In-ride games and entertainment options
- **Buddy System**: AI-powered social matching to connect with other passengers
- **Safety Features**:
  - Safe Circle - Emergency contact monitoring
  - Real-time ride sharing capabilities
  - Live location tracking
- **Flexible Payment**: Multiple payment methods including loyalty points
- **Wallet Integration**: Built-in wallet for seamless transactions

### For Drivers
- **Performance Analytics**: Detailed earnings and performance metrics with interactive charts
- **Rank System**: Progress through Bronze, Silver, Gold, and Elite ranks
- **Real-time Dashboard**: Monitor earnings, ratings, and response times
- **Smart Notifications**: Get notified of new ride requests instantly

## Tech Stack

- **Frontend**: React 19.2.3 + TypeScript
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **AI Integration**: Google Generative AI (Gemini)
- **Charts**: Recharts 3.6
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ or npm/yarn
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/incarnates3an/Mufambi-App-.git
   cd Mufambi-App-
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up your Gemini API Key**

   Open your browser's developer console and run:
   ```javascript
   localStorage.setItem('GEMINI_API_KEY', 'your-api-key-here')
   ```

   Replace `'your-api-key-here'` with your actual Gemini API key.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

```
Mufambi-App-/
├── components/
│   ├── AI/
│   │   └── Companion.tsx          # AI voice and chat assistant
│   ├── Auth/
│   │   └── Login.tsx              # Authentication flow
│   ├── Driver/
│   │   └── Dashboard.tsx          # Driver interface
│   ├── Entertainment/
│   │   ├── Arcade.tsx             # Games
│   │   └── Hub.tsx                # Entertainment center
│   ├── Layout/
│   │   └── Navigation.tsx         # Bottom navigation
│   ├── Passenger/
│   │   ├── BuddyHub.tsx          # Social matching
│   │   ├── Dashboard.tsx         # Main passenger interface
│   │   ├── PaymentModal.tsx      # Payment processing
│   │   ├── SafeCircleOverlay.tsx # Emergency contacts
│   │   ├── ShareRideOverlay.tsx  # Ride sharing
│   │   └── WalletOverlay.tsx     # Wallet management
│   └── Shared/
│       ├── ErrorBoundary.tsx     # Error handling
│       ├── Map.tsx               # Interactive map
│       └── SettingsOverlay.tsx   # App settings
├── services/
│   └── gemini.ts                 # Google AI integration
├── App.tsx                       # Main app component
├── types.ts                      # TypeScript definitions
├── index.tsx                     # Entry point
└── index.html                    # HTML template
```

## Key Features Explained

### AI Companion
The AI companion uses Google's Gemini with:
- Text-based chat with reasoning capabilities
- Voice interaction (live audio streaming)
- Context-aware responses based on ride status and user mood
- Personality customization (Friendly, Professional, Energetic)

### Ride Matching System
- Passengers set destination and price
- Drivers bid on rides with ETA and pricing
- Rank-based driver selection (Elite, Gold, Silver, Bronze)
- Real-time status updates

### Safety Features
- **Safe Circle**: Add trusted contacts who can monitor your rides
- **Live Sharing**: Share ride details with friends/family
- **Real-time Tracking**: Monitor driver location during rides

## Configuration

### Tailwind Configuration
Customize the theme in `tailwind.config.js`

### Vite Configuration
Build settings can be modified in `vite.config.ts`

### TypeScript Configuration
Type checking settings in `tsconfig.json`

## Known Issues & Limitations

1. **API Key Storage**: Currently uses localStorage. For production, implement secure backend authentication.
2. **Mock Data**: Driver bids and some analytics use mock data. Integrate with a real backend for production.
3. **Geolocation**: Requires browser geolocation permission for accurate tracking.
4. **Voice Features**: Live audio requires microphone permission and works best in Chrome/Edge.

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari (Limited voice support)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Gemini AI for powering the AI companion
- Lucide for beautiful icons
- Tailwind CSS for styling utilities

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for the future of transportation