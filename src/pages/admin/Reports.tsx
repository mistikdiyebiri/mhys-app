import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  SelectChangeEvent 
} from '@mui/material';
import { DateRange } from '@mui/icons-material';
import { 
  DownloadOutlined as DownloadIcon, 
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { Report } from '../../models/schema';

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);

const Reports: React.FC = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>('ticket-summary');
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // Son 30 gün
    end: new Date()
  });
  const [department, setDepartment] = useState<string>('all');
  const [generatePDF, setGeneratePDF] = useState<boolean>(false);
  const [generateExcel, setGenerateExcel] = useState<boolean>(true);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Demo veriler
  const departments = [
    { id: 'all', name: 'Tüm Departmanlar' },
    { id: '1', name: 'Teknik Destek' },
    { id: '2', name: 'Satış' },
    { id: '3', name: 'Finans' }
  ];

  const sampleReports: Report[] = [
    {
      id: '1',
      name: 'Aylık Destek Talebi Özeti',
      type: 'ticket-summary',
      parameters: {
        dateRange: { start: '2023-02-01', end: '2023-02-28' },
        department: 'all'
      },
      createdById: 'admin-1',
      createdAt: new Date(2023, 1, 28).toISOString(),
      updatedAt: new Date(2023, 1, 28).toISOString()
    },
    {
      id: '2',
      name: 'Çözülme Süresi Raporu',
      type: 'resolution-time',
      parameters: {
        dateRange: { start: '2023-01-01', end: '2023-01-31' },
        department: '1'
      },
      createdById: 'admin-1',
      createdAt: new Date(2023, 0, 31).toISOString(),
      updatedAt: new Date(2023, 0, 31).toISOString()
    },
    {
      id: '3',
      name: 'Departman Performans Analizi',
      type: 'department-performance',
      parameters: {
        dateRange: { start: '2023-03-01', end: '2023-03-31' },
        department: 'all'
      },
      createdById: 'admin-1',
      createdAt: new Date(2023, 2, 31).toISOString(),
      updatedAt: new Date(2023, 2, 31).toISOString()
    }
  ];

  // Örnek grafik verileri - Bilet Özetleri
  const ticketSummaryData = {
    labels: ['Şubat 1', 'Şubat 5', 'Şubat 10', 'Şubat 15', 'Şubat 20', 'Şubat 25', 'Şubat 28'],
    datasets: [
      {
        label: 'Açılan Talepler',
        data: [12, 19, 15, 22, 18, 25, 30],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Kapatılan Talepler',
        data: [8, 15, 17, 19, 20, 22, 27],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Örnek grafik verileri - Çözülme Süresi
  const resolutionTimeData = {
    labels: ['Düşük', 'Orta', 'Yüksek', 'Kritik'],
    datasets: [
      {
        label: 'Ortalama Çözülme Süresi (saat)',
        data: [24, 12, 8, 4],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Örnek grafik verileri - Departman Performansı
  const departmentPerformanceData = {
    labels: ['Teknik Destek', 'Satış', 'Finans'],
    datasets: [
      {
        label: 'Ortalama Yanıt Süresi (saat)',
        data: [2, 4, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Müşteri Memnuniyeti (1-5)',
        data: [4.5, 4.2, 4.0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
      }
    ]
  };

  useEffect(() => {
    // Kaydedilmiş raporları yükleme
    loadSavedReports();
  }, []);

  const loadSavedReports = () => {
    setLoading(true);
    // Gerçek bir uygulamada, burada API çağrısı yapılır:
    // const reportsData = await API.graphql(graphqlOperation(listReports));
    // setSavedReports(reportsData.data.listReports.items);

    // Örnek veriler kullanıyoruz
    setTimeout(() => {
      setSavedReports(sampleReports);
      setLoading(false);
    }, 1000);
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };

  const generateReport = () => {
    setLoading(true);
    
    // Gerçek bir uygulamada, burada API çağrısı yapılır:
    // const reportParameters = {
    //   type: reportType,
    //   dateRange: {
    //     start: dateRange.start?.toISOString(),
    //     end: dateRange.end?.toISOString()
    //   },
    //   department,
    //   generatePDF,
    //   generateExcel
    // };
    // API.graphql(graphqlOperation(generateReport, { input: reportParameters }));

    // Örnek simülasyon
    setTimeout(() => {
      setLoading(false);
      // Rapor oluşturulduğunu göstermek için rapor listesini güncelle
      const newReport: Report = {
        id: `${savedReports.length + 1}`,
        name: `${getReportTypeName(reportType)} - ${new Date().toLocaleDateString('tr-TR')}`,
        type: reportType,
        parameters: {
          dateRange: {
            start: dateRange.start?.toISOString(),
            end: dateRange.end?.toISOString()
          },
          department
        },
        createdById: 'current-user', // Gerçek uygulamada oturum açmış kullanıcının ID'si
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setSavedReports([newReport, ...savedReports]);
    }, 2000);
  };

  const getReportTypeName = (type: string) => {
    switch(type) {
      case 'ticket-summary': return 'Destek Talebi Özeti';
      case 'resolution-time': return 'Çözülme Süresi Raporu';
      case 'department-performance': return 'Departman Performans Analizi';
      case 'customer-satisfaction': return 'Müşteri Memnuniyeti Raporu';
      case 'agent-performance': return 'Personel Performans Raporu';
      default: return 'Rapor';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Seçilen rapor türüne göre uygun grafiği render etme
  const renderChart = () => {
    switch(reportType) {
      case 'ticket-summary':
        return (
          <Bar 
            data={ticketSummaryData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Destek Talepleri Özeti'
                }
              }
            }} 
          />
        );
      case 'resolution-time':
        return (
          <Pie 
            data={resolutionTimeData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
                title: {
                  display: true,
                  text: 'Önceliğe Göre Çözülme Süreleri'
                }
              }
            }} 
          />
        );
      case 'department-performance':
        return (
          <Bar 
            data={departmentPerformanceData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Departman Performans Karşılaştırması'
                }
              }
            }} 
          />
        );
      default:
        return (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Rapor türü seçiniz
            </Typography>
          </Box>
        );
    }
  };

  // DatePicker yerine manuel tarih girişi için TextField kullanarak sorunu çözeceğim
  // Tarih formatını Türkçe yapmak için yardımcı fonksiyon
  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tarih input değişimini işle
  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: 'start' | 'end') => {
    const inputValue = e.target.value;
    
    // Eğer boş ise, null değeri ayarla
    if (!inputValue) {
      handleDateRangeChange(field, null);
      return;
    }
    
    // TT/AA/YYYY formatını kontrol et
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const matches = inputValue.match(datePattern);
    
    if (matches) {
      const [_, day, month, year] = matches;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      
      // Geçerli tarih kontrolü
      if (!isNaN(date.getTime())) {
        handleDateRangeChange(field, date);
      }
    }
  };

  // DatePicker tipi için düzeltme
  const handleDateRangeChange = (field: 'start' | 'end', newValue: Date | null) => {
    setDateRange({
      ...dateRange,
      [field]: newValue
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Box>
          <Tooltip title="Raporları Yenile">
            <IconButton onClick={loadSavedReports} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Rapor Oluşturma Paneli */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yeni Rapor Oluştur
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Rapor Türü</InputLabel>
                  <Select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    label="Rapor Türü"
                  >
                    <MenuItem value="ticket-summary">Destek Talebi Özeti</MenuItem>
                    <MenuItem value="resolution-time">Çözülme Süresi Raporu</MenuItem>
                    <MenuItem value="department-performance">Departman Performans Analizi</MenuItem>
                    <MenuItem value="customer-satisfaction">Müşteri Memnuniyeti Raporu</MenuItem>
                    <MenuItem value="agent-performance">Personel Performans Raporu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    value={department}
                    onChange={handleDepartmentChange}
                    label="Departman"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Başlangıç Tarihi"
                    placeholder="GG/AA/YYYY"
                    fullWidth
                    value={dateRange.start ? formatDisplayDate(dateRange.start) : ''}
                    onChange={(e) => handleDateInputChange(e, 'start')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Örnek: 15/03/2023
                  </Typography>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Bitiş Tarihi"
                    placeholder="GG/AA/YYYY"
                    fullWidth
                    value={dateRange.end ? formatDisplayDate(dateRange.end) : ''}
                    onChange={(e) => handleDateInputChange(e, 'end')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Örnek: 15/03/2023
                  </Typography>
                </FormControl>
              </Grid>
            </Grid>

            <Paper 
              variant="outlined"
              sx={{ 
                mt: 3, 
                p: 2, 
                height: 300, 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {renderChart()}
            </Paper>
            
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={generatePDF}
                      onChange={(e) => setGeneratePDF(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="PDF olarak kaydet"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={generateExcel}
                      onChange={(e) => setGenerateExcel(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Excel olarak kaydet"
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BarChartIcon />}
                  onClick={generateReport}
                  disabled={loading || !reportType || !dateRange.start || !dateRange.end}
                  sx={{ ml: 'auto' }}
                >
                  {loading ? 'Rapor Oluşturuluyor...' : 'Rapor Oluştur'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Kaydedilmiş Raporlar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kaydedilmiş Raporlar
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : savedReports.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Henüz kaydedilmiş rapor bulunmamaktadır.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rapor Adı</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell align="right">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {savedReports
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((report) => (
                          <TableRow key={report.id} hover>
                            <TableCell>{report.name}</TableCell>
                            <TableCell>{formatDate(report.createdAt)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="İndir">
                                <IconButton size="small">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Yazdır">
                                <IconButton size="small">
                                  <PrintIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={savedReports.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Sayfa başına rapor:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;