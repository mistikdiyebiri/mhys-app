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
  Speed as SpeedIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon
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
import { alpha } from '@mui/material/styles';

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
    customerSatisfaction: 87,
    ticketTrend: '+14%',
    resolutionRate: '92%',
    firstResponseTime: '28 dakika',
    reopenRate: '4.2%'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde veri çekelim
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    
    // Gerçek uygulamada, burada API çağrısı yapılır
    setTimeout(() => {
      // Simüle edilmiş rasgele veri güncellemeleri
      setStats(prevStats => ({
        ...prevStats,
        ticketsOpen: Math.floor(Math.random() * 10) + 18,
        ticketsInProgress: Math.floor(Math.random() * 8) + 9,
        ticketsResolved: Math.floor(Math.random() * 15) + 40,
        closedToday: Math.floor(Math.random() * 5) + 6,
        activeUsers: Math.floor(Math.random() * 20) + 35,
        customerSatisfaction: Math.floor(Math.random() * 10) + 82
      }));
      setLoading(false);
    }, 800);
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
        backgroundColor: alpha(theme.palette.error.main, 0.2),
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.error.main,
      },
      {
        label: 'Çözülen Talepler',
        data: [3, 5, 8, 13, 8, 5, 3],
        borderColor: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.2),
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.success.main,
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
    <Card sx={{ 
      height: '100%', 
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.grey[500], 0.2)}`
      }
    }} onClick={onClick}>
      <ButtonBase sx={{ width: '100%', height: '100%', display: 'block', textAlign: 'left' }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ bgcolor: color, mr: 1.5, width: 30, height: 30 }}>
              {icon}
            </Avatar>
            <Typography variant="body2" component="div" noWrap fontWeight="medium">
              {title}
            </Typography>
          </Box>
          <Typography variant="h5" component="div" fontWeight="bold" mb={1}>
            {value}
          </Typography>
          {changeText && (
            <Box display="flex" alignItems="center">
              {changeDirection === 'up' ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />}
              <Typography variant="caption" color={changeDirection === 'up' ? 'success.main' : 'error.main'} ml={0.5} fontWeight="medium">
                {changeText}
              </Typography>
            </Box>
          )}
          {onClick && (
            <Box display="flex" justifyContent="flex-end" mt={0.5}>
              <ArrowForwardIcon fontSize="small" color="action" />
            </Box>
          )}
        </CardContent>
      </ButtonBase>
    </Card>
  );

  // Yeni: Cevap Süreleri Trendi (son 7 gün)
  const responseTimeData = {
    labels: ['7 Gün Önce', '6 Gün Önce', '5 Gün Önce', '4 Gün Önce', '3 Gün Önce', '2 Gün Önce', 'Bugün'],
    datasets: [
      {
        label: 'İlk Yanıt Süresi (dk)',
        data: [42, 35, 38, 25, 30, 28, 26],
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        tension: 0.3,
        fill: false,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        yAxisID: 'y'
      },
      {
        label: 'Çözüm Süresi (saat)',
        data: [4.8, 5.2, 3.5, 4.2, 3.8, 3.2, 3.0],
        borderColor: theme.palette.warning.main,
        backgroundColor: alpha(theme.palette.warning.main, 0.2),
        tension: 0.3,
        fill: false,
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: theme.palette.warning.main,
        yAxisID: 'y1'
      }
    ]
  };

  // Yeni: Çözüm oranı (son 6 ay)
  const resolutionRateData = {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
    datasets: [
      {
        label: 'Çözüm Oranı',
        data: [85, 88, 92, 91, 94, 96],
        fill: true,
        backgroundColor: alpha(theme.palette.info.main, 0.2),
        borderColor: theme.palette.info.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.info.main,
        tension: 0.3
      },
      {
        label: 'Hedef',
        data: [90, 90, 90, 90, 90, 90],
        fill: false,
        borderColor: alpha(theme.palette.grey[500], 0.5),
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

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
            changeText={stats.ticketTrend}
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
            changeText={stats.resolutionRate}
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
              value={stats.firstResponseTime} 
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
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
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
                      font: {
                        size: 11,
                        weight: 'bold' as const
                      }
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    usePointStyle: true,
                    backgroundColor: alpha(theme.palette.grey[900], 0.8),
                    titleFont: {
                      size: 12,
                      weight: 'bold' as const
                    },
                    bodyFont: {
                      size: 11
                    },
                    padding: 10,
                    cornerRadius: 8
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: alpha(theme.palette.grey[500], 0.15)
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.4
                  },
                  point: {
                    radius: 3,
                    hoverRadius: 5,
                    borderWidth: 2,
                    borderColor: theme.palette.background.paper
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Departman Dağılımı</Typography>
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
                        font: {
                          size: 10,
                        }
                      }
                    },
                    tooltip: {
                      usePointStyle: true,
                      backgroundColor: alpha(theme.palette.grey[900], 0.8),
                      titleFont: {
                        size: 12,
                        weight: 'bold' as const
                      },
                      bodyFont: {
                        size: 11
                      },
                      padding: 8,
                      cornerRadius: 6
                    }
                  },
                  elements: {
                    arc: {
                      borderWidth: 1,
                      borderColor: theme.palette.background.paper
                    }
                  }
                }} 
              />
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" fontSize="0.75rem">
                <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                Teknik departmanı bu ay en yüksek talep sayısına sahip.
              </Typography>
              <Box mt={1} display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Toplam departman sayısı: 3
                </Typography>
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                  Detaylı analiz
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Üçüncü sıra */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
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
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Cevap Süreleri Trendi</Typography>
              <TimelineIcon fontSize="small" color="action" />
            </Box>
            <Box height={240} display="flex" justifyContent="center">
              <Line 
                data={responseTimeData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                        font: {
                          size: 10,
                        }
                      }
                    },
                    tooltip: {
                      usePointStyle: true,
                      backgroundColor: alpha(theme.palette.grey[900], 0.8),
                      titleFont: {
                        size: 12,
                        weight: 'bold' as const
                      },
                      bodyFont: {
                        size: 11
                      },
                      padding: 8,
                      cornerRadius: 6
                    }
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Dakika',
                        font: {
                          size: 10,
                        }
                      },
                      suggestedMin: 0,
                      suggestedMax: 50,
                      ticks: {
                        font: {
                          size: 9,
                        }
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Saat',
                        font: {
                          size: 10,
                        }
                      },
                      suggestedMin: 0,
                      suggestedMax: 8,
                      ticks: {
                        font: {
                          size: 9,
                        }
                      },
                      grid: {
                        display: false,
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 9,
                        }
                      },
                      grid: {
                        display: false,
                      }
                    }
                  }
                }}
              />
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="primary" display="flex" alignItems="center" fontSize="0.75rem">
                <InsightsIcon fontSize="small" sx={{ mr: 1 }} />
                Cevap süreleri son hafta içinde %12 oranında iyileşti.
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
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
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
                  },
                  tooltip: {
                    usePointStyle: true,
                    backgroundColor: alpha(theme.palette.grey[900], 0.8),
                    titleFont: {
                      size: 12,
                      weight: 'bold' as const
                    },
                    bodyFont: {
                      size: 11
                    },
                    padding: 8,
                    cornerRadius: 6
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: alpha(theme.palette.grey[500], 0.15)
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
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
                        font: {
                          size: 10,
                        }
                      }
                    },
                    tooltip: {
                      usePointStyle: true,
                      backgroundColor: alpha(theme.palette.grey[900], 0.8),
                      titleFont: {
                        size: 12,
                        weight: 'bold' as const
                      },
                      bodyFont: {
                        size: 11
                      },
                      padding: 8,
                      cornerRadius: 6
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Çözüm Oranı (Son 6 Ay)</Typography>
              <SpeedIcon fontSize="small" color="action" />
            </Box>
            <Box height={240} display="flex" justifyContent="center" alignItems="center">
              <Line 
                data={resolutionRateData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 10,
                        usePointStyle: true,
                        font: {
                          size: 10,
                        }
                      }
                    },
                    tooltip: {
                      usePointStyle: true,
                      backgroundColor: alpha(theme.palette.grey[900], 0.8),
                      titleFont: {
                        size: 12,
                        weight: 'bold' as const
                      },
                      bodyFont: {
                        size: 11
                      },
                      padding: 8,
                      cornerRadius: 6
                    }
                  },
                  scales: {
                    y: {
                      min: 80,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        },
                        font: {
                          size: 10
                        }
                      },
                      grid: {
                        color: alpha(theme.palette.grey[500], 0.15)
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} 
              />
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="info.main" display="flex" alignItems="center" fontSize="0.75rem">
                <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
                Son 6 ayda çözüm oranı %11 arttı
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[2] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">Personel Performansı</Typography>
              <BarChartIcon fontSize="small" color="action" />
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
                      font: {
                        size: 10,
                      }
                    }
                  },
                  tooltip: {
                    usePointStyle: true,
                    backgroundColor: alpha(theme.palette.grey[900], 0.8),
                    titleFont: {
                      size: 12,
                      weight: 'bold' as const
                    },
                    bodyFont: {
                      size: 11
                    },
                    padding: 8,
                    cornerRadius: 6
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: alpha(theme.palette.grey[500], 0.15)
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 10
                      }
                    }
                  }
                }
              }} 
            />
            <Box mt={2}>
              <Typography variant="body2" color="success.main" display="flex" alignItems="center" fontSize="0.75rem">
                <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
                Ayşe'nin performansı bu ay %23 arttı
              </Typography>
              <Box mt={1} display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Ortalama çözüm süresi: 5.4 saat
                </Typography>
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                  Tüm personel raporları
                </Typography>
              </Box>
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