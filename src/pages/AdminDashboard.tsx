import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, CreditCard, Users, Activity, AlertTriangle, DollarSign,
  Search, Bell, Shield, Lock, Edit, Trash2, CheckCircle, XCircle, 
  AlertCircle, Sparkles, Zap, LineChart as LineChartIcon, Coins,
  ArrowLeft, BarChart3, Eye, UserCheck, Crown, Home
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

const CHART_COLORS = ['hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [platformUpdates, setPlatformUpdates] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0, activeSubscriptions: 0, freeUsers: 0,
    basicUsers: 0, proUsers: 0, businessUsers: 0, trialUsers: 0,
  });
  const [editForm, setEditForm] = useState({
    full_name: '', subscription_tier: '', subscription_status: '', account_type: '', role: 'user'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(); fetchSystemAlerts(); fetchSecurityEvents(); fetchActivityLogs(); fetchPlatformUpdates();
      const channel = supabase.channel('platform_updates_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_updates' }, () => fetchPlatformUpdates())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching users:', error); return; }
    const userData = data || [];
    setUsers(userData);
    const now = new Date();
    setStats({
      totalUsers: userData.length,
      activeSubscriptions: userData.filter(u => u.subscription_status === 'active').length,
      freeUsers: userData.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length,
      basicUsers: userData.filter(u => u.subscription_tier === 'personal_basic').length,
      proUsers: userData.filter(u => u.subscription_tier === 'personal_pro').length,
      businessUsers: userData.filter(u => u.subscription_tier === 'business').length,
      trialUsers: userData.filter(u => u.trial_end && new Date(u.trial_end) > now).length,
    });
  };

  const fetchSystemAlerts = async () => {
    const { data } = await supabase.from('system_alerts').select('*').order('created_at', { ascending: false }).limit(20);
    setSystemAlerts(data || []);
  };

  const fetchSecurityEvents = async () => {
    const { data } = await supabase.from('security_events').select('*').eq('resolved', false).order('created_at', { ascending: false }).limit(20);
    setSecurityEvents(data || []);
  };

  const fetchActivityLogs = async () => {
    const { data } = await supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    setActivityLogs(data || []);
  };

  const fetchPlatformUpdates = async () => {
    const { data } = await supabase.from('platform_updates').select('*').eq('is_published', true).order('release_date', { ascending: false }).limit(10);
    setPlatformUpdates(data || []);
  };

  const callAdminOperation = async (action: string, targetUserId: string | null, data?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ action, targetUserId, data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Operation failed');
    return result;
  };

  const handleEditUser = async (u: any) => {
    setSelectedUser(u);
    const { data: rolesData } = await supabase.from('user_roles').select('role').eq('user_id', u.user_id);
    const roles = rolesData?.map(r => r.role) || [];
    setSelectedUserRoles(roles);
    setEditForm({
      full_name: u.full_name || '', subscription_tier: u.subscription_tier || 'free',
      subscription_status: u.subscription_status || 'inactive', account_type: u.account_type || 'personal',
      role: roles.includes('admin') ? 'admin' : 'user'
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await callAdminOperation('updateUser', selectedUser.user_id, { ...editForm });
      toast({ title: "User Updated", description: "User information updated successfully." });
      setShowEditDialog(false); fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await callAdminOperation('deleteUser', selectedUser.user_id);
      toast({ title: "User Deleted", description: "User account has been permanently deleted." });
      setShowDeleteDialog(false); setSelectedUser(null); fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleResolveSecurityEvent = async (eventId: string) => {
    try {
      await callAdminOperation('resolveSecurityEvent', null, { eventId });
      toast({ title: "Event Resolved" }); fetchSecurityEvents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try { await callAdminOperation('dismissAlert', null, { alertId }); fetchSystemAlerts(); } catch {}
  };

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, string> = {
      low: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      high: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
      critical: 'bg-destructive/15 text-destructive border-destructive/30',
      info: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      warning: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      error: 'bg-destructive/15 text-destructive border-destructive/30',
    };
    return map[severity] || map.info;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = filterSubscription === 'all' || (filterSubscription === 'free' && (!u.subscription_tier || u.subscription_tier === 'free')) || u.subscription_tier === filterSubscription;
    return matchesSearch && matchesSub;
  });

  const tierBadge = (tier: string | null, trialEnd: string | null) => {
    if (trialEnd && new Date(trialEnd) > new Date() && (!tier || tier === 'free')) return <Badge className="bg-violet-500/15 text-violet-700 border-violet-500/30">Trial</Badge>;
    switch (tier) {
      case 'personal_basic': return <Badge className="bg-sky-500/15 text-sky-700 border-sky-500/30">Basic</Badge>;
      case 'personal_pro': return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Pro</Badge>;
      case 'business': return <Badge className="bg-orange-500/15 text-orange-700 border-orange-500/30">Business</Badge>;
      default: return <Badge variant="secondary">Free</Badge>;
    }
  };

  const pieData = [
    { name: 'Free', value: stats.freeUsers }, { name: 'Basic', value: stats.basicUsers },
    { name: 'Pro', value: stats.proUsers }, { name: 'Business', value: stats.businessUsers },
  ].filter(d => d.value > 0);

  const estimatedRevenue = (stats.basicUsers * 5) + (stats.proUsers * 10);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/dashboard"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {stats.totalUsers} users
            </Badge>
            {securityEvents.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {securityEvents.length} alerts
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Monthly Revenue', value: formatCurrency(estimatedRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Security Events', value: securityEvents.length, icon: Shield, color: securityEvents.length > 0 ? 'text-destructive' : 'text-emerald-600', bg: securityEvents.length > 0 ? 'bg-destructive/10' : 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tier Breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Free', count: stats.freeUsers, color: 'border-l-muted-foreground' },
            { label: 'Basic', count: stats.basicUsers, color: 'border-l-sky-500' },
            { label: 'Pro', count: stats.proUsers, color: 'border-l-emerald-500' },
            { label: 'Trial', count: stats.trialUsers, color: 'border-l-violet-500' },
          ].map((tier, i) => (
            <div key={i} className={`border-l-4 ${tier.color} bg-card rounded-lg px-4 py-3 shadow-sm`}>
              <p className="text-xs text-muted-foreground">{tier.label}</p>
              <p className="text-2xl font-bold">{tier.count}</p>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-5">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <Activity className="w-4 h-4" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <Bell className="w-4 h-4" /> Alerts
              {systemAlerts.filter(a => !a.is_dismissed).length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {systemAlerts.filter(a => !a.is_dismissed).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="updates" className="rounded-lg gap-1.5 data-[state=active]:shadow-sm">
              <Sparkles className="w-4 h-4" /> Updates
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-xl" />
              </div>
              <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="All plans" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="personal_basic">Basic</SelectItem>
                  <SelectItem value="personal_pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">{filteredUsers.length} results</Badge>
            </div>

            <Card className="border-0 shadow-md overflow-hidden">
              <ScrollArea className="max-h-[600px]">
                <div className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center font-semibold text-primary text-sm">
                          {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {tierBadge(u.subscription_tier, u.trial_end)}
                        <Badge variant={u.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {u.subscription_status || 'inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground w-24 text-right">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1.5 ml-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleEditUser(u)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => { setSelectedUser(u); setShowDeleteDialog(true); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No users found</div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="text-base">Subscription Distribution</CardTitle></CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center py-12 text-muted-foreground">No subscription data</p>}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {[
                      { label: 'Basic Plan', users: stats.basicUsers, price: 5, color: 'bg-sky-500' },
                      { label: 'Pro Plan', users: stats.proUsers, price: 10, color: 'bg-emerald-500' },
                    ].map((plan, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${plan.color}`} />
                            <span className="text-sm font-medium">{plan.label}</span>
                            <span className="text-xs text-muted-foreground">({plan.users} users)</span>
                          </div>
                          <span className="font-semibold">{formatCurrency(plan.users * plan.price)}/mo</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${plan.color} rounded-full transition-all`} style={{ width: `${estimatedRevenue > 0 ? (plan.users * plan.price / estimatedRevenue) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4 flex justify-between items-center">
                      <span className="font-medium">Total Monthly Revenue</span>
                      <span className="text-xl font-bold text-emerald-600">{formatCurrency(estimatedRevenue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Users by Plan</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { plan: 'Free', users: stats.freeUsers },
                      { plan: 'Basic', users: stats.basicUsers },
                      { plan: 'Pro', users: stats.proUsers },
                      { plan: 'Trial', users: stats.trialUsers },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="plan" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Unresolved Events</p>
                      <p className="text-xl font-bold">{securityEvents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed Logins</p>
                      <p className="text-xl font-bold">{securityEvents.filter(e => e.event_type === 'FAILED_LOGIN').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                      <p className="text-xl font-bold">{users.filter(u => u.subscription_status === 'active').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-base">Security Events</CardTitle></CardHeader>
              <CardContent>
                {securityEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                    <p className="font-medium text-emerald-600">All Clear!</p>
                    <p className="text-sm text-muted-foreground">No unresolved security events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {securityEvents.map((event) => (
                      <div key={event.id} className="flex items-start justify-between p-4 rounded-xl border bg-card">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                            <Badge className={`text-xs ${getSeverityBadge(event.severity)}`}>{event.severity}</Badge>
                          </div>
                          <p className="text-sm font-medium">{event.description}</p>
                          {event.ip_address && <p className="text-xs text-muted-foreground mt-1">IP: {event.ip_address}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(event.created_at).toLocaleString()}</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-4 rounded-lg" onClick={() => handleResolveSecurityEvent(event.id)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Admin Activity Log</CardTitle>
                <CardDescription>Complete audit trail of all administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  {activityLogs.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground">No activity logs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border-l-2 border-primary/20">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant="outline" className="text-xs">{log.action.replace(/_/g, ' ')}</Badge>
                            </div>
                            {log.details?.user_email && <p className="text-xs text-muted-foreground">Target: {log.details.user_email}</p>}
                            {log.details?.changes && <p className="text-xs text-muted-foreground">Changes: {Object.keys(log.details.changes).join(', ')}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                            {log.ip_address && <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-base">System Alerts</CardTitle></CardHeader>
              <CardContent>
                {systemAlerts.filter(a => !a.is_dismissed).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No active alerts</p>
                ) : (
                  <div className="space-y-3">
                    {systemAlerts.filter(a => !a.is_dismissed).map((alert) => (
                      <Alert key={alert.id} className={`${getSeverityBadge(alert.severity)} rounded-xl`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDismissAlert(alert.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Platform Updates</CardTitle>
                </div>
                <CardDescription>Latest features and improvements (auto-refreshes)</CardDescription>
              </CardHeader>
              <CardContent>
                {platformUpdates.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No updates yet</p>
                ) : (
                  <div className="space-y-6">
                    {platformUpdates.map((update, index) => {
                      const getBadgeStyle = (type: string) => {
                        switch (type) {
                          case 'NEW': return 'bg-primary text-primary-foreground';
                          case 'FEATURE': return 'bg-emerald-500 text-white';
                          case 'SECURITY': return 'bg-orange-500 text-white';
                          default: return '';
                        }
                      };
                      const features = update.features || [];
                      return (
                        <div key={update.id} className={`border-l-4 ${index === 0 ? 'border-primary' : 'border-muted'} pl-5 py-2`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getBadgeStyle(update.badge_type)} variant={update.badge_type === 'UPDATE' ? 'secondary' : undefined}>{update.badge_type}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(update.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{update.title}</h3>
                          {update.description && <p className="text-sm text-muted-foreground mb-3">{update.description}</p>}
                          {features.map((f: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{f.title}</p>
                                <p className="text-xs text-muted-foreground">{f.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Full Name</Label><Input value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="rounded-lg" /></div>
            <div><Label>Account Type</Label><Select value={editForm.account_type} onValueChange={(v) => setEditForm({...editForm, account_type: v})}><SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent></Select></div>
            <div><Label>Subscription Tier</Label><Select value={editForm.subscription_tier} onValueChange={(v) => setEditForm({...editForm, subscription_tier: v})}><SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="personal_basic">Basic</SelectItem><SelectItem value="personal_pro">Pro</SelectItem><SelectItem value="business">Business</SelectItem></SelectContent></Select></div>
            <div><Label>Status</Label><Select value={editForm.subscription_status} onValueChange={(v) => setEditForm({...editForm, subscription_status: v})}><SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
            <div><Label>Role</Label><Select value={editForm.role} onValueChange={(v) => setEditForm({...editForm, role: v})}><SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Warning:</strong> This will permanently delete the user and all their data.
              </AlertDescription>
            </Alert>
            {selectedUser && (
              <div className="mt-4 p-4 border rounded-xl bg-muted/30">
                <p className="text-sm"><strong>Name:</strong> {selectedUser.full_name || 'N/A'}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedUser.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;