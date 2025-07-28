import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, BellOff, Check, X, AlertTriangle, Trophy, Gift, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { useLocation } from 'wouter';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen = true, onClose }) => {
  const [, navigate] = useLocation();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'loss':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'bet_update':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'starting_soon':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'win':
        return 'default';
      case 'loss':
        return 'destructive';
      case 'promotion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose?.();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => {}}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={requestNotificationPermission}
              title="Enable browser notifications"
            >
              <BellOff className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">We'll notify you about bet updates and opportunities</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge 
                          variant={getNotificationVariant(notification.type)}
                          className="text-xs"
                        >
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          {notification.actionUrl && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;