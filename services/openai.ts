import { AIPersonality, Language } from "../types";

// Get API key from localStorage
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem('OPENAI_API_KEY');
    if (!key) {
      console.warn('OpenAI API key not found. Set it using: localStorage.setItem("OPENAI_API_KEY", "your-key")');
    }
    return key || '';
  }
  return '';
};

// Language mapping for OpenAI
const languageNames: Record<Language, string> = {
  [Language.SHONA]: 'Shona',
  [Language.NDEBELE]: 'Ndebele',
  [Language.ENGLISH_ZW]: 'English',
  [Language.TONGA]: 'Tonga',
  [Language.SHANGANI]: 'Shangani',
  [Language.VENDA]: 'Venda',
  [Language.KALANGA]: 'Kalanga',
  [Language.NAMBYA]: 'Nambya',
  [Language.SOTHO]: 'Sotho',
  [Language.TSWANA]: 'Tswana',
  [Language.CHIBARWE]: 'Chibarwe',
  [Language.SIGN_LANGUAGE_ZW]: 'English (for accessibility)',
  [Language.SWAHILI]: 'Swahili',
  [Language.ZULU]: 'Zulu',
  [Language.XHOSA]: 'Xhosa',
  [Language.AFRIKAANS]: 'Afrikaans',
  [Language.ENGLISH]: 'English',
  [Language.FRENCH]: 'French',
  [Language.PORTUGUESE]: 'Portuguese',
  [Language.SPANISH]: 'Spanish',
  [Language.CHINESE]: 'Chinese',
  [Language.ARABIC]: 'Arabic'
};

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate AI response using OpenAI GPT-4o
 * GPT-4o is OpenAI's most advanced model with:
 * - Superior reasoning capabilities
 * - Multimodal support (text, image, audio)
 * - Better multi-language understanding
 * - Real-time voice conversation support
 */
export const generateOpenAIResponse = async (
  prompt: string,
  personality: AIPersonality,
  context: string = "",
  language: Language = Language.ENGLISH,
  conversationHistory: OpenAIMessage[] = []
) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set it in Settings.');
  }

  const languageName = languageNames[language];
  const systemMessage = `You are Mufambi Pro, an elite AI ride-hailing companion with advanced reasoning capabilities.

PERSONALITY PROFILE:
- Current persona: ${personality}
- Role: Not just a chatbot, but a proactive travel concierge
- Communication: Natural, helpful, and culturally aware

LANGUAGE REQUIREMENT:
- The user's preferred language is ${languageName}
- ALWAYS respond in ${languageName} unless the user explicitly asks for a different language
- Understand and process user input in ANY language, but respond in ${languageName}
- Be culturally appropriate and use local context when relevant

BEHAVIORAL CONSTRAINTS:
- Reason deeply about the user's intent
- If they seem stressed, proactively suggest calming options
- Mirror the user's mood intelligently
- Provide high-quality, verified travel insights
- Be concise but informative

CONTEXT DATA:
${context}

Remember: Your responses should be in ${languageName} to match the user's preference.`;

  try {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Most advanced model with multimodal support
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm having trouble processing that request.";
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(error.message || 'Failed to get response from OpenAI');
  }
};

/**
 * Generate trivia using OpenAI GPT-4o
 */
export const getOpenAITrivia = async (language: Language = Language.ENGLISH) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "OpenAI API key not configured. Please set it in Settings to use this feature.";
  }

  const languageName = languageNames[language];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a world-class historian and urban planner. Provide fascinating facts in ${languageName}.`
          },
          {
            role: 'user',
            content: `Tell me a sophisticated, obscure, and fascinating fact about world transportation or urban history. Respond in ${languageName}.`
          }
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trivia');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "The London Underground was the world's first underground railway, opening in 1863.";
  } catch (error) {
    console.error('OpenAI Trivia Error:', error);
    return "The London Underground was the world's first underground railway, opening in 1863.";
  }
};

/**
 * Get buddy suggestions using OpenAI GPT-4o
 */
export const getOpenAIBuddySuggestions = async (
  userMood: string,
  rideStatus: string,
  language: Language = Language.ENGLISH
) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [
      { name: "Tendai", vibe: "Chill", matchReason: "Fellow quiet traveler", commonInterests: ["Lofi", "Books"] },
      { name: "Lisa", vibe: "Eco-warrior", matchReason: "Passionate about carbon offsetting", commonInterests: ["Nature", "Cycling"] }
    ];
  }

  const languageName = languageNames[language];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Generate travel buddy suggestions based on user mood and ride status. Respond with valid JSON only. Use culturally appropriate names for ${languageName} speakers when relevant.`
          },
          {
            role: 'user',
            content: `Suggest 3 fictional travel buddies for a Mufambi user who is currently feeling "${userMood}" and has a ride status of "${rideStatus}".

MATCHING LOGIC:
- If status is SEARCHING, suggest patient or reassuring buddies
- If status is IN_PROGRESS, suggest conversational or entertainment-focused buddies
- If mood is TIRED, suggest quiet, low-energy companions
- If mood is EXCITED, suggest high-energy, adventurous matches

Respond with a JSON array of objects with: name, vibe, matchReason, commonInterests (array)`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch buddy suggestions');
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || '{"buddies":[]}');
    return parsed.buddies || parsed.suggestions || [];
  } catch (error) {
    console.error('OpenAI Buddy Suggestions Error:', error);
    return [
      { name: "Tendai", vibe: "Chill", matchReason: "Fellow quiet traveler", commonInterests: ["Lofi", "Books"] },
      { name: "Lisa", vibe: "Eco-warrior", matchReason: "Passionate about carbon offsetting", commonInterests: ["Nature", "Cycling"] }
    ];
  }
};

/**
 * Text-to-Speech using OpenAI TTS
 * Converts text to natural-sounding speech
 */
export const textToSpeech = async (text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova') => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'tts-1', // Or 'tts-1-hd' for higher quality
        input: text,
        voice: voice,
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
};

/**
 * Speech-to-Text using OpenAI Whisper
 * Supports 99+ languages with high accuracy
 */
export const speechToText = async (audioBlob: Blob, language?: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    if (language) {
      formData.append('language', language);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Speech-to-text request failed');
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('STT Error:', error);
    throw error;
  }
};
