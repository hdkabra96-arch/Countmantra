import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type MantraVoice = 'Kore' | 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr';

export async function generateMantraAudio(mantra: string, voice: MantraVoice = 'Kore'): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Recite this mantra with deep devotion, warmth, and a natural human rhythm. Speak slowly and soulfully: ${mantra}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Convert base64 to a Blob for better browser compatibility and to avoid URL length limits
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Using audio/mp3 as it's the most widely supported container for TTS
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Error generating mantra audio:", error);
    return null;
  }
}
