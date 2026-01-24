
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

export enum AIProvider {
  GEMINI = 'Gemini',  // Google Gemini (Free tier available)
  OPENAI = 'OpenAI'   // OpenAI GPT-4o (Paid, requires API key)
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
  HAUSA = 'ha',
  YORUBA = 'yo',
  IGBO = 'ig',
  AMHARIC = 'am',
  OROMO = 'om',
  SOMALI = 'so',
  WOLOF = 'wo',
  KINYARWANDA = 'rw',
  LINGALA = 'ln',
  TIGRINYA = 'ti',

  // European Languages
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  POLISH = 'pl',
  DUTCH = 'nl',
  TURKISH = 'tr',
  GREEK = 'el',
  SWEDISH = 'sv',
  NORWEGIAN = 'no',
  DANISH = 'da',
  FINNISH = 'fi',
  CZECH = 'cs',
  HUNGARIAN = 'hu',
  ROMANIAN = 'ro',
  UKRAINIAN = 'uk',
  CROATIAN = 'hr',
  SERBIAN = 'sr',
  BULGARIAN = 'bg',
  SLOVAK = 'sk',
  CATALAN = 'ca',

  // Asian Languages
  CHINESE = 'zh',
  HINDI = 'hi',
  BENGALI = 'bn',
  URDU = 'ur',
  PUNJABI = 'pa',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  VIETNAMESE = 'vi',
  THAI = 'th',
  INDONESIAN = 'id',
  MALAY = 'ms',
  TAGALOG = 'tl',
  TAMIL = 'ta',
  TELUGU = 'te',
  MARATHI = 'mr',
  GUJARATI = 'gu',
  KANNADA = 'kn',
  MALAYALAM = 'ml',
  BURMESE = 'my',
  KHMER = 'km',
  NEPALI = 'ne',
  SINHALA = 'si',

  // Middle Eastern Languages
  ARABIC = 'ar',
  HEBREW = 'he',
  PERSIAN = 'fa',
  KURDISH = 'ku',

  // Other Languages
  ALBANIAN = 'sq',
  ARMENIAN = 'hy',
  AZERBAIJANI = 'az',
  BASQUE = 'eu',
  BELARUSIAN = 'be',
  BOSNIAN = 'bs',
  ESTONIAN = 'et',
  GALICIAN = 'gl',
  GEORGIAN = 'ka',
  ICELANDIC = 'is',
  KAZAKH = 'kk',
  LATVIAN = 'lv',
  LITHUANIAN = 'lt',
  MACEDONIAN = 'mk',
  MALTESE = 'mt',
  MONGOLIAN = 'mn',
  PASHTO = 'ps',
  SWAHILI_CONGO = 'sw-CD',
  UZBEK = 'uz',
  WELSH = 'cy',
  YIDDISH = 'yi'
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
  senderName: string;
  senderRole: 'driver' | 'passenger';
  text: string;
  timestamp: number;
  rideId?: string; // Link message to specific ride for evidence
  read: boolean;
}

export interface RideMessageHistory {
  rideId: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  messages: Message[];
  createdAt: number;
  lastMessageAt: number;
}

export enum ReportReason {
  HARASSMENT = 'Sexual Harassment',
  INAPPROPRIATE_LANGUAGE = 'Inappropriate Language',
  THREATENING_BEHAVIOR = 'Threatening Behavior',
  UNSAFE_DRIVING = 'Unsafe Driving',
  DISCRIMINATION = 'Discrimination',
  SCAM_ATTEMPT = 'Scam or Fraud Attempt',
  OTHER = 'Other'
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: 'driver' | 'passenger';
  reportedUserId: string;
  reportedUserName: string;
  reportedUserRole: 'driver' | 'passenger';
  reason: ReportReason;
  description: string;
  rideId: string;
  messageHistory: Message[]; // Preserved evidence
  screenshots?: string[]; // Base64 encoded screenshots
  timestamp: number;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
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
  aiProvider: AIProvider;
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
  messageHistory: RideMessageHistory[];
  blockedUsers: string[]; // Array of blocked user IDs
  reports: Report[];
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
