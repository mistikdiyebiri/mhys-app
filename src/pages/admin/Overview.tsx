import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip
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
  Warning as WarningIcon
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';

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

const Overview: React.FC = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    ticketsOpen: 23,
    ticketsInProgress: 12,
    ticketsResolved: 45,
    ticketsTotal: 80,
    employees: 8,
    departments: 3,
    customerCount: 156,
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

  // Örnek veri - Bugünkü ticket'lar
  const ticketsChartData = {
    labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    datasets: [
      {
        label: 'Açılan Talepler',
        data: [5, 8, 12, 7, 10, 3, 2],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Çözülen Talepler',
        data: [3, 5, 8, 13, 8, 5, 3],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Departman dağılımı verileri
  const departmentChartData = {
    labels: ['Teknik Destek', 'Satış', 'Finans'],
    datasets: [
      {
        label: 'Departmanlara Göre Açık Talepler',
        data: [15, 5, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Öncelik dağılımı
  const priorityChartData = {
    labels: ['Düşük', 'Orta', 'Yüksek', 'Kritik'],
    datasets: [
      {
        data: [10, 15, 7, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
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

  const StatCard = ({ title, value, icon, color, changeIcon, changeText, changeDirection }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {changeText && (
          <Box display="flex" alignItems="center">
            {changeDirection === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
            <Typography variant="body2" color={changeDirection === 'up' ? 'success.main' : 'error.main'} ml={0.5}>
              {changeText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Genel Bakış
        </Typography>
        <Tooltip title="Yenile">
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* İstatistik Kartları */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Açık Talepler" 
            value={stats.ticketsOpen} 
            icon={<SupportIcon />} 
            color="primary.main"
            changeDirection="up"
            changeText="Geçen haftaya göre %12 artış"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Müşteriler" 
            value={stats.customerCount} 
            icon={<PeopleIcon />} 
            color="secondary.main"
            changeDirection="up"
            changeText="Bu ay 8 yeni kayıt"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Personeller" 
            value={stats.employees} 
            icon={<PeopleIcon />} 
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Departmanlar" 
            value={stats.departments} 
            icon={<BusinessIcon />} 
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Grafikler */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">7 Günlük Destek Talepleri</Typography>
            </Box>
            <Line 
              data={ticketsChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                }
              }} 
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" mb={2}>Departmanlara Göre Talepler</Typography>
            <Box height={200} display="flex" justifyContent="center">
              <Doughnut 
                data={departmentChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Üçüncü sıra */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Son Aktiviteler</Typography>
            <List>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
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
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Öncelik Dağılımı</Typography>
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
    </Box>
  );
};

export default Overview; 