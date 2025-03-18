import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Grid, 
  Avatar, 
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  ErrorOutline as ErrorOutlineIcon,
  TrendingUp as TrendingUpIcon,
  GroupAdd as GroupAddIcon,
  Speed as SpeedIcon,
  StarRate as StarRateIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PersonalStatsProps {
  userId?: string;
}

const PersonalStats: React.FC<PersonalStatsProps> = ({ userId }) => {
  const { userRole } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Kişisel istatistikleri yükleme simülasyonu
  React.useEffect(() => {
    setLoading(true);
    // Gerçek uygulamada API'den veri çekilecek
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Personel istatistikleri için örnek veriler
  const agentStats = {
    handledTickets: 45,
    resolvedTickets: 32,
    pendingTickets: 13,
    averageResponseTime: '45 dakika',
    customerRating: 4.7,
    efficiencyRate: 82,
  };

  // Çözüm oranı grafiği için veriler
  const resolutionData = {
    labels: ['Çözülenler', 'Bekleyenler'],
    datasets: [
      {
        data: [agentStats.resolvedTickets, agentStats.pendingTickets],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Yönetici istatistikleri için örnek veriler
  const adminStats = {
    teamSize: 8,
    teamEfficiency: 78,
    avgResolutionTime: '1.2 gün',
    ticketsThisWeek: 36,
    ticketsLastWeek: 28,
    changePercentage: '+28.5%',
  };

  // Genel istatistikler kartı
  const GeneralStatsCard = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <SpeedIcon />
        </Avatar>
        <Typography variant="h6">Performans Özeti</Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ width: '100%' }}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} height={40} sx={{ my: 1 }} />
          ))}
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {userRole === 'admin' ? (
              // Yönetici istatistikleri
              <>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Ekip Boyutu</Typography>
                    <Typography variant="h5">{adminStats.teamSize} Personel</Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Ekip Verimliliği</Typography>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={adminStats.teamEfficiency} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {adminStats.teamEfficiency}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Ortalama Çözüm Süresi</Typography>
                    <Typography variant="h5">{adminStats.avgResolutionTime}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bu Hafta Açılan Talepler</Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h5" sx={{ mr: 1 }}>{adminStats.ticketsThisWeek}</Typography>
                      <Chip 
                        size="small" 
                        color="success" 
                        icon={<TrendingUpIcon />} 
                        label={adminStats.changePercentage} 
                      />
                    </Box>
                  </Box>
                </Grid>
              </>
            ) : (
              // Personel istatistikleri
              <>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">İşlenen Talepler</Typography>
                    <Typography variant="h5">{agentStats.handledTickets}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Müşteri Değerlendirmesi</Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h5" sx={{ mr: 1 }}>{agentStats.customerRating}</Typography>
                      <Box display="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarRateIcon 
                            key={star} 
                            fontSize="small" 
                            color={star <= Math.floor(agentStats.customerRating) ? "warning" : "disabled"} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Ortalama Yanıt Süresi</Typography>
                    <Typography variant="h5">{agentStats.averageResponseTime}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Verimlilik Oranı</Typography>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={agentStats.efficiencyRate} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {agentStats.efficiencyRate}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </>
      )}
    </Paper>
  );

  // Özet kartları
  const SummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {loading ? (
        <>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Skeleton height={30} width="60%" sx={{ mb: 1 }} />
              <Skeleton height={50} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Skeleton height={30} width="60%" sx={{ mb: 1 }} />
              <Skeleton height={50} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Skeleton height={30} width="60%" sx={{ mb: 1 }} />
              <Skeleton height={50} />
            </Paper>
          </Grid>
        </>
      ) : (
        <>
          {userRole === 'admin' ? (
            // Yönetici özet kartları
            <>
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <GroupAddIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Yeni Kayıt Olan Müşteriler (Bu Ay)
                    </Typography>
                    <Typography variant="h5" align="center">24</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Açık Kritik Talepler
                    </Typography>
                    <Typography variant="h5" align="center">3</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Çözüm Oranı (Bu Hafta)
                    </Typography>
                    <Typography variant="h5" align="center">87%</Typography>
                  </Box>
                </Paper>
              </Grid>
            </>
          ) : (
            // Personel özet kartları
            <>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Çözülen
                    </Typography>
                    <Typography variant="h5" align="center">{agentStats.resolvedTickets}</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <AccessTimeIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Bekleyen
                    </Typography>
                    <Typography variant="h5" align="center">{agentStats.pendingTickets}</Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      Toplam
                    </Typography>
                    <Typography variant="h5" align="center">{agentStats.handledTickets}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
        </>
      )}
    </Grid>
  );

  // Durum/Çözüm grafiği
  const ResolutionChart = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" mb={2}>Çözüm Oranı</Typography>
      {loading ? (
        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
      ) : (
        <Box sx={{ height: 200, width: 200, mx: 'auto' }}>
          <Doughnut 
            data={resolutionData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              },
              cutout: '70%'
            }}
          />
        </Box>
      )}
    </Paper>
  );

  // Yapılacaklar listesi
  const TodoList = () => {
    const todoItems = [
      { id: 1, text: 'Kritik öncelikli #TK-1234 talebini incele', priority: 'high' },
      { id: 2, text: 'Müşteri geri bildirimlerini yanıtla', priority: 'medium' },
      { id: 3, text: 'Haftalık raporu hazırla', priority: 'medium' },
      { id: 4, text: 'Yeni personelin oryantasyonunu tamamla', priority: 'low' },
    ];

    const getPriorityIcon = (priority: string) => {
      switch(priority) {
        case 'high': return <ErrorOutlineIcon color="error" />;
        case 'medium': return <AccessTimeIcon color="warning" />;
        case 'low': return <CheckCircleIcon color="info" />;
        default: return <AccessTimeIcon />;
      }
    };

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Yapılacaklar</Typography>
        {loading ? (
          <Box sx={{ width: '100%' }}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={50} sx={{ my: 1 }} />
            ))}
          </Box>
        ) : (
          <List dense>
            {todoItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemIcon>
                    {getPriorityIcon(item.priority)}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Kişisel İstatistikler
      </Typography>

      <GeneralStatsCard />
      <SummaryCards />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResolutionChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <TodoList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalStats; 