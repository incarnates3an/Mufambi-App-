
export enum UserRole {
  PASSENGER = 'PASSENGER',
  DRIVER = 'DRIVER'
}

export enum DriverRank {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  ELITE = 'Elite'
}

export enum RideStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  BIDDING = 'BIDDING',
  EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED = 'COMPLETED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  ECOCASH = 'ECOCASH'
}

export enum AIPersonality {
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  ENERGETIC = 'Energetic'
}

export enum Language {
  // Zimbabwe Languages (Progenitor Country)
  SHONA = 'sn',
  NDEBELE = 'nd',
  ENGLISH_ZW = 'en-ZW',
  TONGA = 'to',
  SHANGANI = 'ts',
  VENDA = 've',
  KALANGA = 'kck',
  NAMBYA = 'nmb',
  SOTHO = 'st',
  TSWANA = 'tn',
  CHIBARWE = 'mxc',
  SIGN_LANGUAGE_ZW = 'zsl',
  // Other African Languages
  SWAHILI = 'sw',
  ZULU = 'zu',
  XHOSA = 'xh',
  AFRIKAANS = 'af',
  // International Languages
  ENGLISH = 'en',
  FRENCH = 'fr',
  PORTUGUESE = 'pt',
  SPANISH = 'es',
  CHINESE = 'zh',
  ARABIC = 'ar'
}

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag?: string;
  isZimbabwean?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverBid {
  id: string;
  driverName: string;
  rating: number;
  carModel: string;
  price: number;
  eta: number;
  rank: DriverRank;
  acceptsCredits: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Buddy {
  id: string;
  name: string;
  avatar: string;
  vibe: string;
  isOnline: boolean;
  commonInterests: string[];
  matchReason?: string;
}

export interface SafeCircleContact {
  id: string;
  name: string;
  phone: string;
  isMonitoring: boolean;
  lastSync: number;
}

export interface AppState {
  isLoggedIn: boolean;
  userRole: UserRole;
  userName: string;
  userBio: string;
  currentLocation: Location | null;
  destination: Location | null;
  rideStatus: RideStatus;
  activeBid: DriverBid | null;
  mood: string;
  aiPersonality: AIPersonality;
  isOnline: boolean;
  earnings: number;
  carbonOffset: number;
  loyaltyPoints: number;
  walletBalance: number;
  driverRank: DriverRank;
  selectedPaymentMethod: PaymentMethod;
  buddies: Buddy[];
  safeCircleContacts: SafeCircleContact[];
  isSafetyMonitoringActive: boolean;
  // PERFORMANCE METRICS
  completedRides: number;
  avgResponseTime: number; 
  driverRating: number;
  // SETTINGS TOGGLES
  hapticsEnabled: boolean;
  biometricsEnabled: boolean;
  preferredLanguage: Language;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
