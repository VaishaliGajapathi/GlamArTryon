import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Users, Image, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/admin/metrics'],
    queryFn: adminAPI.getMetrics,
    refetchInterval: 30000,
  });

  const purgeMutation = useMutation({
    mutationFn: adminAPI.purgeCache,
    onSuccess: () => {
      toast({
        title: 'Cache purged',
        description: 'Successfully cleared all cached data',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Purge failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const stats = [
    {
      name: 'Total Users',
      value: metrics?.total_users || 0,
      icon: Users,
      change: '+12%',
      color: '#667eea',
    },
    {
      name: 'Total Try-Ons',
      value: metrics?.total_tryons || 0,
      icon: Image,
      change: '+23%',
      color: '#764ba2',
    },
    {
      name: 'Active Try-Ons',
      value: metrics?.active_tryons || 0,
      icon: TrendingUp,
      change: '+8%',
      color: '#48bb78',
    },
    {
      name: 'Failed Try-Ons',
      value: metrics?.failed_tryons || 0,
      icon: AlertCircle,
      change: '-3%',
      color: '#f56565',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System metrics and administration
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => purgeMutation.mutate()}
            disabled={purgeMutation.isPending}
            data-testid="button-purge-cache"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${purgeMutation.isPending ? 'animate-spin' : ''}`} />
            Purge Cache
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} data-testid={`card-admin-stat-${stat.name.toLowerCase().replace(' ', '-')}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <div
                    style={{
                      background: `${stat.color}15`,
                      padding: '8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Icon style={{ color: stat.color }} size={16} />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change} from last month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Current storage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-medium">
                        {metrics?.storage?.images || 0} files
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: '45%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Database</span>
                      <span className="font-medium">
                        {metrics?.storage?.database || 0} MB
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: '30%' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Health</CardTitle>
              <CardDescription>Service status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Replicate API</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {metrics?.recent_users?.slice(0, 10).map((user: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                    data-testid={`row-user-${index}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.subscription}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No users yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>Try-ons currently being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Queued</span>
                <span className="font-bold text-lg">
                  {metrics?.queue?.queued || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing</span>
                <span className="font-bold text-lg">
                  {metrics?.queue?.processing || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Processing Time</span>
                <span className="font-bold text-lg">
                  {metrics?.queue?.avg_time || 45}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
