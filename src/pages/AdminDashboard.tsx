import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
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
  AlertCircle
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    subscription_tier: '',
    subscription_status: '',
    account_type: ''
  });

  // Check if user is admin
  const isAdmin = user?.email === 'legiox46@gmail.com' || profile?.email === 'legiox46@gmail.com';

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
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
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

  const handleEditUser = (selectedUserData: any) => {
    setSelectedUser(selectedUserData);
    setEditForm({
      full_name: selectedUserData.full_name || '',
      subscription_tier: selectedUserData.subscription_tier || 'free',
      subscription_status: selectedUserData.subscription_status || 'inactive',
      account_type: selectedUserData.account_type || 'personal'
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      await logActivity('UPDATE_USER', selectedUser.user_id, {
        changes: editForm,
        user_email: selectedUser.email
      });

      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });

      setShowEditDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user information.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.user_id);

      if (error) throw error;

      await logActivity('DELETE_USER', selectedUser.user_id, {
        user_email: selectedUser.email,
        user_name: selectedUser.full_name
      });

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
        description: "Failed to delete user account.",
        variant: "destructive",
      });
    }
  };

  const handleResolveSecurityEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Resolved",
        description: "Security event has been marked as resolved.",
      });

      fetchSecurityEvents();
    } catch (error) {
      console.error('Error resolving security event:', error);
      toast({
        title: "Error",
        description: "Failed to resolve security event.",
        variant: "destructive",
      });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;
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
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && user.account_type === filterType;
  });

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
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your business performance and users</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+201 since last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
                          <p className="font-medium">${transaction.amount}</p>
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
                <option value="all">All Types</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
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
                          {user.account_type}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.subscription_status || 'Free'}
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
                  <CardTitle>Monthly Report</CardTitle>
                  <CardDescription>Financial summary for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold">$15,231</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Subscriptions</span>
                      <span className="font-bold">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled Subscriptions</span>
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Growth</span>
                      <span className="font-bold text-green-600">+44</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Account types breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Personal', count: 32 },
                      { type: 'Business', count: 18 }
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
                    <SelectItem value="personal">Personal</SelectItem>
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