
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { createBlob, decode, decodeAudioData } from "./audioUtils";

// Initialize the client. 
// NOTE: In a real environment, verify API_KEY exists.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const isAbortError = (error: any) => {
  return error.name === 'AbortError' || 
         error.message?.includes('signal is aborted') ||
         error.message?.includes('The user aborted a request');
};

// 1. Market Intelligence (Search Grounding)
export const getMarketIntelligence = async (query: string) => {
  try {
    // Switch to gemini-2.0-flash-exp for better quota handling
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error: any) {
    if (isAbortError(error)) {
        return { text: "", groundingChunks: [] };
    }
    // Graceful degradation for quota limits
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

// 2. Logistics & Maps (Maps Grounding)
// Maps is only supported on Gemini 2.5 models
export const getLogisticsInfo = async (query: string, location?: { lat: number; lng: number }) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined
      },
    });
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error: any) {
    if (isAbortError(error)) return { text: "", groundingChunks: [] };
    console.error("Logistics Error:", error);
    throw error;
  }
};

// 3. Compliance & Legal (Thinking Mode)
// Uses gemini-3-pro-preview with high thinking budget for complex AfCFTA rules
export const analyzeCompliance = async (scenario: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert AfCFTA trade lawyer. Analyze the following trade scenario strictly according to Rules of Origin and compliance protocols.
      
      Scenario: ${scenario}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return response.text;
  } catch (error: any) {
    if (isAbortError(error)) return "";
    
    // Handle Quota limits for Thinking Model (429)
    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
         console.warn("Compliance Thinking Quota Exceeded. Falling back to standard model.");
         try {
             const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp', // Fallback to faster, cheaper model
                contents: `You are an expert AfCFTA trade lawyer. Analyze the following trade scenario strictly according to Rules of Origin and compliance protocols.
                
                Scenario: ${scenario}
                
                Note: Provide a concise analysis since deep thinking mode is currently unavailable.`,
             });
             return fallbackResponse.text + "\n\n(Note: Deep thinking mode was unavailable due to high traffic. This is a standard analysis.)";
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

    // Switch to gemini-2.0-flash-exp to resolve 429 quota errors
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: message,
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.text;
  } catch (error: any) {
    if (isAbortError(error)) return "";

    // Handle quota exhaustion gracefully
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
export const generateMarketingImage = async (prompt: string, aspectRatio: string) => {
  try {
    // Using gemini-3-pro-image-preview for high quality marketing assets
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // 1:1, 16:9, etc.
          imageSize: "1K"
        }
      },
    });
    
    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error: any) {
    if (isAbortError(error)) return "";
    console.error("Doc Analysis Error:", error);
    throw error;
  }
};

// 7. Text to Speech
export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    
    return base64Audio;
  } catch (error: any) {
    if (isAbortError(error)) return "";
    console.error("TTS Error:", error);
    throw error;
  }
};

// 8. Live API (Real-time Voice)
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
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  let stream: MediaStream;
  let isMuted = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error("Mic Access Error:", err);
    onClose();
    return null;
  }

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: `You are 'AfriTrade Assistant', a helpful voice guide for the AfriTradeOS platform. You are speaking with a user who is a: ${persona}. Tailor your advice and tone to their specific needs. Keep answers concise and professional.`,
      outputAudioTranscription: {}, 
      inputAudioTranscription: {}, 
    },
    callbacks: {
      onopen: () => {
        console.log("Live Session Opened");
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (e) => {
          if (isMuted) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(e => {
             // Suppress aborts during connection/teardown
             if(!isAbortError(e)) console.warn("Live Input Error:", e);
          });
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (msg: LiveServerMessage) => {
        if (msg.serverContent?.interrupted) {
          onEvent({ type: 'interrupted' });
        }

        if (msg.serverContent?.turnComplete) {
            onEvent({ type: 'processing' });
        }

        if (msg.serverContent?.inputTranscription?.text) {
          onEvent({ type: 'user', text: msg.serverContent.inputTranscription.text });
        }

        if (msg.serverContent?.outputTranscription?.text) {
          onEvent({ type: 'model', text: msg.serverContent.outputTranscription.text });
        }

        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
           const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000,
            1
          );
          onEvent({ type: 'audio', audio: audioBuffer });
        }
      },
      onclose: () => {
        console.log("Live Session Closed");
        onClose();
        try {
          stream?.getTracks().forEach(track => track.stop());
          if(inputAudioContext.state !== 'closed') inputAudioContext.close();
          if(outputAudioContext.state !== 'closed') outputAudioContext.close();
        } catch(e) { console.error("Cleanup error", e); }
      },
      onerror: (err) => {
        if (!isAbortError(err)) {
            console.error("Live Session Error:", err);
        }
      }
    }
  });

  return {
    disconnect: async () => {
      try {
          const session = await sessionPromise;
          session.close();
      } catch (e) {
          if (!isAbortError(e)) console.warn("Disconnect Error:", e);
      }
    },
    setMute: (mute: boolean) => {
      isMuted = mute;
    },
    outputAudioContext 
  };
};
