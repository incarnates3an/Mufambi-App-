
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { UserRole, AppState, RideStatus, AIPersonality, AIProvider, PaymentMethod, DriverRank, Location, SafeCircleContact, Language } from './types';
import Navigation from './components/Layout/Navigation';
import Login from './components/Auth/Login';
import { ToastContainer, useToast } from './components/Shared/Toast';
import { FullScreenLoader } from './components/Shared/LoadingSkeletons';
import { Bell, User, MapPin } from 'lucide-react';
import { reverseGeocode } from './services/location';

// Lazy load heavy components for better initial load performance
const PassengerDashboard = lazy(() => import('./components/Passenger/Dashboard'));
const DriverDashboard = lazy(() => import('./components/Driver/Dashboard'));
const AICompanion = lazy(() => import('./components/AI/Companion'));
const SettingsOverlay = lazy(() => import('./components/Shared/SettingsOverlay'));
const WalletOverlay = lazy(() => import('./components/Passenger/WalletOverlay'));

const INITIAL_LOCATION = { lat: -17.8248, lng: 31.0530, address: "Harare City Centre Node" };

const MOCK_SAFE_CIRCLE: SafeCircleContact[] = [
  { id: 'sc1', name: 'Munashe (Dad)', phone: '+263 771 000 001', isMonitoring: false, lastSync: Date.now() },
  { id: 'sc2', name: 'Tariro (Sister)', phone: '+263 772 000 002', isMonitoring: false, lastSync: Date.now() },
];

const App: React.FC = () => {
  const { toasts, dismissToast, info, warning, success, error } = useToast();

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
    aiProvider: AIProvider.GEMINI,
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
    messageHistory: [],
    blockedUsers: [],
    reports: [],
    completedRides: 188,
    avgResponseTime: 6.2,
    driverRating: 4.88,
    hapticsEnabled: true,
    biometricsEnabled: true,
    preferredLanguage: Language.ENGLISH_ZW,
    notificationsEnabled: true,
    soundEnabled: true
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const lastGeocodeRef = useRef(0);
  const geocodeInProgress = useRef(false);

  const updateState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const addNotification = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    switch (type) {
      case 'success':
        success(msg);
        break;
      case 'error':
        error(msg);
        break;
      case 'warning':
        warning(msg);
        break;
      default:
        info(msg);
    }
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
              const locationResult = await reverseGeocode(latitude, longitude);
              lastGeocodeRef.current = Date.now();
              updateState({
                currentLocation: { lat: latitude, lng: longitude, address: locationResult.address }
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
      addNotification("Device lacks Localization Hardware", 'error');
    }
  }, [appState.isLoggedIn]); // Only run when login status changes

  // SAFETY FEATURES: Load persistent message history, blocked users, and reports from localStorage
  useEffect(() => {
    try {
      const savedMessageHistory = localStorage.getItem('mufambi_message_history');
      const savedBlockedUsers = localStorage.getItem('mufambi_blocked_users');
      const savedReports = localStorage.getItem('mufambi_reports');

      if (savedMessageHistory || savedBlockedUsers || savedReports) {
        setAppState(prev => ({
          ...prev,
          messageHistory: savedMessageHistory ? JSON.parse(savedMessageHistory) : prev.messageHistory,
          blockedUsers: savedBlockedUsers ? JSON.parse(savedBlockedUsers) : prev.blockedUsers,
          reports: savedReports ? JSON.parse(savedReports) : prev.reports
        }));
      }
    } catch (error) {
      console.error('Failed to load safety data from localStorage:', error);
    }
  }, []); // Run once on mount

  // SAFETY FEATURES: Persist message history, blocked users, and reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mufambi_message_history', JSON.stringify(appState.messageHistory));
      localStorage.setItem('mufambi_blocked_users', JSON.stringify(appState.blockedUsers));
      localStorage.setItem('mufambi_reports', JSON.stringify(appState.reports));
    } catch (error) {
      console.error('Failed to save safety data to localStorage:', error);
    }
  }, [appState.messageHistory, appState.blockedUsers, appState.reports]);

  const handleLogin = (role: UserRole) => {
    updateState({ userRole: role, isLoggedIn: true });
    addNotification(`Identity Synchronized: ${role === UserRole.PASSENGER ? 'Passenger' : 'Driver'} Mode Active`, 'success');
  };

  if (!appState.isLoggedIn) {
    return <Login onSelectRole={handleLogin} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#050505] overflow-hidden relative">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Suspense fallback={<FullScreenLoader message="Loading Dashboard..." />}>
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
      </Suspense>

      <Navigation
        role={appState.userRole}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onWalletClick={() => setIsWalletOpen(true)}
      />
    </div>
  );
};

export default App;
