import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Quick Reply türü tanımı
interface QuickReply {
  id: string;
  title: string;
  text: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Örnek kategoriler
const CATEGORIES = [
  'Genel',
  'Teşekkür',
  'Bilgilendirme',
  'Çözüm',
  'Sorun Giderme',
  'Teknik'
];

// Örnek hazır yanıtlar
const sampleQuickReplies: QuickReply[] = [
  {
    id: '1',
    title: 'Teşekkür mesajı',
    text: 'Talebiniz için teşekkür ederiz. En kısa sürede inceleyip size dönüş yapacağız.',
    category: 'Teşekkür',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'İşleme alındı',
    text: 'Talebiniz işleme alınmıştır. Konuyla ilgili çalışmalarımız devam etmektedir.',
    category: 'Bilgilendirme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Ek bilgi talebi',
    text: 'Talebinizle ilgili daha detaylı bilgiye ihtiyacımız var. Lütfen aşağıdaki bilgileri paylaşır mısınız?\n\n1. Sorunu ne zaman fark ettiniz?\n2. Sorun hangi durumlarda ortaya çıkıyor?\n3. Daha önce benzer bir sorun yaşadınız mı?',
    category: 'Sorun Giderme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Çözüm bildirisi',
    text: 'Talebiniz çözümlenmiştir. Sorun [ÇÖZÜM AÇIKLAMASI] şeklinde giderilmiştir. Başka bir sorunla karşılaşırsanız lütfen bize bildirin.',
    category: 'Çözüm',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Tahmini süre',
    text: 'Talebiniz değerlendirme aşamasındadır. Tahmini çözüm süresi 24-48 saat içerisindedir. Anlayışınız için teşekkür ederiz.',
    category: 'Bilgilendirme',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const QuickReplySettings: React.FC = () => {
  const theme = useTheme();
  const { userRole } = useAuth();
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(sampleQuickReplies);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    category: 'Genel'
  });
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Düzenleme modunu başlat
  const handleEdit = (reply: QuickReply) => {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      text: reply.text,
      category: reply.category || 'Genel'
    });
    setOpenDialog(true);
  };

  // Silme dialogunu aç
  const handleDeleteClick = (id: string) => {
    setSelectedReplyId(id);
    setDeleteDialog(true);
  };

  // Hazır yanıt silme
  const handleDelete = () => {
    if (selectedReplyId) {
      setQuickReplies(prevReplies => prevReplies.filter(reply => reply.id !== selectedReplyId));
      setSuccessMessage('Hazır yanıt başarıyla silindi');
      setDeleteDialog(false);
      setSelectedReplyId(null);
    }
  };

  // Yeni hazır yanıt ekleme modunu aç
  const handleAddNew = () => {
    setEditingReply(null);
    setFormData({
      title: '',
      text: '',
      category: 'Genel'
    });
    setOpenDialog(true);
  };

  // Form değişikliklerini izle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Formda kaydedileni kaydet
  const handleSave = () => {
    try {
      if (!formData.title.trim() || !formData.text.trim()) {
        setErrorMessage('Başlık ve içerik alanları boş olamaz');
        return;
      }

      const now = new Date().toISOString();

      if (editingReply) {
        // Mevcut yanıtı güncelle
        setQuickReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.id === editingReply.id 
              ? {
                  ...reply,
                  title: formData.title,
                  text: formData.text,
                  category: formData.category,
                  updatedAt: now
                }
              : reply
          )
        );
        setSuccessMessage('Hazır yanıt başarıyla güncellendi');
      } else {
        // Yeni yanıt ekle
        const newReply: QuickReply = {
          id: `qr-${Date.now()}`,
          title: formData.title,
          text: formData.text,
          category: formData.category,
          createdAt: now,
          updatedAt: now
        };

        setQuickReplies(prevReplies => [...prevReplies, newReply]);
        setSuccessMessage('Yeni hazır yanıt başarıyla eklendi');
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Hazır yanıt kaydedilirken hata oluştu:', error);
      setErrorMessage('Hazır yanıt kaydedilirken bir hata oluştu');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Hazır Yanıt Yönetimi
      </Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        Destek taleplerine hızlı yanıt vermek için hazır yanıtları buradan yönetebilirsiniz.
        Bu yanıtlar destek talep sayfasında personel tarafından kolayca kullanılabilir.
      </Typography>

      <Box my={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Yeni Hazır Yanıt Ekle
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hazır Yanıtlar
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Başlık</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>İçerik</TableCell>
                      <TableCell>Son Güncelleme</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quickReplies.map((reply) => (
                      <TableRow key={reply.id}>
                        <TableCell component="th" scope="row">
                          {reply.title}
                        </TableCell>
                        <TableCell>
                          {reply.category || 'Genel'}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: '300px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {reply.text}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(reply.updatedAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEdit(reply)} color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleDeleteClick(reply.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ekleme/Düzenleme Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReply ? 'Hazır Yanıt Düzenle' : 'Yeni Hazır Yanıt Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Başlık"
            type="text"
            fullWidth
            value={formData.title}
            onChange={handleFormChange}
            variant="outlined"
            helperText="Kısa ve açıklayıcı bir başlık"
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            margin="dense"
            name="category"
            label="Kategori"
            fullWidth
            value={formData.category}
            onChange={handleFormChange}
            variant="outlined"
            helperText="Hazır yanıtı kategorilendirin"
            SelectProps={{
              native: true,
            }}
            sx={{ mb: 2 }}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </TextField>
          
          <TextField
            margin="dense"
            name="text"
            label="İçerik"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={formData.text}
            onChange={handleFormChange}
            variant="outlined"
            helperText="Hazır yanıt içeriği (müşteri bu metni görecek)"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleSave} 
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Hazır Yanıtı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu hazır yanıtı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Başarı Mesajı */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Hata Mesajı */}
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={4000} 
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuickReplySettings; 