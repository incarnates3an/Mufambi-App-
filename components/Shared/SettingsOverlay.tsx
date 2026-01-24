
import React, { useState } from 'react';
import {
  X, User, Shield, Bell, CreditCard, BrainCircuit,
  LogOut, ChevronRight, Fingerprint, Activity,
  Leaf, Trophy, Settings as SettingsIcon, Check,
  Sparkles, Wallet, Smartphone, DollarSign, Car,
  FileText, Hash, MapPin, Heart, Users, Zap, Star,
  Globe, ChevronDown, ChevronUp, Volume2, VolumeX, Building2, TrendingUp
} from 'lucide-react';
import { AppState, AIPersonality, AIProvider, PaymentMethod, UserRole, DriverRank, Language, LanguageOption } from '../../types';

interface SettingsOverlayProps {
  appState: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onClose: () => void;
  onOpenCompanyDashboard?: () => void;
}

// Zimbabwe Languages (Progenitor Country) - All 16 official languages
const zimbabweLanguages: LanguageOption[] = [
  { code: Language.SHONA, name: 'Shona', nativeName: 'chiShona', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.NDEBELE, name: 'Ndebele', nativeName: 'isiNdebele', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.ENGLISH_ZW, name: 'English (Zimbabwe)', nativeName: 'English', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.TONGA, name: 'Tonga', nativeName: 'chiTonga', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.SHANGANI, name: 'Shangani', nativeName: 'xiTsonga', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.VENDA, name: 'Venda', nativeName: 'tshiVenḓa', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.KALANGA, name: 'Kalanga', nativeName: 'Kalanga', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.NAMBYA, name: 'Nambya', nativeName: 'chiNambya', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.SOTHO, name: 'Sotho', nativeName: 'Sesotho', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.TSWANA, name: 'Tswana', nativeName: 'Setswana', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.CHIBARWE, name: 'Chibarwe', nativeName: 'chiBarwe', flag: '🇿🇼', isZimbabwean: true },
  { code: Language.SIGN_LANGUAGE_ZW, name: 'Zimbabwe Sign Language', nativeName: 'ZSL', flag: '🇿🇼', isZimbabwean: true },
];

// Other African Languages
const africanLanguages: LanguageOption[] = [
  { code: Language.SWAHILI, name: 'Swahili', nativeName: 'Kiswahili', flag: '🌍' },
  { code: Language.ZULU, name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: Language.XHOSA, name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
  { code: Language.AFRIKAANS, name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: Language.HAUSA, name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: Language.YORUBA, name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: Language.IGBO, name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: Language.AMHARIC, name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: Language.OROMO, name: 'Oromo', nativeName: 'Oromoo', flag: '🇪🇹' },
  { code: Language.SOMALI, name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴' },
  { code: Language.WOLOF, name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳' },
  { code: Language.KINYARWANDA, name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: Language.LINGALA, name: 'Lingala', nativeName: 'Lingála', flag: '🇨🇩' },
  { code: Language.TIGRINYA, name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷' },
];

// European Languages
const europeanLanguages: LanguageOption[] = [
  { code: Language.ENGLISH, name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: Language.SPANISH, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: Language.FRENCH, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: Language.GERMAN, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: Language.ITALIAN, name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: Language.PORTUGUESE, name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: Language.RUSSIAN, name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: Language.POLISH, name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: Language.DUTCH, name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: Language.TURKISH, name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: Language.GREEK, name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: Language.SWEDISH, name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: Language.NORWEGIAN, name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: Language.DANISH, name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: Language.FINNISH, name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: Language.CZECH, name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: Language.HUNGARIAN, name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: Language.ROMANIAN, name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: Language.UKRAINIAN, name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: Language.CROATIAN, name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: Language.SERBIAN, name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: Language.BULGARIAN, name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: Language.SLOVAK, name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: Language.CATALAN, name: 'Catalan', nativeName: 'Català', flag: '🇪🇸' },
];

// Asian Languages
const asianLanguages: LanguageOption[] = [
  { code: Language.CHINESE, name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: Language.HINDI, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: Language.BENGALI, name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: Language.URDU, name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: Language.PUNJABI, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: Language.JAPANESE, name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: Language.KOREAN, name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: Language.VIETNAMESE, name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: Language.THAI, name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: Language.INDONESIAN, name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: Language.MALAY, name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: Language.TAGALOG, name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: Language.TAMIL, name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: Language.TELUGU, name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: Language.MARATHI, name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: Language.GUJARATI, name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: Language.KANNADA, name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: Language.MALAYALAM, name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: Language.BURMESE, name: 'Burmese', nativeName: 'မြန်မာဘာသာ', flag: '🇲🇲' },
  { code: Language.KHMER, name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
  { code: Language.NEPALI, name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: Language.SINHALA, name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
];

// Middle Eastern Languages
const middleEasternLanguages: LanguageOption[] = [
  { code: Language.ARABIC, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: Language.HEBREW, name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: Language.PERSIAN, name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: Language.KURDISH, name: 'Kurdish', nativeName: 'Kurdî', flag: '🌍' },
];

// Other Languages
const otherLanguages: LanguageOption[] = [
  { code: Language.ALBANIAN, name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱' },
  { code: Language.ARMENIAN, name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲' },
  { code: Language.AZERBAIJANI, name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: Language.BASQUE, name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸' },
  { code: Language.BELARUSIAN, name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' },
  { code: Language.BOSNIAN, name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦' },
  { code: Language.ESTONIAN, name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: Language.GALICIAN, name: 'Galician', nativeName: 'Galego', flag: '🇪🇸' },
  { code: Language.GEORGIAN, name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: Language.ICELANDIC, name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸' },
  { code: Language.KAZAKH, name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: Language.LATVIAN, name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: Language.LITHUANIAN, name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: Language.MACEDONIAN, name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰' },
  { code: Language.MALTESE, name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹' },
  { code: Language.MONGOLIAN, name: 'Mongolian', nativeName: 'Монгол', flag: '🇲🇳' },
  { code: Language.PASHTO, name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫' },
  { code: Language.UZBEK, name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: Language.WELSH, name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: Language.YIDDISH, name: 'Yiddish', nativeName: 'ייִדיש', flag: '🌍' },
];

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ appState, updateState, onClose, onOpenCompanyDashboard }) => {
  const personalities = Object.values(AIPersonality);
  const isDriver = appState.userRole === UserRole.DRIVER;

  const [showZimbabweLanguages, setShowZimbabweLanguages] = useState(false);
  const [showAfricanLanguages, setShowAfricanLanguages] = useState(false);
  const [showEuropeanLanguages, setShowEuropeanLanguages] = useState(false);
  const [showAsianLanguages, setShowAsianLanguages] = useState(false);
  const [showMiddleEasternLanguages, setShowMiddleEasternLanguages] = useState(false);
  const [showOtherLanguages, setShowOtherLanguages] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  const paymentMethods = [
    { id: PaymentMethod.CARD, icon: CreditCard, label: 'Cloud Card' },
    { id: PaymentMethod.ECOCASH, icon: Smartphone, label: 'EcoCash' },
    { id: PaymentMethod.PAYPAL, icon: Wallet, label: 'PayPal' },
    { id: PaymentMethod.CASH, icon: DollarSign, label: 'Cash Node' },
  ];

  const handleLogout = () => {
    updateState({ isLoggedIn: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50">
        <div className="flex items-center gap-3">
          <SettingsIcon className={`w-5 h-5 ${isDriver ? 'text-purple-500' : 'text-indigo-500'}`} />
          <h2 className="text-white font-black uppercase italic tracking-tighter text-lg">
            {isDriver ? 'Driver Command Center' : 'Passenger Identity Node'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* Profile Card - Role Differentiated */}
        <div className={`bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group`}>
          <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] blur-[80px] rounded-full ${isDriver ? 'bg-purple-600/10' : 'bg-indigo-600/10'}`}></div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 bg-gradient-to-tr rounded-[2.5rem] flex items-center justify-center border-4 border-[#050505] shadow-2xl transition-all ${
                isDriver ? 'from-purple-600 to-amber-500' : 'from-indigo-600 to-cyan-500'
              }`}>
                <span className="text-4xl font-black text-white italic">{appState.userName[0]}</span>
              </div>
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-[#0f0f12] shadow-xl ${isDriver ? 'bg-amber-400' : 'bg-indigo-400'}`}>
                {isDriver ? <Zap className="w-4 h-4 text-black" /> : <Trophy className="w-4 h-4 text-white" />}
              </div>
            </div>
            
            <div>
              <input 
                value={appState.userName}
                onChange={(e) => updateState({ userName: e.target.value })}
                className="bg-transparent text-2xl font-black text-white text-center italic tracking-tighter outline-none focus:text-indigo-400 transition-colors w-full"
              />
              <div className={`inline-flex items-center gap-2 mt-1 px-3 py-1 bg-white/5 border border-white/5 rounded-full`}>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isDriver ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {isDriver ? `${appState.driverRank} Level Operator` : 'Premium Commuter Node'}
                </span>
              </div>
            </div>

            {/* Role Specific Metadata */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {isDriver ? (
                <>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Vehicle Node</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-black text-white italic">ABX-9021</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Licence Uplink</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-black text-white italic">#DRV-2025-01</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">National ID</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-white italic">63-231XXX-W</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Contact Node</p>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-white italic">+263 7...</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
             <div className="text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{isDriver ? 'Revenue' : 'Impact'}</p>
                <div className="flex items-center justify-center gap-1.5">
                   {isDriver ? <DollarSign className="w-3 h-3 text-green-500" /> : <Leaf className="w-3 h-3 text-green-500" />}
                   <span className="text-sm font-black text-white italic">{isDriver ? `$${appState.earnings.toFixed(0)}` : `${appState.carbonOffset}kg`}</span>
                </div>
             </div>
             <div className="text-center border-x border-white/5">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{isDriver ? 'Rating' : 'Status'}</p>
                <div className="flex items-center justify-center gap-1.5">
                   {isDriver ? <Star className="w-3 h-3 text-amber-500" /> : <Activity className="w-3 h-3 text-indigo-500" />}
                   <span className="text-sm font-black text-white italic">{isDriver ? appState.driverRating : appState.completedRides}</span>
                </div>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Points</p>
                <div className="flex items-center justify-center gap-1.5">
                   <Sparkles className="w-3 h-3 text-indigo-500" />
                   <span className="text-sm font-black text-white italic">{appState.loyaltyPoints}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Neural Tuning - AI Personality & Provider Settings */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Companion Tuning</h3>
              <Sparkles className="w-3 h-3 text-indigo-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
              {/* AI Provider Selection */}
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">AI Engine</p>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateState({ aiProvider: AIProvider.GEMINI })}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                        appState.aiProvider === AIProvider.GEMINI
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-black/40 border-white/5 text-gray-500'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>Gemini</span>
                        <span className="text-[6px] text-green-400">FREE TIER</span>
                      </div>
                    </button>
                    <button
                      onClick={() => updateState({ aiProvider: AIProvider.OPENAI })}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                        appState.aiProvider === AIProvider.OPENAI
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-black/40 border-white/5 text-gray-500'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>GPT-4o</span>
                        <span className="text-[6px] text-amber-400">PAID</span>
                      </div>
                    </button>
                 </div>
                 {appState.aiProvider === AIProvider.OPENAI && (
                   <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                     <p className="text-[8px] text-amber-400 font-bold">
                       OpenAI requires an API key. Set it with: <code className="bg-black/40 px-1 py-0.5 rounded">localStorage.setItem('OPENAI_API_KEY', 'sk-...')</code>
                     </p>
                   </div>
                 )}
              </div>

              {/* AI Personality */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Neural Persona</p>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {personalities.map(p => (
                      <button
                        key={p}
                        onClick={() => updateState({ aiPersonality: p })}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                          appState.aiPersonality === p
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-black/40 border-white/5 text-gray-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Economic Configuration */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{isDriver ? 'Payout Protocol' : 'Settlement Method'}</h3>
              <Wallet className="w-3 h-3 text-green-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              {paymentMethods.map((pm) => (
                <button 
                  key={pm.id}
                  onClick={() => updateState({ selectedPaymentMethod: pm.id })}
                  className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <pm.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{pm.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${appState.selectedPaymentMethod === pm.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/10'}`}>
                    {appState.selectedPaymentMethod === pm.id && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* Language & Region Settings */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Language Node</h3>
              <Globe className="w-3 h-3 text-indigo-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-3">
              {/* Current Language Display */}
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{
                      zimbabweLanguages.find(l => l.code === appState.preferredLanguage)?.flag ||
                      africanLanguages.find(l => l.code === appState.preferredLanguage)?.flag ||
                      europeanLanguages.find(l => l.code === appState.preferredLanguage)?.flag ||
                      asianLanguages.find(l => l.code === appState.preferredLanguage)?.flag ||
                      middleEasternLanguages.find(l => l.code === appState.preferredLanguage)?.flag ||
                      otherLanguages.find(l => l.code === appState.preferredLanguage)?.flag || '🌐'
                    }</span>
                    <div>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active Language</p>
                      <p className="text-xs font-black text-white italic">{
                        zimbabweLanguages.find(l => l.code === appState.preferredLanguage)?.name ||
                        africanLanguages.find(l => l.code === appState.preferredLanguage)?.name ||
                        europeanLanguages.find(l => l.code === appState.preferredLanguage)?.name ||
                        asianLanguages.find(l => l.code === appState.preferredLanguage)?.name ||
                        middleEasternLanguages.find(l => l.code === appState.preferredLanguage)?.name ||
                        otherLanguages.find(l => l.code === appState.preferredLanguage)?.name || 'English'
                      }</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              {/* Zimbabwe Languages (Progenitor Country) - Featured First */}
              <div className="border border-amber-500/30 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
                <button
                  onClick={() => setShowZimbabweLanguages(!showZimbabweLanguages)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">🇿🇼</span>
                      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-white uppercase italic tracking-wider">Zimbabwe</p>
                      <p className="text-[7px] text-amber-400 font-black uppercase tracking-widest">Progenitor Country • 12 Languages</p>
                    </div>
                  </div>
                  {showZimbabweLanguages ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                </button>

                {showZimbabweLanguages && (
                  <div className="px-3 pb-3 space-y-1.5 bg-black/20">
                    {zimbabweLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          updateState({ preferredLanguage: lang.code });
                          if (appState.hapticsEnabled && 'vibrate' in navigator) {
                            navigator.vibrate(10);
                          }
                        }}
                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                          appState.preferredLanguage === lang.code
                            ? 'bg-amber-600 border border-amber-400 text-white shadow-lg'
                            : 'bg-black/40 border border-white/5 hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-white uppercase tracking-wider">{lang.name}</p>
                            <p className="text-[7px] text-gray-400 font-bold">{lang.nativeName}</p>
                          </div>
                        </div>
                        {appState.preferredLanguage === lang.code && (
                          <Check className="w-4 h-4 text-white stroke-[3px]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Other African Languages */}
              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowAfricanLanguages(!showAfricanLanguages)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <div className="text-left">
                      <p className="text-xs font-black text-white uppercase italic tracking-wider">Other African Languages</p>
                      <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">{africanLanguages.length} Languages</p>
                    </div>
                  </div>
                  {showAfricanLanguages ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showAfricanLanguages && (
                  <div className="px-3 pb-3 space-y-1.5 bg-black/20">
                    {africanLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          updateState({ preferredLanguage: lang.code });
                          if (appState.hapticsEnabled && 'vibrate' in navigator) {
                            navigator.vibrate(10);
                          }
                        }}
                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                          appState.preferredLanguage === lang.code
                            ? 'bg-indigo-600 border border-indigo-400 text-white shadow-lg'
                            : 'bg-black/40 border border-white/5 hover:border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-white uppercase tracking-wider">{lang.name}</p>
                            <p className="text-[7px] text-gray-400 font-bold">{lang.nativeName}</p>
                          </div>
                        </div>
                        {appState.preferredLanguage === lang.code && (
                          <Check className="w-4 h-4 text-white stroke-[3px]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* European Languages */}
              <LanguageSection
                title="European Languages"
                languages={europeanLanguages}
                flag="🇪🇺"
                isExpanded={showEuropeanLanguages}
                onToggle={() => setShowEuropeanLanguages(!showEuropeanLanguages)}
                currentLanguage={appState.preferredLanguage}
                onSelectLanguage={(code) => {
                  updateState({ preferredLanguage: code });
                  if (appState.hapticsEnabled && 'vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />

              {/* Asian Languages */}
              <LanguageSection
                title="Asian Languages"
                languages={asianLanguages}
                flag="🌏"
                isExpanded={showAsianLanguages}
                onToggle={() => setShowAsianLanguages(!showAsianLanguages)}
                currentLanguage={appState.preferredLanguage}
                onSelectLanguage={(code) => {
                  updateState({ preferredLanguage: code });
                  if (appState.hapticsEnabled && 'vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />

              {/* Middle Eastern Languages */}
              <LanguageSection
                title="Middle Eastern Languages"
                languages={middleEasternLanguages}
                flag="🕌"
                isExpanded={showMiddleEasternLanguages}
                onToggle={() => setShowMiddleEasternLanguages(!showMiddleEasternLanguages)}
                currentLanguage={appState.preferredLanguage}
                onSelectLanguage={(code) => {
                  updateState({ preferredLanguage: code });
                  if (appState.hapticsEnabled && 'vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />

              {/* Other Languages */}
              <LanguageSection
                title="Other Languages"
                languages={otherLanguages}
                flag="🌐"
                isExpanded={showOtherLanguages}
                onToggle={() => setShowOtherLanguages(!showOtherLanguages)}
                currentLanguage={appState.preferredLanguage}
                onSelectLanguage={(code) => {
                  updateState({ preferredLanguage: code });
                  if (appState.hapticsEnabled && 'vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />
           </div>
        </div>

        {/* Location Settings */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Location Services</h3>
              <MapPin className="w-3 h-3 text-green-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-black text-white uppercase italic tracking-widest">Free Location Service</p>
                </div>
                <p className="text-[8px] text-green-400 font-bold leading-relaxed">
                  Using OpenStreetMap Nominatim - completely free, no API key required. High-accuracy GPS with reverse geocoding.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-white uppercase italic">Current Location</p>
                    <p className="text-[8px] text-gray-500 font-bold mt-1">{appState.currentLocation?.address || 'Detecting...'}</p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {appState.currentLocation && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-1">GPS Coordinates</p>
                    <p className="text-[9px] font-bold text-white font-mono">
                      {appState.currentLocation.lat.toFixed(6)}, {appState.currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    try {
                      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0
                        });
                      });
                      updateState({
                        currentLocation: {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                          address: 'Updating address...'
                        }
                      });
                    } catch (error) {
                      alert('Location permission denied or unavailable');
                    }
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Refresh Location
                </button>
              </div>
           </div>
        </div>

        {/* Notifications & Sound Settings */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">System Alerts</h3>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              <ToggleRow
                label="Push Notifications"
                desc="Real-time ride & system alerts"
                icon={Bell}
                active={appState.notificationsEnabled}
                onClick={() => updateState({ notificationsEnabled: !appState.notificationsEnabled })}
              />
              <ToggleRow
                label="Sound Effects"
                desc="Audio feedback for events"
                icon={appState.soundEnabled ? Volume2 : VolumeX}
                active={appState.soundEnabled}
                onClick={() => updateState({ soundEnabled: !appState.soundEnabled })}
              />
           </div>
        </div>

        {/* Security & Role Specific Settings */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Advanced Logic</h3>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              <ToggleRow 
                label="Biometric Handshake" 
                desc="Encryption verification via FaceID" 
                icon={Fingerprint} 
                active={appState.biometricsEnabled}
                onClick={() => updateState({ biometricsEnabled: !appState.biometricsEnabled })}
              />
              <ToggleRow 
                label="Neural Haptics" 
                desc="Physical feedback on link events" 
                icon={Activity} 
                active={appState.hapticsEnabled}
                onClick={() => updateState({ hapticsEnabled: !appState.hapticsEnabled })}
              />
              {isDriver ? (
                <ToggleRow 
                  label="Auto-Accept High Bids" 
                  desc="Neural matching priority" 
                  icon={Zap} 
                  active={true}
                  onClick={() => {}}
                />
              ) : (
                <ToggleRow 
                  label="Share Mood Node" 
                  desc="Sync vibe with matched buddies" 
                  icon={Users} 
                  active={true}
                  onClick={() => {}}
                />
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 pb-12 space-y-4">
          {/* Company Dashboard Access */}
          {onOpenCompanyDashboard && (
            <button
              onClick={() => {
                onOpenCompanyDashboard();
                onClose();
              }}
              className="w-full py-6 bg-green-600/10 border border-green-500/20 text-green-500 rounded-[2.5rem] font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-2xl"
            >
              <Building2 className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs">Company Dashboard</p>
                <p className="text-[7px] font-bold opacity-70 tracking-wider">View Commission & Revenue</p>
              </div>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-6 bg-red-600/10 border border-red-500/20 text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-2xl"
          >
            <LogOut className="w-5 h-5" /> Terminate Node Session
          </button>
          <div className="text-center mt-6">
             <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Mufambi Core v9.8.1 • Stable Handshake</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, desc, icon: Icon, active, onClick }: any) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-2xl text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">{label}</h4>
        <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-gray-800'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7 shadow-[0_0_10px_#fff]' : 'left-1'}`}></div>
    </button>
  </div>
);

interface LanguageSectionProps {
  title: string;
  languages: LanguageOption[];
  flag: string;
  isExpanded: boolean;
  onToggle: () => void;
  currentLanguage: Language;
  onSelectLanguage: (code: Language) => void;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  title,
  languages,
  flag,
  isExpanded,
  onToggle,
  currentLanguage,
  onSelectLanguage
}) => (
  <div className="border border-white/5 rounded-2xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <div className="text-left">
          <p className="text-xs font-black text-white uppercase italic tracking-wider">{title}</p>
          <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">{languages.length} Languages</p>
        </div>
      </div>
      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>

    {isExpanded && (
      <div className="px-3 pb-3 space-y-1.5 bg-black/20">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
            className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
              currentLanguage === lang.code
                ? 'bg-indigo-600 border border-indigo-400 text-white shadow-lg'
                : 'bg-black/40 border border-white/5 hover:border-indigo-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="text-left">
                <p className="text-[9px] font-black text-white uppercase tracking-wider">{lang.name}</p>
                <p className="text-[7px] text-gray-400 font-bold">{lang.nativeName}</p>
              </div>
            </div>
            {currentLanguage === lang.code && (
              <Check className="w-4 h-4 text-white stroke-[3px]" />
            )}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default SettingsOverlay;
