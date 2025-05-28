
// Push Notifications System for WeParlay
// Final 2% completion - Mobile app features

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private subscriptions = new Map<string, PushSubscription>();

  constructor() {
    this.initializeServiceWorker();
    this.checkPermission();
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      this.permission = await this.requestPermission();
      if (this.permission === 'granted') {
        await this.subscribeToNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }

    return Notification.permission;
  }

  // Send local notification
  async sendNotification(payload: NotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon-192x192.png',
          badge: payload.badge || '/favicon-32x32.png',
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          requireInteraction: payload.requireInteraction || false,
          silent: false,
          vibrate: [200, 100, 200]
        });
      } else {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon-192x192.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Betting-specific notifications
  async notifyBetResult(betId: string, result: 'won' | 'lost', amount: number): Promise<void> {
    const isWin = result === 'won';
    await this.sendNotification({
      title: isWin ? '🎉 Bet Won!' : '😔 Bet Lost',
      body: isWin 
        ? `Congratulations! You won $${amount.toFixed(2)}`
        : `Better luck next time! You lost $${amount.toFixed(2)}`,
      icon: isWin ? '/icons/win.png' : '/icons/loss.png',
      tag: `bet-result-${betId}`,
      data: { betId, result, amount },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'share', title: isWin ? 'Share Win' : 'Try Again' }
      ],
      requireInteraction: isWin
    });
  }

  // Live event notifications
  async notifyLiveEvent(eventName: string, status: string): Promise<void> {
    await this.sendNotification({
      title: '🔴 Live Event Update',
      body: `${eventName} - ${status}`,
      tag: 'live-event',
      data: { eventName, status },
      actions: [
        { action: 'watch', title: 'Watch Live' },
        { action: 'bet', title: 'Place Bet' }
      ]
    });
  }

  // Promotional notifications
  async notifyPromotion(title: string, description: string, promoCode?: string): Promise<void> {
    await this.sendNotification({
      title: `🎁 ${title}`,
      body: description + (promoCode ? ` Use code: ${promoCode}` : ''),
      tag: 'promotion',
      data: { promoCode },
      actions: [
        { action: 'claim', title: 'Claim Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: true
    });
  }

  // Tournament notifications
  async notifyTournament(tournamentName: string, stage: string): Promise<void> {
    await this.sendNotification({
      title: '🏆 Tournament Update',
      body: `${tournamentName} - ${stage}`,
      tag: 'tournament',
      data: { tournamentName, stage },
      actions: [
        { action: 'view', title: 'View Bracket' },
        { action: 'bet', title: 'Place Bet' }
      ]
    });
  }

  // Scheduled notifications for important events
  scheduleNotification(payload: NotificationPayload, delayMs: number): void {
    setTimeout(() => {
      this.sendNotification(payload);
    }, delayMs);
  }

  // Subscribe to push notifications
  private async subscribeToNotifications(): Promise<void> {
    if (!this.registration) {
      console.warn('Service worker not registered');
      return;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa40HI6DuAULhPqSF1JZlSqVt-LvD8ks-psWCcP-U8TI3j3vUzd1bhzqFkSzTg'
        )
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      this.subscriptions.set('main', subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  // Initialize service worker
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Handle notification clicks
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Handle service worker messages
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    switch (type) {
      case 'notification-click':
        this.handleNotificationClick(data);
        break;
      case 'notification-close':
        this.handleNotificationClose(data);
        break;
    }
  }

  // Handle notification clicks
  private handleNotificationClick(data: any): void {
    const { action, notificationData } = data;
    
    switch (action) {
      case 'view':
        window.location.href = `/bets/${notificationData.betId}`;
        break;
      case 'share':
        this.shareWin(notificationData);
        break;
      case 'watch':
        window.location.href = '/live';
        break;
      case 'bet':
        window.location.href = '/betting';
        break;
      case 'claim':
        window.location.href = '/promotions';
        break;
    }
  }

  // Handle notification close
  private handleNotificationClose(data: any): void {
    console.log('Notification closed:', data);
  }

  // Share win on social media
  private shareWin(betData: any): void {
    if (navigator.share) {
      navigator.share({
        title: 'I just won on WeParlay!',
        text: `Just won $${betData.amount} on WeParlay! 🎉`,
        url: window.location.origin
      });
    }
  }

  // Check current permission status
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Utility function for push subscription
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get notification settings
  getSettings(): {
    permission: NotificationPermission;
    subscribed: boolean;
    supported: boolean;
  } {
    return {
      permission: this.permission,
      subscribed: this.subscriptions.size > 0,
      supported: 'Notification' in window && 'serviceWorker' in navigator
    };
  }

  // Unsubscribe from notifications
  async unsubscribe(): Promise<void> {
    for (const subscription of this.subscriptions.values()) {
      await subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }
}

export const pushNotifications = new PushNotificationManager();
