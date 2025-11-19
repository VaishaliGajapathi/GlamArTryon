import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Package, AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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

const notificationColors = {
  update: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  plan: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  expiry: 'bg-red-500/10 text-red-600 dark:text-red-400',
  renewal: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', filter],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=100', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      if (filter === 'unread') {
        return data.filter((n: Notification) => !n.isRead);
      }
      return data;
    },
  });

  const { data: unreadCount = 0 } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with your account activity and platform updates
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="w-auto">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" data-testid="tab-unread">
              Unread
              {typeof unreadCount === 'number' && unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {typeof unreadCount === 'number' && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-no-notifications">
                {filter === 'unread' 
                  ? "You're all caught up!"
                  : "You'll see notifications here when you have updates"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.type ? notificationIcons[notification.type] : Bell;
            const colorClass = notification.type ? notificationColors[notification.type] : 'bg-gray-500/10 text-gray-600 dark:text-gray-400';

            return (
              <Card
                key={notification.notifId}
                className={`${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
                data-testid={`notification-card-${notification.notifId}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colorClass} flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {notification.type && (
                            <Badge variant="secondary" className="capitalize">
                              {notification.type}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="default" className="shrink-0">Unread</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm mb-3">{notification.message}</p>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.notifId)}
                            disabled={markAsReadMutation.isPending}
                            data-testid={`button-mark-read-${notification.notifId}`}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate(notification.notifId)}
                          disabled={deleteNotificationMutation.isPending}
                          data-testid={`button-delete-${notification.notifId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
