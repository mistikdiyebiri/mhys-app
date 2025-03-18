import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme, Theme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
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
import { useAuth } from '../../contexts/AuthContext';

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

const drawerWidth = 240;

// Non-null tip için yardımcı fonksiyon
const assertTheme = (theme?: Theme): Theme => {
  if (!theme) throw new Error('Theme is undefined');
  return theme;
};

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
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// @ts-ignore - AppBarStyled tiplerindeki sorunları görmezden gel
const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
// @ts-ignore - theme parametresi sorunlarını görmezden gel  
})(({ theme, open }) => ({
  // theme'in her zaman var olduğunu garantiliyoruz
  zIndex: (theme as Theme).zIndex.drawer + 1,
  transition: (theme as Theme).transitions.create(['width', 'margin'], {
    easing: (theme as Theme).transitions.easing.sharp,
    duration: (theme as Theme).transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: (theme as Theme).transitions.create(['width', 'margin'], {
      easing: (theme as Theme).transitions.easing.sharp,
      duration: (theme as Theme).transitions.duration.enteringScreen,
    }),
  }),
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, getUserAttributes } = useAuth();
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

  const menuItems = [
    { text: 'Genel Bakış', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Personeller', icon: <PeopleIcon />, path: '/admin/dashboard/employees' },
    { text: 'Departmanlar', icon: <BusinessIcon />, path: '/admin/dashboard/departments' },
    { text: 'Destek Talepleri', icon: <SupportAgentIcon />, path: '/admin/dashboard/tickets' },
    { text: 'Raporlar', icon: <BarChartIcon />, path: '/admin/dashboard/reports' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/admin/dashboard/settings' },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* @ts-ignore */}
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Müşteri Hizmetleri Yönetim Sistemi
          </Typography>
          
          <Tooltip title="Hesap Ayarları">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {userName.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1">{userName}</Typography>
                <Typography variant="body2" color="text.secondary">{userRole}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} component={Link} to="/admin/dashboard/profile">
              <ListItemIcon>
                <Avatar sx={{ width: 24, height: 24 }} />
              </ListItemIcon>
              Profilim
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      
      <DrawerStyled variant="permanent" open={open}>
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Admin Paneli
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.main' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      color: isActive(item.path) ? 'primary.main' : 'inherit'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DrawerStyled>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </React.Suspense>
      </Box>
    </Box>
  );
};

export default Dashboard; 