import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  Equalizer as EqualizerIcon,
  EventNote as EventNoteIcon,
  PendingActions as PendingActionsIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
  RadialLinearScale
} from 'chart.js';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import PersonalStats from '../../components/dashboard/PersonalStats';

// Chart.js bileşenlerini kaydet
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
  RadialLinearScale
);

// Tab paneli içeriği için ara bileşen
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { getUserAttributes } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    assignedTickets: 12,
    resolvedToday: 3,
    pendingTickets: 5,
    averageResponseTime: '18 dakika',
    completionRate: 78,
    overdueTickets: 2
  });

  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const fetchUserInfo = async () => {
      try {
        const userAttributes = await getUserAttributes();
        setUserInfo(userAttributes);
        setLoading(false);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [getUserAttributes]);

  // Verileri yenile
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      // Gerçek uygulamada API çağrısı yapılacak
      setLoading(false);
    }, 1000);
  };

  // Haftalık çözülen talepler grafiği
  const weeklyResolutionData = {
    labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    datasets: [
      {
        label: 'Çözülen Talepler',
        data: [4, 6, 3, 5, 7, 2, 1],
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.dark,
        borderWidth: 1,
      }
    ]
  };

  // Çalışma saati dağılımı grafiği
  const workloadData = {
    labels: ['Teknik Destek', 'Genel Sorular', 'Hesap Yönetimi', 'Yazılım Sorunları', 'Donanım Sorunları'],
    datasets: [
      {
        label: 'Harcanan Süre (Saat)',
        data: [8, 5, 3, 7, 2],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
          theme.palette.error.dark,
          theme.palette.warning.dark,
          theme.palette.info.dark,
        ]
      }
    ]
  };

  // Performans metrikleri (radar chart için)
  const performanceData = {
    labels: ['Yanıt Hızı', 'Çözüm Oranı', 'Müşteri Memnuniyeti', 'Bilgi Tabanı Katkısı', 'Takım Çalışması'],
    datasets: [
      {
        label: 'Bu Ay',
        data: [85, 78, 90, 65, 80],
        backgroundColor: `${theme.palette.primary.main}40`,
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
      {
        label: 'Geçen Ay',
        data: [75, 70, 85, 60, 75],
        backgroundColor: `${theme.palette.secondary.main}40`,
        borderColor: theme.palette.secondary.main,
        borderWidth: 2,
      }
    ]
  };

  // Yaklaşan görevler
  const upcomingTasks = [
    { id: 1, title: 'Sunucu bakımı', priority: 'Yüksek', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { id: 2, title: 'Kullanıcı eğitimi', priority: 'Orta', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { id: 3, title: 'Yazılım güncellemesi', priority: 'Düşük', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { id: 4, title: 'Haftalık rapor hazırlama', priority: 'Orta', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { id: 5, title: 'Veri yedekleme', priority: 'Yüksek', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  ];

  // Günlük zaman çizelgesi
  const todayActivity = [
    { id: 1, action: 'Giriş yapıldı', time: '08:30', icon: <PersonIcon /> },
    { id: 2, action: '3 yeni destek talebi atandı', time: '09:15', icon: <AssignmentIcon /> },
    { id: 3, action: 'Teknik toplantı', time: '10:00', icon: <EventNoteIcon /> },
    { id: 4, action: '2 destek talebi çözüldü', time: '11:30', icon: <CheckIcon /> },
    { id: 5, action: 'Öğle arası', time: '12:30', icon: <AccessTimeIcon /> },
    { id: 6, action: 'Yazılım güncellemesi test edildi', time: '14:00', icon: <PendingActionsIcon /> },
    { id: 7, action: '1 gecikmiş görev tamamlandı', time: '15:45', icon: <WarningIcon /> },
  ];

  // Öncelik renkleri
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'yüksek': return theme.palette.error.main;
      case 'orta': return theme.palette.warning.main;
      case 'düşük': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  // İstatistik kartı bileşeni
  const StatCard = ({ title, value, icon, color, secondaryText }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1.5}>
          <Avatar sx={{ bgcolor: color, mr: 1.5, width: 32, height: 32 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle2" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" component="div" fontWeight="500">
          {value}
        </Typography>
        {secondaryText && (
          <Typography variant="caption" color="text.secondary" component="div" mt={0.5}>
            {secondaryText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Genel Bakış Sekmesi İçeriği
  const OverviewContent = () => (
    <>
      {/* İstatistik Kartları */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Atanan Talepler"
            value={stats.assignedTickets}
            icon={<AssignmentIcon fontSize="small" />}
            color={theme.palette.primary.main}
            secondaryText="Aktif görevleriniz"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Bugün Çözülen"
            value={stats.resolvedToday}
            icon={<CheckIcon fontSize="small" />}
            color={theme.palette.success.main}
            secondaryText="Bugünkü tamamlananlar"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Bekleyen"
            value={stats.pendingTickets}
            icon={<PendingActionsIcon fontSize="small" />}
            color={theme.palette.warning.main}
            secondaryText="Henüz başlanmamış"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Yanıt Süresi"
            value={stats.averageResponseTime}
            icon={<AccessTimeIcon fontSize="small" />}
            color={theme.palette.info.main}
            secondaryText="Ortalama"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Tamamlama"
            value={`%${stats.completionRate}`}
            icon={<EqualizerIcon fontSize="small" />}
            color={theme.palette.secondary.main}
            secondaryText="Haftalık oran"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Geciken"
            value={stats.overdueTickets}
            icon={<WarningIcon fontSize="small" />}
            color={theme.palette.error.main}
            secondaryText="Dikkat gerektirir"
          />
        </Grid>
      </Grid>

      {/* Ana içerik - üst sıra */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Haftalık Çözülen Talepler</Typography>
              <EqualizerIcon fontSize="small" color="action" />
            </Box>
            <Bar
              data={weeklyResolutionData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Kategori Dağılımı</Typography>
              <TimelineIcon fontSize="small" color="action" />
            </Box>
            <Box height={220} display="flex" justifyContent="center" alignItems="center">
              <Doughnut
                data={workloadData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                        font: {
                          size: 11
                        }
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Ana içerik - alt sıra */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Yaklaşan Görevler</Typography>
              <CalendarMonthIcon fontSize="small" color="action" />
            </Box>
            <List>
              {upcomingTasks.map((task) => (
                <ListItem key={task.id} sx={{ px: 0, py: 0.75 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: `${getPriorityColor(task.priority)}20`, 
                      color: getPriorityColor(task.priority),
                      width: 32, 
                      height: 32
                    }}>
                      <AssignmentIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: getPriorityColor(task.priority) }}>
                          {task.priority}
                        </Typography>
                        <Typography variant="caption">
                          {formatDistanceToNow(task.dueDate, { addSuffix: true, locale: tr })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Performans Metrikleri</Typography>
              <StarIcon fontSize="small" color="action" />
            </Box>
            <Box height={300} display="flex" justifyContent="center" alignItems="center">
              <Radar
                data={performanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: {
                        display: true
                      },
                      suggestedMin: 0,
                      suggestedMax: 100
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  // Günlük Aktivite Sekmesi İçeriği
  const DailyActivityContent = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Bugünkü Aktivite</Typography>
              <AccessTimeIcon fontSize="small" color="action" />
            </Box>
            <Box sx={{ position: 'relative', px: 2, py: 1 }}>
              {todayActivity.map((activity, index) => (
                <Box key={activity.id} sx={{ display: 'flex', mb: index !== todayActivity.length - 1 ? 3 : 0 }}>
                  <Box sx={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mr: 2 
                  }}>
                    <Typography variant="caption" color="text.secondary" mb={0.5}>
                      {activity.time}
                    </Typography>
                    <Avatar sx={{ 
                      width: 30, 
                      height: 30, 
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.dark
                    }}>
                      {activity.icon}
                    </Avatar>
                    {index !== todayActivity.length - 1 && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 50, 
                        width: 2, 
                        height: 40, 
                        bgcolor: theme.palette.divider 
                      }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      {activity.action}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Bugünkü Hedefler</Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom mb={2}>Açık taleplerinizin %40'ını çözün</Typography>
              <LinearProgress 
                variant="determinate" 
                value={60} 
                color="success"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">İlerleme: 60%</Typography>
                <Typography variant="caption" color="success.main">3/5 tamamlandı</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" gutterBottom mb={2}>Yazılım güncellemesi testlerini tamamlayın</Typography>
              <LinearProgress 
                variant="determinate" 
                value={25} 
                color="warning"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">İlerleme: 25%</Typography>
                <Typography variant="caption" color="warning.main">1/4 tamamlandı</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" gutterBottom mb={2}>Bilgi tabanına en az 1 yeni makale ekleyin</Typography>
              <LinearProgress 
                variant="determinate" 
                value={0} 
                color="error"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">İlerleme: 0%</Typography>
                <Typography variant="caption" color="error.main">0/1 tamamlandı</Typography>
              </Box>
            </Box>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Hızlı İstatistikler</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" mb={2}>
                  <CircularProgress 
                    variant="determinate" 
                    value={78} 
                    size={80}
                    thickness={4}
                    color="success"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" fontWeight="medium">Müşteri Memnuniyeti</Typography>
                  <Typography variant="h6" color="success.main">78%</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" mb={2}>
                  <CircularProgress 
                    variant="determinate" 
                    value={92} 
                    size={80}
                    thickness={4}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" fontWeight="medium">Yanıt Oranı</Typography>
                  <Typography variant="h6" color="primary.main">92%</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Personel Kontrol Paneli
        </Typography>
        <Tooltip title="Yenile">
          <IconButton onClick={refreshData} size="small" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {userInfo && (
            <Box mb={4}>
              <Typography variant="h6">
                Merhaba, {userInfo.name || userInfo.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          )}

          {/* Sekmeler */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label="Genel Bakış" id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
              <Tab label="Günlük Aktivite" id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
              <Tab label="Kişisel İstatistikler" id="dashboard-tab-2" aria-controls="dashboard-tabpanel-2" />
            </Tabs>
          </Box>

          {/* Sekme içerikleri */}
          <TabPanel value={tabValue} index={0}>
            <OverviewContent />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <DailyActivityContent />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <PersonalStats userId="" />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 