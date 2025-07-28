import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'bet_update' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export function useNotifications() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notifications based on user activity
  const generateSampleNotifications = (): Notification[] => [
    {
      id: '1',
      type: 'bet_update',
      title: 'Bet Settlement',
      message: 'Your bet on Lakers vs Warriors has been settled. You won $125!',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'promotion',
      title: 'VIP Tier Upgrade Available',
      message: 'You\'re eligible for Silver tier! Unlock exclusive betting lines.',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: false,
      actionUrl: '/tier-comparison',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'info',
      title: 'New Sports Added',
      message: 'We\'ve added Cricket and Rugby betting markets!',
      timestamp: new Date(Date.now() - 24 * 3600000),
      read: true,
      priority: 'low'
    }
  ];

  // Load notifications
  useEffect(() => {
    if (user) {
      const sampleNotifs = generateSampleNotifications();
      setNotifications(sampleNotifs);
      updateUnreadCount(sampleNotifs);
    }
  }, [user]);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      updateUnreadCount(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      updateUnreadCount(updated);
      return updated;
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      updateUnreadCount(updated);
      return updated;
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      updateUnreadCount(updated);
      return updated;
    });

    // Show toast for high priority notifications
    if (notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support desktop notifications",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: "Notifications enabled",
        description: "You'll now receive betting updates and alerts",
      });
      return true;
    } else {
      toast({
        title: "Notifications blocked",
        description: "Enable notifications in your browser settings to get alerts",
        variant: "destructive",
      });
      return false;
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    requestNotificationPermission,
    showBrowserNotification
  };
}