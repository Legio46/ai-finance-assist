import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
  TrendingUp, 
  CreditCard, 
  Users, 
  Activity, 
  AlertTriangle, 
  DollarSign,
  Search,
  Filter,
  Bell,
  FileText,
  Shield,
  Lock,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  LineChart as LineChartIcon,
  Coins
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const { t, formatCurrency } = useLanguage();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [platformUpdates, setPlatformUpdates] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    basicUsers: 0,
    proUsers: 0,
    businessUsers: 0,
    trialUsers: 0,
    personalAccounts: 0,
    businessAccounts: 0
  });
  const [editForm, setEditForm] = useState({
    full_name: '',
    subscription_tier: '',
    subscription_status: '',
    account_type: '',
    role: 'user'
  });

  // Mock data for revenue chart
  const revenueData = [
    { month: 'Jan', revenue: 4000, users: 240 },
    { month: 'Feb', revenue: 3000, users: 139 },
    { month: 'Mar', revenue: 2000, users: 980 },
    { month: 'Apr', revenue: 2780, users: 390 },
    { month: 'May', revenue: 1890, users: 480 },
    { month: 'Jun', revenue: 2390, users: 380 },
  ];

  // Mock transaction data
  const recentTransactions = [
    { id: 1, user: 'John Doe', amount: 29.99, plan: 'Personal', date: '2024-01-15' },
    { id: 2, user: 'Jane Smith', amount: 49.99, plan: 'Business', date: '2024-01-14' },
    { id: 3, user: 'Bob Johnson', amount: 29.99, plan: 'Personal', date: '2024-01-13' },
  ];

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchSystemAlerts();
      fetchSecurityEvents();
      fetchActivityLogs();
      fetchPlatformUpdates();

      // Subscribe to realtime updates for platform_updates
      const channel = supabase
        .channel('platform_updates_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'platform_updates' },
          () => {
            fetchPlatformUpdates();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const userData = data || [];
      setUsers(userData);
      
      // Calculate stats
      const now = new Date();
      const activeSubscriptions = userData.filter(u => u.subscription_status === 'active').length;
      const freeUsers = userData.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length;
      const basicUsers = userData.filter(u => u.subscription_tier === 'personal_basic').length;
      const proUsers = userData.filter(u => u.subscription_tier === 'personal_pro').length;
      const businessUsers = userData.filter(u => u.subscription_tier === 'business').length;
      const trialUsers = userData.filter(u => u.trial_end && new Date(u.trial_end) > now).length;
      const personalAccounts = userData.filter(u => u.account_type === 'personal').length;
      const businessAccounts = userData.filter(u => u.account_type === 'business').length;
      
      setStats({
        totalUsers: userData.length,
        activeSubscriptions,
        freeUsers,
        basicUsers,
        proUsers,
        businessUsers,
        trialUsers,
        personalAccounts,
        businessAccounts
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setSystemAlerts(data || []);
    } catch (error) {
      console.error('Error fetching system alerts:', error);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchPlatformUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_updates')
        .select('*')
        .eq('is_published', true)
        .order('release_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setPlatformUpdates(data || []);
    } catch (error) {
      console.error('Error fetching platform updates:', error);
    }
  };

  const logActivity = async (action: string, targetUserId: string | null, details: any) => {
    try {
      await supabase
        .from('admin_activity_logs')
        .insert([{
          admin_user_id: user.id,
          action,
          target_user_id: targetUserId,
          details
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleEditUser = async (selectedUserData: any) => {
    setSelectedUser(selectedUserData);
    
    // Fetch user roles
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', selectedUserData.user_id);
      
      if (!error && rolesData) {
        setSelectedUserRoles(rolesData.map(r => r.role));
        setEditForm({
          full_name: selectedUserData.full_name || '',
          subscription_tier: selectedUserData.subscription_tier || 'free',
          subscription_status: selectedUserData.subscription_status || 'inactive',
          account_type: selectedUserData.account_type || 'personal',
          role: rolesData.find(r => r.role === 'admin') ? 'admin' : 'user'
        });
      } else {
        setSelectedUserRoles([]);
        setEditForm({
          full_name: selectedUserData.full_name || '',
          subscription_tier: selectedUserData.subscription_tier || 'free',
          subscription_status: selectedUserData.subscription_status || 'inactive',
          account_type: selectedUserData.account_type || 'personal',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setSelectedUserRoles([]);
      setEditForm({
        full_name: selectedUserData.full_name || '',
        subscription_tier: selectedUserData.subscription_tier || 'free',
        subscription_status: selectedUserData.subscription_status || 'inactive',
        account_type: selectedUserData.account_type || 'personal',
        role: 'user'
      });
    }
    
    setShowEditDialog(true);
  };

  const callAdminOperation = async (action: string, targetUserId: string | null, data?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, targetUserId, data }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Operation failed');
    }
    return result;
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await callAdminOperation('updateUser', selectedUser.user_id, {
        full_name: editForm.full_name,
        subscription_tier: editForm.subscription_tier,
        subscription_status: editForm.subscription_status,
        account_type: editForm.account_type,
        role: editForm.role,
      });

      toast({
        title: "User Updated",
        description: "User information and role have been updated successfully.",
      });

      setShowEditDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user information.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await callAdminOperation('deleteUser', selectedUser.user_id);

      toast({
        title: "User Deleted",
        description: "User account has been permanently deleted.",
      });

      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user account.",
        variant: "destructive",
      });
    }
  };

  const handleResolveSecurityEvent = async (eventId: string) => {
    try {
      await callAdminOperation('resolveSecurityEvent', null, { eventId });

      toast({
        title: "Event Resolved",
        description: "Security event has been marked as resolved.",
      });

      fetchSecurityEvents();
    } catch (error) {
      console.error('Error resolving security event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resolve security event.",
        variant: "destructive",
      });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await callAdminOperation('dismissAlert', null, { alertId });
      fetchSystemAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      error: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[severity] || colors.info;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.account_type === filterType;
    const matchesSubscription = filterSubscription === 'all' || 
      (filterSubscription === 'free' && (!user.subscription_tier || user.subscription_tier === 'free')) ||
      user.subscription_tier === filterSubscription;
    
    return matchesSearch && matchesType && matchesSubscription;
  });

  const getSubscriptionBadge = (tier: string | null, status: string | null, trialEnd: string | null) => {
    const isTrialActive = trialEnd && new Date(trialEnd) > new Date();
    
    if (isTrialActive && (!tier || tier === 'free')) {
      return <Badge className="bg-purple-500">Trial</Badge>;
    }
    
    switch (tier) {
      case 'personal_basic':
        return <Badge className="bg-blue-500">Basic</Badge>;
      case 'personal_pro':
        return <Badge className="bg-green-500">Pro</Badge>;
      case 'business':
        return <Badge className="bg-orange-500">Business</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  // Show loading while checking admin status
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

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('adminDashboard')}</h1>
            <p className="text-muted-foreground">Manage your business performance and users</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Paying customers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trialUsers}</div>
              <p className="text-xs text-muted-foreground">Active trials</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.freeUsers}</div>
              <p className="text-xs text-muted-foreground">No subscription</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Basic Plan</p>
                  <p className="text-2xl font-bold">{stats.basicUsers}</p>
                </div>
                <Badge className="bg-blue-500">{formatCurrency(5)}/mo</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Pro Plan</p>
                  <p className="text-2xl font-bold">{stats.proUsers}</p>
                </div>
                <Badge className="bg-green-500">{formatCurrency(10)}/mo</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Business Plan</p>
                  <p className="text-2xl font-bold">{stats.businessUsers}</p>
                </div>
                <Badge variant="outline" className="text-orange-500">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Types</p>
                  <p className="text-sm">Personal: {stats.personalAccounts} | Business: {stats.businessAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="whats-new" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              What's New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue and user growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payments and subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{transaction.user}</p>
                          <p className="text-sm text-muted-foreground">{transaction.plan} Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Account Types</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
              <select
                value={filterSubscription}
                onChange={(e) => setFilterSubscription(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Subscriptions</option>
                <option value="free">Free</option>
                <option value="personal_basic">Basic</option>
                <option value="personal_pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>{t('userManagement')}</CardTitle>
                <CardDescription>Manage registered users and their accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={user.account_type === 'business' ? 'default' : 'secondary'}>
                          {user.account_type || 'personal'}
                        </Badge>
                        {getSubscriptionBadge(user.subscription_tier, user.subscription_status, user.trial_end)}
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.subscription_status === 'active' ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{securityEvents.length}</div>
                  <p className="text-xs text-muted-foreground">Unresolved incidents</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {securityEvents.filter(e => e.event_type === 'FAILED_LOGIN').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Potential security risks</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter(u => u.subscription_status === 'active').length}</div>
                  <p className="text-xs text-muted-foreground">Currently logged in</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>All security-related incidents and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-lg font-medium text-green-600">All Clear!</p>
                      <p className="text-muted-foreground">No security events detected</p>
                    </div>
                  ) : (
                    securityEvents.map((event) => (
                      <div key={event.id} className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <Badge className={getSeverityColor(event.severity)}>{event.severity.toUpperCase()}</Badge>
                            </div>
                            <p className="font-medium mb-1">{event.description}</p>
                            {event.ip_address && (
                              <p className="text-sm text-muted-foreground">IP Address: {event.ip_address}</p>
                            )}
                            {event.metadata && (
                              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleResolveSecurityEvent(event.id)}
                            className="ml-4"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admin Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity History</CardTitle>
                <CardDescription>Complete audit trail of administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activityLogs.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No activity logs available</p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-start p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                          </div>
                          {log.details?.user_email && (
                            <p className="text-sm text-muted-foreground">
                              Target: {log.details.user_email}
                            </p>
                          )}
                          {log.details?.changes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Changes: {Object.keys(log.details.changes).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.ip_address && (
                            <p className="text-xs text-muted-foreground">
                              IP: {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All payments and subscription activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.user}</p>
                          <p className="text-sm text-muted-foreground">{transaction.plan} Plan Subscription</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${transaction.amount}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Summary</CardTitle>
                  <CardDescription>Current user statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-bold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Subscriptions</span>
                      <span className="font-bold">{stats.activeSubscriptions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Trials</span>
                      <span className="font-bold">{stats.trialUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free Users</span>
                      <span className="font-bold">{stats.freeUsers}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span>Estimated Monthly Revenue</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency((stats.basicUsers * 8) + (stats.proUsers * 10))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>Users by subscription tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Free', count: stats.freeUsers },
                      { type: 'Basic', count: stats.basicUsers },
                      { type: 'Pro', count: stats.proUsers },
                      { type: 'Business', count: stats.businessUsers }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Types</CardTitle>
                  <CardDescription>Personal vs Business accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Personal', count: stats.personalAccounts },
                      { type: 'Business', count: stats.businessAccounts }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--accent-foreground))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>Estimated monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Basic ({stats.basicUsers} users)</span>
                      </div>
                      <span className="font-bold">{formatCurrency(stats.basicUsers * 8)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Pro ({stats.proUsers} users)</span>
                      </div>
                      <span className="font-bold">{formatCurrency(stats.proUsers * 10)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Business ({stats.businessUsers} users)</span>
                      </div>
                      <span className="font-bold text-muted-foreground">TBA</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-medium">Total Estimated</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatCurrency((stats.basicUsers * 8) + (stats.proUsers * 10))}/mo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>Critical system notifications and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.filter(a => !a.is_dismissed).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No active alerts</p>
                  ) : (
                    systemAlerts.filter(a => !a.is_dismissed).map((alert) => (
                      <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Events
                </CardTitle>
                <CardDescription>Unresolved security incidents requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No security events</p>
                  ) : (
                    securityEvents.map((event) => (
                      <div key={event.id} className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{event.event_type}</Badge>
                              <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                            </div>
                            <p className="font-medium">{event.description}</p>
                            {event.ip_address && (
                              <p className="text-sm text-muted-foreground mt-1">IP: {event.ip_address}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleResolveSecurityEvent(event.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Admin Activity Logs
                </CardTitle>
                <CardDescription>Recent administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activityLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No activity logs</p>
                  ) : (
                    activityLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.details?.user_email || 'System action'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whats-new" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>What's New</CardTitle>
                </div>
                <CardDescription>Latest features and improvements to the platform (auto-refreshes)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {platformUpdates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No updates yet</p>
                ) : (
                  platformUpdates.map((update, index) => {
                    const IconMap: Record<string, any> = {
                      TrendingUp,
                      Coins,
                      LineChart: LineChartIcon,
                      Shield,
                      Lock,
                      Zap,
                      Activity,
                      Sparkles,
                    };
                    
                    const getBadgeStyle = (badgeType: string) => {
                      switch (badgeType) {
                        case 'NEW':
                          return 'bg-gradient-primary text-white';
                        case 'FEATURE':
                          return 'bg-green-500 text-white';
                        case 'SECURITY':
                          return 'bg-orange-500 text-white';
                        default:
                          return '';
                      }
                    };

                    const features = update.features || [];
                    const releaseDate = new Date(update.release_date);
                    const formattedDate = releaseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                    return (
                      <div 
                        key={update.id} 
                        className={`border-l-4 ${index === 0 ? 'border-primary' : 'border-muted'} pl-4 py-2`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getBadgeStyle(update.badge_type)} variant={update.badge_type === 'UPDATE' ? 'secondary' : undefined}>
                            {update.badge_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formattedDate}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                        {update.description && (
                          <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                        )}
                        <div className="space-y-3">
                          {features.map((feature: any, featureIndex: number) => {
                            const IconComponent = IconMap[feature.icon] || Sparkles;
                            return (
                              <div key={featureIndex} className="flex items-start gap-3">
                                <IconComponent className={`h-5 w-5 ${index === 0 ? 'text-primary' : 'text-muted-foreground'} mt-0.5`} />
                                <div>
                                  <p className="font-medium">{feature.title}</p>
                                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and subscription details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select value={editForm.account_type} onValueChange={(value) => setEditForm({...editForm, account_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subscription_tier">Subscription Tier</Label>
                <Select value={editForm.subscription_tier} onValueChange={(value) => setEditForm({...editForm, subscription_tier: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="personal_basic">Personal Basic</SelectItem>
                    <SelectItem value="personal_pro">Personal Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subscription_status">Subscription Status</Label>
                <Select value={editForm.subscription_status} onValueChange={(value) => setEditForm({...editForm, subscription_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">User Role</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert className="bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <strong>Warning:</strong> This will permanently delete the user account and all associated data.
                </AlertDescription>
              </Alert>
              {selectedUser && (
                <div className="mt-4 p-4 border rounded-lg">
                  <p><strong>Name:</strong> {selectedUser.full_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Account Type:</strong> {selectedUser.account_type}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;