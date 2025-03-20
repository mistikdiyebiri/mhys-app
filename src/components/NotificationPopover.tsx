import React from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Paper,
  Tooltip,
  CircularProgress,
  Button,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { NotificationPriority } from '../models/Notification';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({ anchorEl, onClose }) => {
  const theme = useTheme();
  const { notifications, loading, unreadCount, markAsRead } = useNotifications();
  const open = Boolean(anchorEl);

  // Bildirimin önceliğine göre ikon göster
  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return <ErrorIcon color="error" />;
      case NotificationPriority.HIGH:
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case NotificationPriority.MEDIUM:
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Bugün ${format(date, 'HH:mm', { locale: tr })}`;
    } else if (diffDays === 1) {
      return `Dün ${format(date, 'HH:mm', { locale: tr })}`;
    } else if (diffDays < 7) {
      return format(date, 'EEEE HH:mm', { locale: tr });
    } else {
      return format(date, 'dd MMMM yyyy HH:mm', { locale: tr });
    }
  };

  // Bildirimi oku
  const handleRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(id);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 500,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600}>
          Bildirimler
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Bildirim bulunmuyor
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    py: 1.5,
                    px: 2,
                    bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <Box sx={{ mr: 1.5, mt: 0.5 }}>
                    {getPriorityIcon(notification.priority)}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notification.isRead ? 400 : 600}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ 
                            fontWeight: notification.isRead ? 400 : 500,
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {notification.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          display="block" 
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {!notification.isRead && (
                    <Tooltip title="Okundu olarak işaretle">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleRead(notification.id, e)}
                        sx={{ ml: 1 }}
                      >
                        <CheckCircleIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      <Box 
        sx={{ 
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Button 
          variant="outlined" 
          size="small" 
          endIcon={<ArrowForwardIcon />}
          component={Link}
          to="/admin/dashboard/notifications"
          onClick={onClose}
        >
          Tümünü Görüntüle
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationPopover;

export const NotificationButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { unreadCount, openNotificationsPanel, setOpenNotificationsPanel } = useNotifications();
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenNotificationsPanel(true);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
    setOpenNotificationsPanel(false);
  };
  
  return (
    <>
      <Tooltip title="Bildirimler">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)'
              }
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            invisible={unreadCount === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationPopover 
        anchorEl={anchorEl} 
        onClose={handleClose} 
      />
    </>
  );
}; 