
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Gamepad2, Info, Smile, Mic, MicOff, Volume2, BrainCircuit } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { generateAIResponse, getTrivia } from '../../services/gemini';
import { generateOpenAIResponse, getOpenAITrivia, textToSpeech, speechToText } from '../../services/openai';
import { AIPersonality, AIProvider, AppState, Language } from '../../types';

// Language name mapping
const getLanguageName = (lang: Language): string => {
  const names: Record<Language, string> = {
    [Language.SHONA]: 'Shona (chiShona)',
    [Language.NDEBELE]: 'Ndebele (isiNdebele)',
    [Language.ENGLISH_ZW]: 'English',
    [Language.TONGA]: 'Tonga (chiTonga)',
    [Language.SHANGANI]: 'Shangani (xiTsonga)',
    [Language.VENDA]: 'Venda (tshiVenḓa)',
    [Language.KALANGA]: 'Kalanga',
    [Language.NAMBYA]: 'Nambya (chiNambya)',
    [Language.SOTHO]: 'Sotho (Sesotho)',
    [Language.TSWANA]: 'Tswana (Setswana)',
    [Language.CHIBARWE]: 'Chibarwe (chiBarwe)',
    [Language.SIGN_LANGUAGE_ZW]: 'English (for accessibility)',
    [Language.SWAHILI]: 'Swahili (Kiswahili)',
    [Language.ZULU]: 'Zulu (isiZulu)',
    [Language.XHOSA]: 'Xhosa (isiXhosa)',
    [Language.AFRIKAANS]: 'Afrikaans',
    [Language.ENGLISH]: 'English',
    [Language.FRENCH]: 'French (Français)',
    [Language.PORTUGUESE]: 'Portuguese (Português)',
    [Language.SPANISH]: 'Spanish (Español)',
    [Language.CHINESE]: 'Chinese (中文)',
    [Language.ARABIC]: 'Arabic (العربية)'
  };
  return names[lang] || 'English';
};

// Audio Utility Functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface AICompanionProps {
  personality: AIPersonality;
  appState: AppState;
}

const AICompanion: React.FC<AICompanionProps> = ({ personality, appState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Greetings. I am Mufambi Pro. I'm currently tuned to a ${personality.toLowerCase()} frequency. How can I optimize your journey today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const startLiveSession = async () => {
    if (isLiveActive) return;

    try {
      setIsLoading(true);
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') || '' : '';
      const ai = new GoogleGenAI({ apiKey });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let currentInputText = '';
      let currentOutputText = '';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setIsLoading(false);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            (window as any)._mufambi_stream = stream;
            (window as any)._mufambi_proc = scriptProcessor;
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const { output: outCtx } = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }

            if (message.serverContent?.inputTranscription) {
              currentInputText += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputText += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputText) setMessages(prev => [...prev, { role: 'user', text: currentInputText }]);
              if (currentOutputText) setMessages(prev => [...prev, { role: 'ai', text: currentOutputText }]);
              currentInputText = '';
              currentOutputText = '';
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            stopLiveSession();
          },
          onclose: () => {
            setIsLiveActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: `You are Mufambi Pro. Deeply reason through every word.

LANGUAGE: Respond in ${getLanguageName(appState.preferredLanguage)} to match the user's preference.
TONE: ${personality}
USER MOOD: ${appState.mood}
RIDE STATUS: ${appState.rideStatus}

Always respond in the user's preferred language and be culturally appropriate.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice session:", err);
      setIsLoading(false);
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if ((window as any)._mufambi_stream) {
      (window as any)._mufambi_stream.getTracks().forEach((t: any) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
      audioContextRef.current = null;
    }
    setIsLiveActive(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const context = `Ride status: ${appState.rideStatus}, Destination: ${appState.destination?.address || 'Not set'}, Mood: ${appState.mood}`;

    try {
      let response: string;

      if (appState.aiProvider === AIProvider.OPENAI) {
        // Use OpenAI GPT-4o
        response = await generateOpenAIResponse(userMsg, personality, context, appState.preferredLanguage);
      } else {
        // Use Google Gemini (default)
        response = await generateAIResponse(userMsg, personality, context, appState.preferredLanguage);
      }

      setMessages(prev => [...prev, { role: 'ai', text: response || "My reasoning circuits encountered an anomaly. Let me try again." }]);
    } catch (error: any) {
      const errorMsg = error.message || "My reasoning circuits encountered an anomaly. Let me try again.";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    }

    setIsLoading(false);
  };

  const loadTrivia = async () => {
    setIsLoading(true);

    try {
      let trivia: string;

      if (appState.aiProvider === AIProvider.OPENAI) {
        trivia = await getOpenAITrivia(appState.preferredLanguage);
      } else {
        trivia = await getTrivia(appState.preferredLanguage);
      }

      setMessages(prev => [...prev, { role: 'ai', text: trivia }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Unable to load trivia at the moment." }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[60]">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <Sparkles className="w-7 h-7 relative z-10 animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="glass-morphism w-[340px] h-[520px] rounded-3xl shadow-2xl border dark:border-gray-700 flex flex-col animate-in fade-in slide-in-from-bottom-8 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-white/20 rounded-lg">
                 {isLiveActive ? <Volume2 className="w-4 h-4 animate-bounce" /> : <BrainCircuit className="w-4 h-4" />}
               </div>
               <div>
                 <h4 className="text-sm font-bold leading-tight">Mufambi Pro</h4>
                 <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-blue-100 opacity-80 uppercase tracking-widest font-black">Reasoning Engine</span>
                    {isLiveActive && (
                      <span className="flex items-center gap-1 text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter animate-pulse">
                        Live
                      </span>
                    )}
                 </div>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-hide bg-white/30 dark:bg-gray-900/40 backdrop-blur-md">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border dark:border-gray-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && !isLiveActive && (
              <div className="flex justify-start">
                <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-2xl shadow-sm border dark:border-gray-700 flex items-center gap-2">
                  <BrainCircuit className="w-3 h-3 text-indigo-500 animate-spin" />
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse italic">Thinking...</span>
                </div>
              </div>
            )}
            {isLiveActive && (
              <div className="flex justify-center py-6">
                 <div className="flex items-center gap-1.5 h-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-indigo-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${i * 0.08}s` 
                        }}
                      />
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2 flex gap-2 overflow-x-auto scroll-hide border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
             <button onClick={loadTrivia} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold hover:bg-indigo-100 transition-colors border dark:border-gray-700 shadow-sm">
               <Gamepad2 className="w-3 h-3 text-indigo-500" /> Trivia
             </button>
             <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold hover:bg-indigo-100 transition-colors border dark:border-gray-700 shadow-sm">
               <Info className="w-3 h-3 text-indigo-500" /> Insights
             </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-2xl border dark:border-gray-700 focus-within:ring-2 ring-indigo-500/20 shadow-inner">
                <input 
                  type="text" 
                  placeholder={isLiveActive ? "Listening..." : "Reasoning mode active..."} 
                  className="bg-transparent text-sm w-full outline-none disabled:opacity-50"
                  value={input}
                  disabled={isLiveActive}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                {!isLiveActive && (
                  <button onClick={handleSend} disabled={isLoading} className="text-indigo-600 disabled:opacity-30 p-1 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={isLiveActive ? stopLiveSession : startLiveSession}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                  isLiveActive 
                    ? 'bg-red-500 text-white animate-pulse scale-105' 
                    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 hover:scale-105'
                }`}
              >
                {isLiveActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICompanion;
