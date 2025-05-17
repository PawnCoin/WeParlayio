import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Check, AlertTriangle, Trophy, X } from "lucide-react";

interface BetNotification {
  id: string;
  type: 'status_update' | 'win' | 'loss' | 'starting_soon' | 'opportunity';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface BetNotificationsProps {
  userId?: string;
}

const BetNotifications: React.FC<BetNotificationsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);
  const [notifications, setNotifications] = useState<BetNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notifications for demo
  const sampleNotifications: BetNotification[] = [
    {
      id: '1',
      type: 'starting_soon',
      title: 'Lakers vs Warriors starting soon',
      message: 'Your bet on Lakers to win starts in 15 minutes',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false
    },
    {
      id: '2',
      type: 'win',
      title: 'You won your bet!',
      message: 'Your $50 bet on Chiefs to win has paid out $135',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: false
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Odds boosted on your favorite team',
      message: 'Lakers odds just improved from -110 to +120',
      timestamp: new Date(Date.now() - 5 * 3600000),
      read: true,
      actionUrl: '/sports/basketball'
    }
  ];

  // Check for browser notification permissions on load
  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }
    
    setPermissionState(Notification.permission);
    
    // Load sample notifications
    setNotifications(sampleNotifications);
    updateUnreadCount(sampleNotifications);
  }, []);

  // Update unread count when notifications change
  const updateUnreadCount = (notifs: BetNotification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  // Request permission to send notifications
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Browser Incompatible",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Send a test notification
        const notification = new Notification('Notifications Enabled', {
          body: 'You will now receive updates about your bets in real-time',
          icon: '/favicon.ico'
        });
        
        toast({
          title: "Notifications Enabled",
          description: "You will now receive updates about your bets in real-time",
        });
      } else {
        toast({
          title: "Notification Permission Denied",
          description: "You won't receive bet notifications. You can change this in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error Enabling Notifications",
        description: "There was a problem enabling notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Toggle notifications on/off
  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive bet notifications anymore",
      });
    } else {
      if (permissionState === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You will now receive updates about your bets in real-time",
        });
      } else {
        requestPermission();
      }
    }
  };

  // Send a sample notification (demo purposes)
  const sendSampleNotification = () => {
    if (!notificationsEnabled || permissionState !== 'granted') {
      toast({
        title: "Notifications Disabled",
        description: "Please enable notifications first",
        variant: "destructive"
      });
      return;
    }

    const notification = new Notification('Lakers score update!', {
      body: 'Lakers just took the lead 87-85 in the 3rd quarter',
      icon: '/favicon.ico'
    });

    // Add to our internal notifications as well
    const newNotification: BetNotification = {
      id: Date.now().toString(),
      type: 'status_update',
      title: 'Lakers score update!',
      message: 'Lakers just took the lead 87-85 in the 3rd quarter',
      timestamp: new Date(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);

    toast({
      title: "Sample Notification Sent",
      description: "Check your system notifications",
    });
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'loss':
        return <X className="h-5 w-5 text-red-500" />;
      case 'starting_soon':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'opportunity':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Check className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell icon with notification count */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setShowNotificationCenter(!showNotificationCenter)}
        aria-label="Notifications"
      >
        {notificationsEnabled ? 
          <Bell className="h-6 w-6" /> : 
          <BellOff className="h-6 w-6" />
        }
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification center dropdown */}
      {showNotificationCenter && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {notificationsEnabled ? 'On' : 'Off'}
              </span>
              <Switch 
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                aria-label="Toggle notifications"
              />
            </div>
          </div>
          
          {permissionState !== 'granted' && !notificationsEnabled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Enable notifications to get real-time updates on your bets
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={requestPermission}
              >
                Enable Notifications
              </Button>
            </div>
          )}
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && notificationsEnabled && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={sendSampleNotification}
              >
                Send Test Notification
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetNotifications;