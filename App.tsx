
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AppState, RideStatus, AIPersonality, PaymentMethod, DriverRank, Location, SafeCircleContact } from './types.ts';
import PassengerDashboard from './components/Passenger/Dashboard.tsx';
import DriverDashboard from './components/Driver/Dashboard.tsx';
import AICompanion from './components/AI/Companion.tsx';
import Navigation from './components/Layout/Navigation.tsx';
import Login from './components/Auth/Login.tsx';
import SettingsOverlay from './components/Shared/SettingsOverlay.tsx';
import WalletOverlay from './components/Passenger/WalletOverlay.tsx';
import { Bell, User, MapPin } from 'lucide-react';
import { reverseGeocode } from './services/gemini.ts';

const INITIAL_LOCATION = { lat: -17.8248, lng: 31.0530, address: "Harare City Centre Node" };

const MOCK_SAFE_CIRCLE: SafeCircleContact[] = [
  { id: 'sc1', name: 'Munashe (Dad)', phone: '+263 771 000 001', isMonitoring: false, lastSync: Date.now() },
  { id: 'sc2', name: 'Tariro (Sister)', phone: '+263 772 000 002', isMonitoring: false, lastSync: Date.now() },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isLoggedIn: false,
    userRole: UserRole.PASSENGER,
    userName: 'Kunashe T.',
    userBio: 'Navigating the digital grid. Elite commuter.',
    currentLocation: INITIAL_LOCATION,
    destination: null,
    rideStatus: RideStatus.IDLE,
    activeBid: null,
    mood: 'Neutral',
    aiPersonality: AIPersonality.FRIENDLY,
    isOnline: false,
    earnings: 1250.50,
    carbonOffset: 45.2,
    loyaltyPoints: 450,
    walletBalance: 245.50,
    driverRank: DriverRank.GOLD,
    selectedPaymentMethod: PaymentMethod.CASH,
    buddies: [],
    safeCircleContacts: MOCK_SAFE_CIRCLE,
    isSafetyMonitoringActive: false,
    completedRides: 188,
    avgResponseTime: 6.2,
    driverRating: 4.88,
    hapticsEnabled: true,
    biometricsEnabled: true
  });

  const [notifications, setNotifications] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  
  const lastGeocodeRef = useRef(0);
  const geocodeInProgress = useRef(false);

  const updateState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev.slice(0, 4)]);
  };

  // HIGH-PRECISION LOCATION WATCHER - FIXED DEPENDENCY ARRAY
  useEffect(() => {
    if (!appState.isLoggedIn) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const now = Date.now();
          
          // Use a local variable to hold the address so we don't cause infinite re-renders
          // geocodeInProgress prevents overlapping API calls if geocoding is slow
          if (now - lastGeocodeRef.current > 20000 && !geocodeInProgress.current) { 
            geocodeInProgress.current = true;
            try {
              const address = await reverseGeocode(latitude, longitude);
              lastGeocodeRef.current = Date.now();
              updateState({ 
                currentLocation: { lat: latitude, lng: longitude, address: address } 
              });
            } catch (err) {
              console.error("Geocoding failed, keeping coordinates only.");
            } finally {
              geocodeInProgress.current = false;
            }
          } else {
            // Just update coordinates without triggering a full geocode
            setAppState(prev => ({
              ...prev,
              currentLocation: { 
                ...prev.currentLocation,
                lat: latitude, 
                lng: longitude,
                address: prev.currentLocation?.address || "Synchronizing Node..."
              }
            }));
          }
          
          if (accuracy > 50) {
            addNotification("SIGNAL CLARITY: Accuracy jitter detected. Moving to clear sky.");
          }
        },
        (error) => {
          // Fixed [object Object] logging by accessing error properties
          const errorMsg = error.code === 1 ? "Permission Denied: Please enable Location Access." :
                          error.code === 3 ? "Signal Timeout: Recalibrating GPS Link..." :
                          error.message || "Unknown Localization Error";
          
          console.error("Neural Location Sync Failed:", errorMsg, error);
          addNotification(`CRITICAL: ${errorMsg}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      addNotification("ERROR: Device lacks Localization Hardware.");
    }
  }, [appState.isLoggedIn]); // Only run when login status changes

  const handleLogin = (role: UserRole) => {
    updateState({ userRole: role, isLoggedIn: true });
    addNotification(`Identity Synchronized: ${role === UserRole.PASSENGER ? 'Passenger' : 'Driver'} Mode Active`);
  };

  if (!appState.isLoggedIn) {
    return <Login onSelectRole={handleLogin} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#050505] overflow-hidden relative">
      {notifications.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-[100] animate-in slide-in-from-top-4">
          <div className="bg-indigo-600/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-white/20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">{notifications[0]}</p>
             </div>
             <button onClick={() => setNotifications([])} className="text-white/80 font-bold ml-4 text-xl">×</button>
          </div>
        </div>
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {appState.userRole === UserRole.PASSENGER ? (
          <PassengerDashboard appState={appState} updateState={updateState} addNotification={addNotification} />
        ) : (
          <DriverDashboard appState={appState} updateState={updateState} addNotification={addNotification} />
        )}
      </main>

      {appState.userRole === UserRole.PASSENGER && (
        <AICompanion personality={appState.aiPersonality} appState={appState} />
      )}

      {isSettingsOpen && (
        <SettingsOverlay 
          appState={appState} 
          updateState={updateState} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {isWalletOpen && (
        <WalletOverlay
          appState={appState}
          updateState={updateState}
          onClose={() => setIsWalletOpen(false)}
          addNotification={addNotification}
        />
      )}

      <Navigation 
        role={appState.userRole} 
        onSettingsClick={() => setIsSettingsOpen(true)}
        onWalletClick={() => setIsWalletOpen(true)}
      />
    </div>
  );
};

export default App;
