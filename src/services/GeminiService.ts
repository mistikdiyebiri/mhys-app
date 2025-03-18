// Amplify tanımlaması
interface AuthUser {
  signInUserSession: {
    idToken: {
      jwtToken: string;
    };
  };
}

// Mock Auth servisi (AWS Amplify ile değiştirilecek)
const Auth = {
  currentAuthenticatedUser: async (): Promise<AuthUser> => {
    // Bu bir mock implementasyondur, gerçek AWS Amplify entegrasyonu ile değiştirilmelidir
    console.warn(
      "Mock Auth kullanılıyor. Gerçek uygulamada AWS Amplify ile değiştirin.",
    );
    return {
      signInUserSession: {
        idToken: {
          jwtToken: "mock-jwt-token",
        },
      },
    };
  },
};

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class GeminiService {
  private config: GeminiConfig | null = null;

  constructor() {
    // Config bilgilerini local storage'dan yüklemeyi dene
    this.loadConfig();
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem("gemini_config");
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
        // Model ismini güncelle (eski modellerden birini kullanıyorsa)
        if (this.config?.model === "gemini-pro") {
          this.config.model = "gemini-1.5-flash";
          localStorage.setItem("gemini_config", JSON.stringify(this.config));
        }
      } catch (error) {
        console.error("Gemini konfigürasyonu yüklenirken hata:", error);
        this.config = null;
      }
    }
  }

  public saveConfig(config: GeminiConfig): void {
    this.config = config;
    localStorage.setItem("gemini_config", JSON.stringify(config));
  }

  public getConfig(): GeminiConfig | null {
    return this.config;
  }

  public async generateResponse(
    prompt: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    if (!this.config?.apiKey) {
      throw new Error("Gemini API anahtarı tanımlanmamış");
    }

    try {
      // Kullanıcı kimlik bilgilerini al
      const user = await Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;

      // Şirket bilgisini almak için api isteği yapabilirsiniz (burada örnek olarak eklenmedi)
      // const companyInfo = await API.get('mhysApi', '/company-info', { headers: { Authorization: token } });

      // Prompt'a şirket özel bilgileri ekle (gerçek uygulamada bu daha gelişmiş olacaktır)
      const enhancedPrompt = `Aşağıdaki metni MHYS müşteri temsilcisi olarak yanıtla:\n\n${prompt}`;

      // API URL güncellendi
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              ...conversationHistory.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
              })),
              {
                role: "user",
                parts: [{ text: enhancedPrompt }],
              },
            ],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
              topP: 0.9,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API Hatası: ${errorData.error?.message || "Bilinmeyen hata"}`,
        );
      }

      const data = await response.json();

      // Gemini API'dan gelen yanıtı dön
      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Gemini API'den geçerli bir yanıt alınamadı");
      }
    } catch (error) {
      console.error("Gemini yanıt üretme hatası:", error);
      throw error;
    }
  }

  public isConfigured(): boolean {
    return !!this.config?.apiKey;
  }
}

export const geminiService = new GeminiService();
