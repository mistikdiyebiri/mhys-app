import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme, Theme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SecurityIcon from '@mui/icons-material/Security';
import TextsmsIcon from '@mui/icons-material/Textsms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../../contexts/AuthContext';
import { PagePermission } from '../../models/Role';
import PermissionGuard from '../../components/PermissionGuard';
import { NotificationButton } from '../../components/NotificationPopover';

// Alt sayfalar (lazy-loaded)
// @ts-ignore
const Overview = React.lazy(() => import('./Overview'));
// @ts-ignore
const Employees = React.lazy(() => import('./Employees'));
// @ts-ignore
const Departments = React.lazy(() => import('./Departments'));
// @ts-ignore
const Reports = React.lazy(() => import('./Reports'));
// @ts-ignore
const Tickets = React.lazy(() => import('./Tickets'));
// @ts-ignore
const Settings = React.lazy(() => import('./Settings'));
// @ts-ignore
const GeminiSettings = React.lazy(() => import('./GeminiSettings'));
// @ts-ignore
const RolesManagement = React.lazy(() => import('./RolesManagement'));
// @ts-ignore
const QuickReplySettings = React.lazy(() => import('./QuickReplySettings'));
// @ts-ignore
const Notifications = React.lazy(() => import('./Notifications'));
// @ts-ignore
const EmailSettings = React.lazy(() => import('./EmailSettings'));

const drawerWidth = 240;

const openedMixin = (theme: Theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  minHeight: 48,
}));

// @ts-ignore - DrawerStyled tiplerindeki sorunları görmezden gel
const DrawerStyled = styled(Drawer, { 
  shouldForwardProp: (prop) => prop !== 'open' 
// @ts-ignore - theme parametresi sorunlarını görmezden gel
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme as Theme),
    '& .MuiDrawer-paper': openedMixin(theme as Theme),
  }),
  ...(!open && {
    ...closedMixin(theme as Theme),
    '& .MuiDrawer-paper': closedMixin(theme as Theme),
  }),
}));

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const { logout, getUserAttributes } = useAuth();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const attributes = await getUserAttributes();
        // Amplify v6'da öznitelikler doğrudan obje olarak geliyor
        const firstName = attributes['given_name'] || '';
        const lastName = attributes['family_name'] || '';
        const role = attributes['custom:role'] || '';
        
        setUserName(`${firstName} ${lastName}`);
        setUserRole(role === 'admin' ? 'Yönetici' : 'Personel');
      } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata oluştu:', error);
      }
    };

    fetchUserData();
  }, [getUserAttributes]);

  // Menü öğeleri
  const menuItems = [
    {
      text: 'Genel Bakış',
      path: '/admin/dashboard',
      icon: <DashboardIcon />,
      permission: undefined // Herkes erişebilir
    },
    {
      text: 'Destek Talepleri',
      path: '/admin/dashboard/tickets',
      icon: <SupportAgentIcon />,
      permission: PagePermission.TICKETS
    },
    {
      text: 'Personel',
      path: '/admin/dashboard/employees',
      icon: <PeopleIcon />,
      permission: PagePermission.EMPLOYEES
    },
    {
      text: 'Departmanlar',
      path: '/admin/dashboard/departments',
      icon: <BusinessIcon />,
      permission: PagePermission.DEPARTMENTS
    },
    {
      text: 'Bildirimler',
      path: '/admin/dashboard/notifications',
      icon: <NotificationsIcon />,
      permission: PagePermission.NOTIFICATIONS
    },
    {
      text: 'Raporlar',
      path: '/admin/dashboard/reports',
      icon: <BarChartIcon />,
      permission: PagePermission.REPORTS
    },
    {
      text: 'Rol Yönetimi',
      path: '/admin/dashboard/roles',
      icon: <SecurityIcon />,
      permission: PagePermission.ROLES
    },
    {
      text: 'E-posta Ayarları',
      path: '/admin/dashboard/email-settings',
      icon: <EmailIcon />,
      permission: PagePermission.SETTINGS
    },
    {
      text: 'Hazır Yanıtlar',
      path: '/admin/dashboard/quickreplies',
      icon: <TextsmsIcon />,
      permission: PagePermission.SETTINGS
    },
    {
      text: 'AI Ayarları',
      path: '/admin/dashboard/gemini-settings',
      icon: <SmartToyIcon />,
      permission: PagePermission.GEMINI_SETTINGS
    },
    {
      text: 'Ayarlar',
      path: '/admin/dashboard/settings',
      icon: <SettingsIcon />,
      permission: PagePermission.SETTINGS
    }
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  // Aktif menü öğesini kontrol et
  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin/dashboard';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      <DrawerStyled variant="permanent" open={open}>
        <DrawerHeader>
          <Typography variant="h6" sx={{ ml: 2, color: 'primary.main', fontWeight: 600, fontSize: '1rem' }}>
            Müşteri Hizmetleri
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
              {open ? (theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />) : <MenuIcon />}
            </IconButton>
          </Box>
        </DrawerHeader>
        
        {/* Ana menü öğeleri */}
        <List>
          {menuItems.map((item) => {
            // İzin kontrolü yaparak menü öğesini göster
            const menuItem = (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      opacity: open ? 1 : 0,
                      color: isActive(item.path) ? 'primary.main' : 'inherit', 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
            
            // Eğer izin gerekiyorsa izin kontrolü yap
            if (item.permission) {
              return (
                <PermissionGuard key={item.text} permission={item.permission}>
                  {menuItem}
                </PermissionGuard>
              );
            }
            
            // İzin gerekmiyorsa direkt göster
            return menuItem;
          })}
        </List>
        
        {/* Çıkış yapma butonu - En altta ayrı bir bölüm */}
        <Box sx={{ 
          mt: 'auto', // Altına yasla
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          py: 1
        }}>
          {open && (
            <Box sx={{ 
              px: 2, 
              py: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box>
                <Typography variant="body2" fontSize="0.7rem" color="text.secondary">
                  {userRole}
                </Typography>
                <Typography variant="body1" fontSize="0.8rem" fontWeight={500}>
                  {userName}
                </Typography>
              </Box>
              <NotificationButton />
            </Box>
          )}
          
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Çıkış Yap" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: 'error.main', 
                }} 
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </DrawerStyled>
      
      {/* Ana içerik */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/gemini-settings" element={<GeminiSettings />} />
            <Route path="/quickreplies" element={<QuickReplySettings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route 
              path="/roles" 
              element={
                <PermissionGuard permission={PagePermission.ROLE_VIEW}>
                  <RolesManagement />
                </PermissionGuard>
              } 
            />
            <Route path="/email-settings" element={<EmailSettings />} />
          </Routes>
        </React.Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard; 