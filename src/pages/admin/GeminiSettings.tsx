import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";
import ReplayIcon from "@mui/icons-material/Replay";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";
import { GeminiConfig, geminiService } from "../../services/GeminiService";

// Kullanılabilir Gemini modelleri
const AVAILABLE_MODELS = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Hızlı ve verimli yanıtlar için optimize edilmiş model"
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Karmaşık görevler için daha kapsamlı model"
  },
  {
    id: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro (Eski)",
    description: "Önceki sürüm, daha az özellikli"
  }
];

const GeminiSettings: React.FC = () => {
  const theme = useTheme();
  const { userRole } = useAuth();
  const [config, setConfig] = useState<GeminiConfig>({
    apiKey: "",
    model: "gemini-1.5-flash",
    maxTokens: 1024,
    temperature: 0.7,
  });
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Mevcut yapılandırmayı yükle
  useEffect(() => {
    const savedConfig = geminiService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleSaveConfig = () => {
    setLoading(true);
    setError(null);
    try {
      geminiService.saveConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Ayarları kaydederken hata:", err);
      setError("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestGemini = async () => {
    if (!testPrompt.trim()) {
      setTestError("Lütfen test etmek için bir metin girin.");
      return;
    }

    setTestLoading(true);
    setTestError(null);
    try {
      const response = await geminiService.generateResponse(testPrompt);
      setTestResponse(response);
    } catch (err: any) {
      console.error("Gemini test hatası:", err);
      setTestError(err.message || "Gemini API test edilirken bir hata oluştu.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (e: SelectChangeEvent) => {
    setConfig((prev) => ({ ...prev, model: e.target.value as string }));
  };

  const handleSliderChange =
    (name: string) => (event: any, newValue: number | number[]) => {
      setConfig((prev) => ({ ...prev, [name]: newValue }));
    };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4 }}>
        Google Gemini AI Ayarları
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Yapılandırması
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Gemini API Anahtarı"
                name="apiKey"
                value={config.apiKey}
                onChange={handleChange}
                margin="normal"
                type="password"
                required
                helperText="Google AI Studio'dan alınan API anahtarınızı girin"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="model-select-label">Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  id="model-select"
                  value={config.model}
                  label="Model"
                  onChange={handleModelChange}
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "text.secondary" }}
                      >
                        ({model.description})
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography gutterBottom sx={{ mt: 3 }}>
                Maksimum Token Sayısı: {config.maxTokens}
                <Tooltip title="Yanıtın maksimum uzunluğunu kontrol eder. Daha yüksek değerler daha uzun yanıtlar üretir.">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                value={config.maxTokens}
                onChange={handleSliderChange("maxTokens")}
                min={128}
                max={4096}
                step={128}
                marks={[
                  { value: 128, label: "128" },
                  { value: 1024, label: "1024" },
                  { value: 2048, label: "2048" },
                  { value: 4096, label: "4096" },
                ]}
              />

              <Typography gutterBottom sx={{ mt: 3 }}>
                Yaratıcılık (Sıcaklık): {config.temperature}
                <Tooltip title="Düşük değerler daha tutarlı, yüksek değerler daha yaratıcı yanıtlar üretir.">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                value={config.temperature}
                onChange={handleSliderChange("temperature")}
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 0.5, label: "0.5" },
                  { value: 1, label: "1" },
                ]}
              />

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveConfig}
                  disabled={loading}
                  startIcon={<SaveIcon />}
                >
                  {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
              </Box>

              {saved && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Ayarlar başarıyla kaydedildi!
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Testi
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Gemini AI yapılandırmanızı test etmek için aşağıdaki alanı
              kullanın. Sistemin gerçek bir müşteri görüşmesine nasıl yanıt
              vereceğini görebilirsiniz.
            </Typography>

            <TextField
              fullWidth
              label="Test Metni"
              multiline
              rows={4}
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Örnek: Ürünü iade etmek istiyorum. Nasıl yapabilirim?"
              margin="normal"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestGemini}
                disabled={testLoading || !geminiService.isConfigured()}
                startIcon={<ReplayIcon />}
              >
                {testLoading ? "Test Ediliyor..." : "Test Et"}
              </Button>
            </Box>

            {testError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {testError}
              </Alert>
            )}

            {testResponse && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Gemini Yanıtı:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {testResponse}
                </Typography>
              </Box>
            )}

            {!geminiService.isConfigured() && (
              <Alert severity="warning">
                Test yapmak için önce Gemini API anahtarınızı kaydetmeniz
                gerekiyor.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Kullanım Kılavuzu
        </Typography>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1" paragraph>
            <strong>Gemini AI'yı MHYS'ye entegre etme:</strong>
          </Typography>
          <Typography component="div" variant="body2">
            <ol>
              <li>
                <strong>API Anahtarı Alın:</strong> Bir Google AI Studio hesabı
                edinin ve bir API anahtarı oluşturun.
              </li>
              <li>
                <strong>Yapılandırın:</strong> API anahtarınızı ve model
                ayarlarınızı yukarıdaki forma girin.
              </li>
              <li>
                <strong>Test Edin:</strong> Yapılandırmayı kaydetmeden önce
                API'yi test etmek için test bölümünü kullanın.
              </li>
              <li>
                <strong>Kaydedin:</strong> Ayarları kaydedin. Artık müşteri
                temsilcileri destek biletlerinde Gemini AI önerilerini
                görebilecekler.
              </li>
            </ol>
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="textSecondary">
            <strong>Not:</strong> Gemini API anahtarları değerlidir ve gizli
            tutulmalıdır. Yalnızca yetkili personelin bu sayfaya erişim izni
            olmalıdır.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default GeminiSettings;
