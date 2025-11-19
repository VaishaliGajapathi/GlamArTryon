import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkles, Image, Settings, CreditCard, Code, LogOut, BarChart3, ShoppingBag, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: 'Try-Ons', href: '/dashboard', icon: Image },
    { name: 'Integrations', href: '/integrations', icon: Code },
    { name: 'Plugin Demo', href: '/plugin-demo', icon: ShoppingBag },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 border-r bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">GlamAR</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 h-11 text-base ${
                      isActive ? 'bg-primary/10 text-primary border border-primary/20' : ''
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t bg-card">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="gradient-bg-primary text-white font-semibold">
                    {user?.username.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.credits} credits remaining
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-card/30 backdrop-blur-sm px-6 py-3 flex items-center justify-end">
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
