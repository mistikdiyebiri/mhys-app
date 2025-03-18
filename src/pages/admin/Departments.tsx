import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Department } from '../../models/schema';
// import { API, graphqlOperation } from 'aws-amplify';
// import { listDepartments, getDepartment } from '../../graphql/queries';
// import { createDepartment, updateDepartment, deleteDepartment } from '../../graphql/mutations';

const Departments: React.FC = () => {
  const { userRole } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form durumu
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Örnek veri
  const sampleDepartments: Department[] = [
    {
      id: '1',
      name: 'Teknik Destek',
      description: 'Teknik sorunlar ve destek talepleri',
      createdAt: new Date(2023, 0, 15).toISOString(),
      updatedAt: new Date(2023, 5, 20).toISOString()
    },
    {
      id: '2',
      name: 'Satış',
      description: 'Satış ve pazarlama ile ilgili talepler',
      createdAt: new Date(2023, 1, 10).toISOString(),
      updatedAt: new Date(2023, 1, 10).toISOString()
    },
    {
      id: '3',
      name: 'Finans',
      description: 'Fatura, ödeme ve finans ile ilgili talepler',
      createdAt: new Date(2023, 2, 5).toISOString(),
      updatedAt: new Date(2023, 4, 12).toISOString()
    }
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      // Gerçek bir uygulamada, Amplify API kullanarak verileri çekeriz:
      // const departmentsData = await API.graphql(graphqlOperation(listDepartments));
      // setDepartments(departmentsData.data.listDepartments.items);
      
      // Örnek veri kullanarak simüle ediyoruz
      setTimeout(() => {
        setDepartments(sampleDepartments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Departmanlar alınırken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Departmanlar yüklenirken bir hata oluştu',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddDepartment = () => {
    setName('');
    setDescription('');
    setOpenAddDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setName(department.name);
    setDescription(department.description || '');
    setOpenEditDialog(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setCurrentDepartment(department);
    setOpenDeleteDialog(true);
  };

  const submitAddDepartment = async () => {
    if (!name) {
      setSnackbar({
        open: true,
        message: 'Departman adı zorunludur',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Gerçek bir uygulamada API çağrısı yapılır:
      // const newDepartment = {
      //   name,
      //   description: description || null
      // };
      // await API.graphql(graphqlOperation(createDepartment, { input: newDepartment }));
      
      // Örnek veri ile simüle ediyoruz
      const newDepartment: Department = {
        id: `${departments.length + 1}`,
        name,
        description: description || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setDepartments([...departments, newDepartment]);
      setOpenAddDialog(false);
      setSnackbar({
        open: true,
        message: 'Departman başarıyla eklendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Departman eklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Departman eklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitEditDepartment = async () => {
    if (!currentDepartment || !name) {
      setSnackbar({
        open: true,
        message: 'Departman adı zorunludur',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Gerçek bir uygulamada API çağrısı yapılır:
      // const updatedDepartment = {
      //   id: currentDepartment.id,
      //   name,
      //   description: description || null
      // };
      // await API.graphql(graphqlOperation(updateDepartment, { input: updatedDepartment }));
      
      // Örnek veri ile simüle ediyoruz
      const updatedDepartments = departments.map(dept => 
        dept.id === currentDepartment.id 
          ? { 
              ...dept, 
              name, 
              description: description || undefined, 
              updatedAt: new Date().toISOString() 
            } 
          : dept
      );
      
      setDepartments(updatedDepartments);
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: 'Departman başarıyla güncellendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Departman güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Departman güncellenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDeleteDepartment = async () => {
    if (!currentDepartment) return;

    setLoading(true);
    try {
      // Gerçek bir uygulamada API çağrısı yapılır:
      // await API.graphql(graphqlOperation(deleteDepartment, { input: { id: currentDepartment.id } }));
      
      // Örnek veri ile simüle ediyoruz
      const updatedDepartments = departments.filter(dept => dept.id !== currentDepartment.id);
      setDepartments(updatedDepartments);
      
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Departman başarıyla silindi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Departman silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Departman silinirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(
    (department) => 
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Departmanlar
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddDepartment}
            sx={{ ml: 2 }}
            disabled={loading || userRole !== 'admin'}
          >
            Yeni Departman
          </Button>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchDepartments} disabled={loading} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            variant="outlined"
            size="small"
            label="Departman Ara"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%">#</TableCell>
                <TableCell width="20%">Departman Adı</TableCell>
                <TableCell width="40%">Açıklama</TableCell>
                <TableCell width="15%">Oluşturulma Tarihi</TableCell>
                <TableCell width="10%">Durum</TableCell>
                <TableCell width="10%" align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Departmanlar yükleniyor...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <GroupIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1">Departman bulunamadı</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Arama kriterlerinize uygun departman yok.' : 'Henüz departman eklenmemiş.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((department, index) => (
                    <TableRow key={department.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>{department.description || '-'}</TableCell>
                      <TableCell>{formatDate(department.createdAt)}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Aktif" 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <IconButton 
                            onClick={() => handleEditDepartment(department)}
                            disabled={userRole !== 'admin'}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            onClick={() => handleDeleteDepartment(department)}
                            disabled={userRole !== 'admin'}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDepartments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına departman:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* Yeni Departman Ekle Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Departman Ekle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yeni bir departman eklemek için gerekli bilgileri doldurun.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Departman Adı"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} disabled={loading}>
            İptal
          </Button>
          <Button 
            onClick={submitAddDepartment} 
            variant="contained" 
            disableElevation 
            disabled={loading || !name}
          >
            {loading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Departman Düzenle Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Departman Düzenle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Departman bilgilerini güncelleyin.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Departman Adı"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={loading}>
            İptal
          </Button>
          <Button 
            onClick={submitEditDepartment} 
            variant="contained" 
            disableElevation 
            disabled={loading || !name}
          >
            {loading ? <CircularProgress size={24} /> : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Departman Sil Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Departman Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{currentDepartment?.name}</strong> departmanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
            İptal
          </Button>
          <Button 
            onClick={submitDeleteDepartment} 
            variant="contained" 
            color="error" 
            disableElevation 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Departments; 