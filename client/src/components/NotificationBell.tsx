import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Bell as BellIcon, Package, AlertCircle, CheckCircle, Info } from "lucide-react";

interface Notification {
  notifId: number;
  userId: string | null;
  message: string;
  type: 'update' | 'plan' | 'expiry' | 'renewal' | null;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons = {
  update: Info,
  plan: Package,
  expiry: AlertCircle,
  renewal: CheckCircle,
};

export default function NotificationBell() {
  const { toast } = useToast();
  const prevUnreadCountRef = useRef<number | null>(null);
  const lastToastNotifIdRef = useRef<number>(0);

  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000,
  });

  const unreadCount = unreadCountData?.count ?? 0;

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=5', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (prevUnreadCountRef.current === null) {
      prevUnreadCountRef.current = unreadCount;
      if (notifications.length > 0) {
        lastToastNotifIdRef.current = Math.max(...notifications.map(n => n.notifId));
      }
      return;
    }

    if (unreadCount > prevUnreadCountRef.current) {
      const highPriorityNotifications = notifications.filter(
        n => !n.isRead && 
        (n.type === 'expiry' || n.type === 'renewal') &&
        n.notifId > lastToastNotifIdRef.current
      );
      
      if (highPriorityNotifications.length > 0) {
        const notification = highPriorityNotifications[0];
        toast({
          title: "New Notification",
          description: notification.message,
          variant: notification.type === 'expiry' ? 'destructive' : 'default',
        });
        lastToastNotifIdRef.current = Math.max(lastToastNotifIdRef.current, notification.notifId);
      }
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, notifications, toast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notifId: number) => {
      return apiRequest('PATCH', `/api/notifications/${notifId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notifId: number) => {
      return apiRequest('DELETE', `/api/notifications/${notifId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              data-testid="button-mark-all-read"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notification.type ? notificationIcons[notification.type] : BellIcon;
                return (
                  <div
                    key={notification.notifId}
                    className={`px-4 py-3 hover-elevate cursor-pointer ${
                      !notification.isRead ? 'bg-accent/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsReadMutation.mutate(notification.notifId);
                      }
                    }}
                    data-testid={`notification-item-${notification.notifId}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary" data-testid={`unread-indicator-${notification.notifId}`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-3">
            <a
              href="/notifications"
              className="text-sm text-primary hover:underline"
              data-testid="link-view-all"
            >
              View all notifications
            </a>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
