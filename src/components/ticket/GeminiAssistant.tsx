import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Fade,
  Chip,
  useTheme,
  alpha,
  Collapse,
  Alert,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { geminiService } from "../../services/GeminiService";
import { Ticket, TicketComment } from "../../models/Ticket";

interface GeminiAssistantProps {
  ticket: Ticket;
  comments: TicketComment[];
  onInsertText: (text: string) => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  ticket,
  comments,
  onInsertText,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const generateResponse = async (userPrompt?: string) => {
    if (!geminiService.isConfigured()) {
      setError("Gemini API yapılandırılmamış. Lütfen yöneticinize başvurun.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Bilet bilgilerinden otomatik olarak bir istem oluştur
      let prompt;

      if (userPrompt) {
        prompt = userPrompt;
      } else {
        // Son birkaç yorum ve bilet detaylarına dayalı bir istem oluştur
        const latestComments = comments
          .slice(-3)
          .map((c) => c.text)
          .join("\n");

        prompt = `
Destek bileti bilgileri:
Konu: ${ticket.title}
Açıklama: ${ticket.description}
Durum: ${ticket.status}
Öncelik: ${ticket.priority}
Kategori: ${ticket.category}

Son yorumlar:
${latestComments || "Henüz yorum yok"}

Bu destek talebine nazik, profesyonel ve çözüm odaklı bir yanıt yazın. 
Yanıt şunları içermeli:
1. Müşteriyi saygılı bir şekilde selamlama
2. Sorunlarını anladığınızı, ciddiye aldığınızı belirtme 
3. Destek talebine uygun bir çözüm önerme
4. Gerekirse ek bilgi isteme
5. Nazik bir kapanış
`;
      }

      // Gemini AI'dan yanıt al
      const response = await geminiService.generateResponse(prompt);
      setAiResponse(response);
    } catch (err: any) {
      console.error("Gemini yanıt hatası:", err);
      
      // Hata mesajını kullanıcı dostu hale getir
      let userFriendlyError = "Yanıt oluşturulurken bir hata oluştu.";
      
      if (err.message.includes("models") && err.message.includes("not found")) {
        userFriendlyError = "Seçilen model bulunamadı. Lütfen ayarlardan farklı bir model seçin.";
      } else if (err.message.includes("API key")) {
        userFriendlyError = "API anahtarı geçersiz veya eksik. Lütfen API anahtarınızı kontrol edin.";
      } else if (err.message.includes("quota")) {
        userFriendlyError = "API kota sınırlarına ulaşıldı. Lütfen daha sonra tekrar deneyin.";
      }
      
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      // Kopyalandığını bildiren bir görsel ipucu eklenebilir
    }
  };

  const handleInsertResponse = () => {
    if (aiResponse) {
      onInsertText(aiResponse);
    }
  };

  const handleCustomPromptSubmit = () => {
    if (customPrompt.trim()) {
      generateResponse(customPrompt);
    }
  };

  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode);
    if (!isCustomMode) {
      setCustomPrompt("");
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        position: "relative",
      }}
    >
      {!isExpanded ? (
        <Button
          startIcon={<SmartToyIcon />}
          variant="outlined"
          color="secondary"
          size="small"
          onClick={() => setIsExpanded(true)}
          sx={{
            borderRadius: 20,
            px: 2,
            boxShadow: 1,
            background: alpha(theme.palette.secondary.light, 0.1),
          }}
        >
          Gemini AI Asistan
        </Button>
      ) : (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: "relative",
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SmartToyIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Gemini AI Asistan
              </Typography>
              <Chip
                label="Beta"
                size="small"
                color="info"
                sx={{ ml: 1, height: 20, fontSize: "0.6rem" }}
              />
            </Box>
            <Box>
              <Tooltip title="Özel İstem">
                <IconButton size="small" onClick={toggleCustomMode}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Kapat">
                <IconButton size="small" onClick={() => setIsExpanded(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Collapse in={isCustomMode}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Özel bir istem yazın..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={handleCustomPromptSubmit}
                  disabled={isLoading || !customPrompt.trim()}
                >
                  Gönder
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Collapse>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress size={30} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {aiResponse && !isLoading && (
            <Fade in={!!aiResponse}>
              <Box>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    maxHeight: "200px",
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
                    {aiResponse}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => generateResponse()}
                    disabled={isLoading}
                  >
                    Yeniden Üret
                  </Button>
                  <Box>
                    <Tooltip title="Kopyala">
                      <IconButton size="small" onClick={handleCopyResponse}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleInsertResponse}
                      sx={{ ml: 1 }}
                    >
                      Yanıta Ekle
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}

          {!aiResponse && !isLoading && !error && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Bilet bilgilerine göre AI yanıtı üretmek için tıklayın
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => generateResponse()}
                startIcon={<SmartToyIcon />}
                sx={{ mt: 1 }}
              >
                Yanıt Öner
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default GeminiAssistant;
