import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Grid,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import ticketService from '../../services/TicketService';
import { CreateTicketRequest, TicketCategory, TicketPriority } from '../../models/Ticket';

interface CreateTicketFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  userId,
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.GENERAL);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bilet oluştur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const request: CreateTicketRequest = {
        title,
        description,
        category,
        priority,
        tags: tags.length > 0 ? tags : undefined
      };
      
      await ticketService.createTicket(userId, request);
      
      setSuccess(true);
      // Form alanlarını temizle
      setTitle('');
      setDescription('');
      setCategory(TicketCategory.GENERAL);
      setPriority(TicketPriority.MEDIUM);
      setTags([]);
      
      // Başarılı callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Bilet oluşturulurken hata oluştu:', error);
      setError('Bilet oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Etiket ekle
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Zaten eklenmiş mi kontrol et
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    
    setTagInput('');
  };
  
  // Etiket sil
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  // Enter tuşuna basınca etiket ekle
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Yeni Destek Talebi Oluştur
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Destek talebiniz başarıyla oluşturuldu.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Konu"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Sorununuzu kısaca özetleyen bir başlık girin"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                label="Kategori"
                disabled={loading}
              >
                <MenuItem value={TicketCategory.TECHNICAL}>Teknik</MenuItem>
                <MenuItem value={TicketCategory.ACCOUNT}>Hesap</MenuItem>
                <MenuItem value={TicketCategory.BILLING}>Fatura</MenuItem>
                <MenuItem value={TicketCategory.GENERAL}>Genel</MenuItem>
                <MenuItem value={TicketCategory.FEATURE_REQUEST}>Özellik Talebi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                label="Öncelik"
                disabled={loading}
              >
                <MenuItem value={TicketPriority.LOW}>Düşük</MenuItem>
                <MenuItem value={TicketPriority.MEDIUM}>Orta</MenuItem>
                <MenuItem value={TicketPriority.HIGH}>Yüksek</MenuItem>
                <MenuItem value={TicketPriority.URGENT}>Acil</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Açıklama"
              fullWidth
              required
              multiline
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Lütfen sorununuzu detaylı olarak açıklayın"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Etiket Ekle"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              disabled={loading}
              placeholder="Etiket girin ve Enter'a basın"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || loading}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {tags.length > 0 && (
            <Grid item xs={12}>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                    disabled={loading}
                  />
                ))}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Box textAlign="right">
              <Button
                variant="outlined"
                color="error"
                onClick={onCancel}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                İptal
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !title.trim() || !description.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Gönderiliyor...' : 'Destek Talebi Oluştur'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateTicketForm; 