import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface Notification {
  id: string;
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'game_started' | 'game_ended' | 'score_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    betId?: number;
    gameId?: number;
    teamNames?: string[];
    score?: string;
  };
}

interface BetNotificationsProps {
  userId?: number;
}

const BetNotifications: React.FC<BetNotificationsProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { toast } = useToast();

  // Load notifications from local storage on component mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('weparlay_notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        // Convert string dates back to Date objects
        const notificationsWithDates = parsedNotifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
        setNotifications(notificationsWithDates);
        updateUnreadCount(notificationsWithDates);
      } catch (error) {
        console.error('Failed to parse stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('weparlay_notifications', JSON.stringify(notifications));
    updateUnreadCount(notifications);
  }, [notifications]);

  // This would normally connect to a WebSocket for real-time updates
  useEffect(() => {
    if (!userId || !notificationsEnabled) return;

    // Simulate receiving a notification every 30 seconds for demo purposes
    const simulateNotificationInterval = setInterval(() => {
      // Only add a simulated notification 20% of the time to avoid overwhelming the user
      if (Math.random() < 0.2) {
        addDemoNotification();
      }
    }, 30000);

    return () => clearInterval(simulateNotificationInterval);
  }, [userId, notificationsEnabled]);

  // Update unread count
  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  // Add a demo notification for testing purposes
  const addDemoNotification = () => {
    const notificationTypes = [
      {
        type: 'bet_placed',
        title: 'Bet Placed',
        message: 'Your bet on Lakers vs. Warriors has been confirmed.',
        data: { betId: 123, teamNames: ['Lakers', 'Warriors'] }
      },
      {
        type: 'score_update',
        title: 'Score Update',
        message: 'Lakers 95 - Warriors 92 (Q4 2:14)',
        data: { gameId: 456, teamNames: ['Lakers', 'Warriors'], score: '95-92' }
      },
      {
        type: 'bet_won',
        title: 'Bet Won!',
        message: 'You won your bet on Lakers vs. Warriors! +$120.00',
        data: { betId: 123, teamNames: ['Lakers', 'Warriors'] }
      },
      {
        type: 'game_started',
        title: 'Game Started',
        message: 'Celtics vs. Bucks has begun. Good luck!',
        data: { gameId: 789, teamNames: ['Celtics', 'Bucks'] }
      }
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType.type as any,
      title: randomType.title,
      message: randomType.message,
      timestamp: new Date(),
      read: false,
      data: randomType.data
    };

    // Add to state
    setNotifications(prev => [newNotification, ...prev]);

    // Show a toast for the new notification
    if (notificationsEnabled) {
      toast({
        title: newNotification.title,
        description: newNotification.message,
        duration: 5000,
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Toggle notifications on/off
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled 
        ? 'Notifications disabled' 
        : 'Notifications enabled',
      description: notificationsEnabled 
        ? 'You will no longer receive betting notifications' 
        : 'You will now receive real-time betting updates',
      duration: 3000,
    });
  };

  // Get icon and color for notification type
  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'bet_won':
        return { color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' };
      case 'bet_lost':
        return { color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
      case 'score_update':
        return { color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'game_started':
      case 'game_ended':
        return { color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' };
      default:
        return { color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800' };
    }
  };

  // Format the timestamp relative to now (e.g., "2m ago")
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center" 
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 max-h-96 overflow-hidden flex flex-col">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleNotifications}
                title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
              >
                {notificationsEnabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </Button>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 max-h-96">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  return (
                    <div 
                      key={notification.id} 
                      className={`p-3 ${!notification.read ? 'bg-gray-50 dark:bg-gray-800/50' : ''} hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-medium ${style.color}`}>{notification.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          New
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={clearAllNotifications}
              >
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BetNotifications;