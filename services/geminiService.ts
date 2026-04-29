
// OpenRouter API Service (replacing Gemini)
// OpenRouter provides access to multiple AI models through a unified API

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const apiKey =
  (import.meta as any).env?.VITE_OPENROUTER_API_KEY ||
  (process as any).env?.OPENROUTER_API_KEY ||
  '';

const isAbortError = (error: any) => {
  return error.name === 'AbortError' ||
         error.message?.includes('signal is aborted') ||
         error.message?.includes('The user aborted a request');
};

// Helper function to make OpenRouter API calls
const callOpenRouter = async (
  messages: { role: string; content: string | any[] }[],
  model: string = 'google/gemini-2.0-flash-001',
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> => {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AfriTradeOS'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw { message: '429', status: 'RESOURCE_EXHAUSTED' };
    }
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

// 1. Market Intelligence (Search Grounding)
export const getMarketIntelligence = async (query: string) => {
  try {
    const systemPrompt = `You are a market intelligence analyst. Provide accurate, up-to-date market information based on your knowledge. Include relevant statistics, trends, and actionable insights. Focus on African trade markets and the AfCFTA context when relevant.`;

    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ], 'google/gemini-2.0-flash-001');

    return {
      text,
      groundingChunks: [] // OpenRouter doesn't support grounding chunks
    };
  } catch (error: any) {
    if (isAbortError(error)) {
      return { text: "", groundingChunks: [] };
    }
    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
      console.warn("Market Intel Quota Exceeded");
      return {
        text: "Market intelligence is momentarily unavailable due to high demand. Please try again in a minute.",
        groundingChunks: []
      };
    }
    console.error("Market Intel Error:", error);
    throw error;
  }
};

// 2. Logistics & Maps (Maps functionality)
// Note: OpenRouter doesn't have maps grounding, so this provides text-based logistics info
export const getLogisticsInfo = async (query: string, location?: { lat: number; lng: number }) => {
  try {
    const locationContext = location
      ? `The user's current location is approximately at coordinates: ${location.lat}, ${location.lng}.`
      : '';

    const systemPrompt = `You are a logistics and shipping expert specializing in African trade routes. ${locationContext} Provide practical logistics advice, shipping routes, and transportation recommendations.`;

    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ], 'google/gemini-2.5-flash-preview-05-20');

    return {
      text,
      groundingChunks: []
    };
  } catch (error: any) {
    if (isAbortError(error)) return { text: "", groundingChunks: [] };
    console.error("Logistics Error:", error);
    throw error;
  }
};

// 3. Compliance & Legal (Complex Analysis)
// Uses a capable model for complex AfCFTA rules analysis
export const analyzeCompliance = async (scenario: string) => {
  try {
    const systemPrompt = `You are an expert AfCFTA trade lawyer. Analyze trade scenarios strictly according to Rules of Origin and compliance protocols. Provide detailed, thorough analysis with specific regulatory references when applicable.`;

    const text = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze the following trade scenario:\n\n${scenario}` }
    ], 'google/gemini-2.5-pro-preview-03-25', { max_tokens: 8192 });

    return text;
  } catch (error: any) {
    if (isAbortError(error)) return "";

    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
      console.warn("Compliance Analysis Quota Exceeded. Falling back to standard model.");
      try {
        const fallbackText = await callOpenRouter([
          { role: 'system', content: `You are an expert AfCFTA trade lawyer. Provide concise compliance analysis.` },
          { role: 'user', content: `Analyze the following trade scenario (provide a concise analysis):\n\n${scenario}` }
        ], 'google/gemini-2.0-flash-001');

        return fallbackText + "\n\n(Note: Deep analysis mode was unavailable due to high traffic. This is a standard analysis.)";
      } catch (fbError) {
        return "Compliance analysis is currently unavailable due to system capacity. Please try again in a few minutes.";
      }
    }
    console.error("Compliance Analysis Error:", error);
    throw error;
  }
};

// 4. Fast Responses (Chatbot/General)
export const fastChatResponse = async (message: string, context?: string) => {
  try {
    const systemInstruction = context
      ? `You are an AI Trade Co-Pilot embedded in the AfriTradeOS platform. The user is currently viewing: ${context}. Keep answers concise, actionable, and relevant to this context.`
      : `You are an AI Trade Co-Pilot. Keep answers concise.`;

    const text = await callOpenRouter([
      { role: 'system', content: systemInstruction },
      { role: 'user', content: message }
    ], 'google/gemini-2.0-flash-001');

    return text;
  } catch (error: any) {
    if (isAbortError(error)) return "";

    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
      return "AfriTradeOS Strategic Brief: Market stability is currently being monitored. Real-time insights are paused due to high traffic volume.";
    }
    console.error("Fast Chat Error:", error);
    throw error;
  }
};

// 4.1 Explainability (Why is this required?)
export const explainTradeTerm = async (term: string, context: string) => {
  return await fastChatResponse(
    `Explain why "${term}" is required in the context of ${context}.
     Focus on compliance risks, financial implications, or logistics necessity.
     Keep it under 30 words.`,
    "Trade Help Tooltip"
  );
};

// 5. Image Generation (Marketing)
// Note: OpenRouter supports image generation through specific models
export const generateMarketingImage = async (prompt: string, aspectRatio: string) => {
  try {
    // Use a text-to-image model available on OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AfriTradeOS'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: `Generate a professional marketing image for the following description. Aspect ratio should be ${aspectRatio}.\n\nDescription: ${prompt}`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Check if the response contains image data
    if (typeof content === 'object' && content?.image) {
      return `data:image/png;base64,${content.image}`;
    }

    // If no image was generated, return null
    console.warn("Image generation not available with current model");
    return null;
  } catch (error: any) {
    if (isAbortError(error)) return null;
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// 6. Image Analysis (Document Scanning)
export const analyzeDocument = async (base64Data: string, mimeType: string, prompt: string) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AfriTradeOS'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro-preview-03-25',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Document analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    if (isAbortError(error)) return "";
    console.error("Doc Analysis Error:", error);
    throw error;
  }
};

// 7. Text to Speech
// Note: OpenRouter doesn't directly support TTS, using browser's Web Speech API as fallback
export const generateSpeech = async (text: string): Promise<string> => {
  try {
    // OpenRouter doesn't have TTS support, so we'll use a workaround
    // Return empty to trigger fallback to browser TTS in the calling code
    console.warn("TTS not directly supported via OpenRouter. Using browser speech synthesis.");

    // Use browser's speech synthesis instead
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    return ""; // Return empty as we're using browser TTS
  } catch (error: any) {
    if (isAbortError(error)) return "";
    console.error("TTS Error:", error);
    throw error;
  }
};

// 8. Live API (Real-time Voice)
// Note: OpenRouter doesn't support real-time voice streaming like Gemini's Live API
// This is a simplified version that uses regular API calls
export type LiveEvent = {
  type: 'user' | 'model' | 'audio' | 'interrupted' | 'processing';
  text?: string;
  audio?: AudioBuffer;
}

export const connectLiveSession = async (
  onEvent: (event: LiveEvent) => void,
  onClose: () => void,
  persona: string
) => {
  console.warn("Live voice session not fully supported via OpenRouter. Using simplified text-based interaction.");

  let isMuted = false;
  let isConnected = true;
  let recognition: SpeechRecognition | null = null;

  // Use Web Speech API for speech recognition as fallback
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event: any) => {
      if (isMuted || !isConnected) return;

      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        onEvent({ type: 'user', text: transcript });
        onEvent({ type: 'processing' });

        try {
          const response = await callOpenRouter([
            {
              role: 'system',
              content: `You are 'AfriTrade Assistant', a helpful voice guide for the AfriTradeOS platform. You are speaking with a user who is a: ${persona}. Tailor your advice and tone to their specific needs. Keep answers concise and professional. Respond naturally as if in a voice conversation.`
            },
            { role: 'user', content: transcript }
          ], 'google/gemini-2.0-flash-001');

          onEvent({ type: 'model', text: response });

          // Use browser TTS for audio output
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          }
        } catch (error) {
          console.error("Live session response error:", error);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  } else {
    console.error("Speech recognition not supported in this browser");
    onClose();
    return null;
  }

  return {
    disconnect: async () => {
      isConnected = false;
      if (recognition) {
        recognition.stop();
      }
      window.speechSynthesis?.cancel();
      onClose();
    },
    setMute: (mute: boolean) => {
      isMuted = mute;
    },
    outputAudioContext: new AudioContext({ sampleRate: 24000 })
  };
};
