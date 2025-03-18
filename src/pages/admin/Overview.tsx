import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Card,
  CardContent,
  ButtonBase,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  SupportAgent as SupportIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  CalendarMonth as CalendarMonthIcon,
  LocalOffer as LocalOfferIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon
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
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, PolarArea } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import PersonalStats from '../../components/dashboard/PersonalStats';

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
  Filler,
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

const Overview: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { userRole } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    ticketsOpen: 23,
    ticketsInProgress: 12,
    ticketsResolved: 45,
    ticketsTotal: 80,
    closedToday: 8,
    employees: 8,
    departments: 3,
    customerCount: 156,
    activeUsers: 42,
    averageResponseTime: '36 dakika',
    averageResolutionTime: '1.2 gün',
    customerSatisfaction: 87
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Gerçek uygulamada, Amplify GraphQL API üzerinden verileri çekeriz
    // API.graphql(graphqlOperation(listTickets, { filter: ... }))
    // Şimdilik sahte veriler kullanacağız
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // Gerçek uygulamada, burada veriyi yenileriz
      setLoading(false);
    }, 1000);
  };

  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Örnek veri - Haftalık ticket'lar
  const ticketsChartData = {
    labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    datasets: [
      {
        label: 'Açılan Talepler',
        data: [5, 8, 12, 7, 10, 3, 2],
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Çözülen Talepler',
        data: [3, 5, 8, 13, 8, 5, 3],
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Aylık talep trendi
  const monthlyTicketData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    datasets: [
      {
        label: 'Aylık Talep Sayısı',
        data: [65, 78, 52, 91, 68, 70, 99, 85, 80, 72, 88, 74],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
      },
    ],
  };

  // Departman dağılımı verileri
  const departmentChartData = {
    labels: ['Teknik Destek', 'Satış', 'Finans'],
    datasets: [
      {
        label: 'Departmanlara Göre Talepler',
        data: [15, 5, 3],
        backgroundColor: [
          theme.palette.error.light,
          theme.palette.primary.light,
          theme.palette.warning.light,
        ],
        borderColor: [
          theme.palette.error.main,
          theme.palette.primary.main,
          theme.palette.warning.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Kategori dağılımı
  const categoryChartData = {
    labels: ['Teknik', 'Hesap', 'Fatura', 'Genel', 'Özellik Talebi'],
    datasets: [
      {
        data: [25, 18, 12, 8, 5],
        backgroundColor: [
          theme.palette.primary.light,
          theme.palette.secondary.light,
          theme.palette.error.light,
          theme.palette.success.light,
          theme.palette.info.light,
        ],
        borderColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.success.main,
          theme.palette.info.main,
        ],
        borderWidth: 1,
      }
    ]
  };

  // Öncelik dağılımı
  const priorityChartData = {
    labels: ['Düşük', 'Orta', 'Yüksek', 'Kritik'],
    datasets: [
      {
        data: [10, 15, 7, 3],
        backgroundColor: [
          theme.palette.success.light,
          theme.palette.info.light,
          theme.palette.warning.light,
          theme.palette.error.light,
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
        borderWidth: 1,
      }
    ]
  };

  // Personel performansı
  const employeePerformanceData = {
    labels: ['Ali', 'Ayşe', 'Mehmet', 'Fatma', 'Ahmet'],
    datasets: [
      {
        label: 'Çözülen Talepler',
        data: [12, 19, 8, 15, 7],
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Ortalama Çözüm Süresi (Saat)',
        data: [5, 3, 8, 4, 7],
        backgroundColor: theme.palette.warning.main,
      }
    ]
  };

  // Müşteri memnuniyet dağılımı
  const satisfactionData = {
    labels: ['Çok Memnun', 'Memnun', 'Nötr', 'Memnun Değil', 'Hiç Memnun Değil'],
    datasets: [
      {
        data: [30, 40, 15, 10, 5],
        backgroundColor: [
          theme.palette.success.dark,
          theme.palette.success.light,
          theme.palette.info.light,
          theme.palette.warning.light,
          theme.palette.error.light,
        ],
      }
    ]
  };

  // Son aktiviteler (örnek veri)
  const recentActivities = [
    { id: 1, type: 'ticket', user: 'Ahmet Yılmaz', action: 'yeni destek talebi oluşturdu', time: '10 dakika önce' },
    { id: 2, type: 'ticket', user: 'Mehmet Demir', action: 'bir destek talebini kapattı', time: '30 dakika önce' },
    { id: 3, type: 'employee', user: 'Ayşe Kaya', action: 'sisteme giriş yaptı', time: '1 saat önce' },
    { id: 4, type: 'ticket', user: 'Fatma Şahin', action: 'bir destek talebine cevap verdi', time: '2 saat önce' },
    { id: 5, type: 'department', user: 'Admin', action: 'yeni bir departman oluşturdu', time: '3 saat önce' },
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'ticket': return <AssignmentIcon />;
      case 'employee': return <PeopleIcon />;
      case 'department': return <BusinessIcon />;
      default: return <DashboardIcon />;
    }
  };

  // İstatistik kartı bileşeni
  const StatCard = ({ title, value, icon, color, changeIcon, changeText, changeDirection, onClick }: any) => (
    <Card sx={{ height: '100%', transition: 'all 0.3s' }} onClick={onClick}>
      <ButtonBase sx={{ width: '100%', height: '100%', display: 'block', textAlign: 'left' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ bgcolor: color, mr: 1.5, width: 32, height: 32 }}>
              {icon}
            </Avatar>
            <Typography variant="subtitle2" component="div" noWrap>
              {title}
            </Typography>
          </Box>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
          {changeText && (
            <Box display="flex" alignItems="center">
              {changeDirection === 'up' ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />}
              <Typography variant="caption" color={changeDirection === 'up' ? 'success.main' : 'error.main'} ml={0.5}>
                {changeText}
              </Typography>
            </Box>
          )}
          {onClick && (
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <ArrowForwardIcon fontSize="small" color="action" />
            </Box>
          )}
        </CardContent>
      </ButtonBase>
    </Card>
  );

  // Genel Bakış İçeriği
  const OverviewContent = () => (
    <>
      {/* İstatistik Kartları - Daha kompakt */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard 
            title="Açık Talepler" 
            value={stats.ticketsOpen} 
            icon={<SupportIcon fontSize="small" />} 
            color="error.main"
            changeDirection="up"
            changeText="+12%"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            title="İşlenen Talepler" 
            value={stats.ticketsInProgress} 
            icon={<AssignmentIcon fontSize="small" />} 
            color="warning.main"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            title="Çözülen Talepler" 
            value={stats.ticketsResolved} 
            icon={<CheckIcon fontSize="small" />} 
            color="success.main"
            changeDirection="up"
            changeText="+8%"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard 
            title="Bugün Kapatılan" 
            value={stats.closedToday} 
            icon={<CalendarMonthIcon fontSize="small" />} 
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* İkinci sıra istatistikler - Yalnızca tablet ve masaüstünde görünür */}
      {!isSmallScreen && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <StatCard 
              title="Müşteriler" 
              value={stats.customerCount} 
              icon={<PeopleIcon fontSize="small" />} 
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard 
              title="Aktif Kullanıcılar" 
              value={stats.activeUsers} 
              icon={<PeopleIcon fontSize="small" />} 
              color="primary.main"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard 
              title="Ort. Yanıt Süresi" 
              value={stats.averageResponseTime} 
              icon={<CalendarMonthIcon fontSize="small" />} 
              color="warning.main"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard 
              title="Müşteri Memnuniyeti" 
              value={`%${stats.customerSatisfaction}`} 
              icon={<LocalOfferIcon fontSize="small" />} 
              color="success.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Grafikler - İki ana sütun */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Haftalık Destek Talepleri</Typography>
              <BarChartIcon fontSize="small" color="action" />
            </Box>
            <Line 
              data={ticketsChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 10,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.4
                  },
                  point: {
                    radius: 3,
                    hoverRadius: 5
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Kategori Dağılımı</Typography>
              <PieChartIcon fontSize="small" color="action" />
            </Box>
            <Box height={200} display="flex" justifyContent="center" alignItems="center">
              <Pie 
                data={categoryChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                      }
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Üçüncü sıra */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Son Aktiviteler</Typography>
            </Box>
            <List dense>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.user}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.action}
                          </Typography>
                          {` — ${activity.time}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Öncelik Dağılımı</Typography>
            </Box>
            <Box height={240} display="flex" justifyContent="center">
              <Bar 
                data={priorityChartData} 
                options={{
                  responsive: true,
                  indexAxis: 'y' as const,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      }
                    },
                    y: {
                      grid: {
                        display: false,
                      }
                    }
                  }
                }} 
              />
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="warning.main" display="flex" alignItems="center">
                <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                Kritik öncelikli 3 destek talebi bulunmaktadır.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  // Performans İçeriği
  const PerformanceContent = () => (
    <>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Aylık Talep Trendi</Typography>
            </Box>
            <Bar 
              data={monthlyTicketData} 
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
                      display: true,
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    }
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Departman Dağılımı</Typography>
            </Box>
            <Box height={200} display="flex" justifyContent="center" alignItems="center">
              <Doughnut 
                data={departmentChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true,
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Personel Performansı</Typography>
            </Box>
            <Bar 
              data={employeePerformanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 10,
                      usePointStyle: true,
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    }
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Müşteri Memnuniyeti</Typography>
            </Box>
            <Box height={240} display="flex" justifyContent="center" alignItems="center">
              <PolarArea 
                data={satisfactionData} 
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
                  scales: {
                    r: {
                      display: false
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Genel Bakış
        </Typography>
        <Tooltip title="Yenile">
          <IconButton onClick={fetchData} size="small" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Sekmeler */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Özet" id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
          <Tab label="Performans" id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
          <Tab label="Kişisel" id="dashboard-tab-2" aria-controls="dashboard-tabpanel-2" />
        </Tabs>
      </Box>

      {/* Sekme içerikleri */}
      <TabPanel value={tabValue} index={0}>
        <OverviewContent />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <PerformanceContent />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <PersonalStats userId="" />
      </TabPanel>
    </Box>
  );
};

export default Overview; 