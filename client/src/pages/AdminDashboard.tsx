import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Search, Download, MoreHorizontal, Check, Ban, DollarSign, User, UserCheck, Lock, Eye, EyeOff, Filter } from "lucide-react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Mock data for demonstration - in a real app, this would come from your backend
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: false, // Disabled since we're using mock data for now
  });

  // Sample financial data
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['/api/admin/financial-summary'],
    enabled: false, // Disabled since we're using mock data for now
  });

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      joined: '2023-01-15',
      status: 'active',
      balance: 1245.50,
      bets: 45,
      wins: 23,
      profileImage: '',
      lastLogin: '2023-05-16T14:30:00Z',
      verificationLevel: 'verified'
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      joined: '2023-02-22',
      status: 'active',
      balance: 875.25,
      bets: 32,
      wins: 15,
      profileImage: '',
      lastLogin: '2023-05-15T09:45:00Z',
      verificationLevel: 'verified'
    },
    {
      id: '3',
      username: 'bob_wilson',
      email: 'bob@example.com',
      joined: '2023-03-10',
      status: 'suspended',
      balance: 50.00,
      bets: 8,
      wins: 2,
      profileImage: '',
      lastLogin: '2023-04-20T16:20:00Z',
      verificationLevel: 'unverified'
    },
    {
      id: '4',
      username: 'alice_johnson',
      email: 'alice@example.com',
      joined: '2023-03-18',
      status: 'active',
      balance: 2150.75,
      bets: 67,
      wins: 41,
      profileImage: '',
      lastLogin: '2023-05-16T11:15:00Z',
      verificationLevel: 'verified'
    },
    {
      id: '5',
      username: 'charlie_brown',
      email: 'charlie@example.com',
      joined: '2023-04-05',
      status: 'inactive',
      balance: 125.30,
      bets: 12,
      wins: 5,
      profileImage: '',
      lastLogin: '2023-04-28T13:40:00Z',
      verificationLevel: 'unverified'
    },
  ];

  // Mock financial data
  const mockFinancialData = {
    totalRevenue: 125750.45,
    netProfit: 75250.30,
    pendingPayouts: 12500.75,
    recentTransactions: [
      { id: 'tx1', userId: '1', username: 'john_doe', type: 'deposit', amount: 500.00, status: 'completed', date: '2023-05-16T10:30:00Z' },
      { id: 'tx2', userId: '4', username: 'alice_johnson', type: 'withdrawal', amount: 1200.00, status: 'pending', date: '2023-05-16T09:45:00Z' },
      { id: 'tx3', userId: '2', username: 'jane_smith', type: 'deposit', amount: 250.00, status: 'completed', date: '2023-05-15T16:20:00Z' },
      { id: 'tx4', userId: '5', username: 'charlie_brown', type: 'deposit', amount: 100.00, status: 'completed', date: '2023-05-15T14:10:00Z' },
      { id: 'tx5', userId: '3', username: 'bob_wilson', type: 'withdrawal', amount: 75.00, status: 'failed', date: '2023-05-14T11:30:00Z' },
    ],
    paymentMethods: [
      { method: 'Credit Card', count: 145, volume: 45750.25 },
      { method: 'PayPal', count: 87, volume: 31250.50 },
      { method: 'Crypto', count: 63, volume: 48750.70 },
    ]
  };

  // Filter users based on search term and status filter
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === null || user.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Format balance as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage users, view financial data, and control platform settings</p>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>User Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                  All
                  {filterStatus === null && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                  {filterStatus === 'active' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
                  Suspended
                  {filterStatus === 'suspended' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                  Inactive
                  {filterStatus === 'inactive' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" className="ml-2">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Bets/Wins</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.status === 'active' ? 'default' : 
                          user.status === 'suspended' ? 'destructive' : 
                          'secondary'
                        }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(user.balance)}</TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>{user.bets}/{user.wins}</TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Payment History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              {user.status === 'active' ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Privacy Settings Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">User Privacy Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Privacy Control Center</CardTitle>
                <CardDescription>Manage what information users can see about each other</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Public Profiles</h3>
                      <p className="text-sm text-muted-foreground">Allow users to see other users' profiles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Limited View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Betting History</h3>
                      <p className="text-sm text-muted-foreground">Allow users to see other users' betting history</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Public
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Win Statistics</h3>
                      <p className="text-sm text-muted-foreground">Allow users to see other users' win statistics</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Public
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">League Rankings</h3>
                      <p className="text-sm text-muted-foreground">Show users' positions in competitive leagues</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <EyeOff className="h-4 w-4" />
                        Private
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Public
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Save Privacy Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Financial Tab */}
        <TabsContent value="financial">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.totalRevenue)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.netProfit)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.pendingPayouts)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFinancialData.recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.username}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(tx.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            tx.status === 'completed' ? 'default' : 
                            tx.status === 'pending' ? 'outline' : 
                            'destructive'
                          }>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(tx.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFinancialData.paymentMethods.map((method, index) => (
                      <TableRow key={index}>
                        <TableCell>{method.method}</TableCell>
                        <TableCell>{method.count}</TableCell>
                        <TableCell>{formatCurrency(method.volume)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Settings Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Payment Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Information</CardTitle>
                <CardDescription>Configure where your business revenues are sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Primary Bank Account</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="font-medium">WeParlay Business Account</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="font-medium">First National Bank</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-medium">•••• •••• •••• 4587</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Routing Number</p>
                          <p className="font-medium">•••• •••• 7</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge>Default Account</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Automatic Transfers</h3>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">Daily</Button>
                      <Button variant="default" size="sm">Weekly</Button>
                      <Button variant="outline" size="sm">Monthly</Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Funds are automatically transferred to your bank account every Sunday.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Minimum Transfer Amount</h3>
                    <div className="flex items-center">
                      <Input 
                        type="number" 
                        defaultValue="1000" 
                        className="max-w-xs"
                      />
                      <Button className="ml-2">Update</Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Automatic transfers will only occur when your balance exceeds this amount.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button>Add Bank Account</Button>
                  <Button variant="outline">View Transfer History</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Platform Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Manage global settings for the WeParlay platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">User Registration</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="default" size="sm">Open</Button>
                    <Button variant="outline" size="sm">Invite Only</Button>
                    <Button variant="outline" size="sm">Closed</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Required Verification Level</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">None</Button>
                    <Button variant="default" size="sm">Email</Button>
                    <Button variant="outline" size="sm">ID Verification</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Platform Commission</h3>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      defaultValue="5" 
                      className="max-w-xs"
                    />
                    <span className="ml-2">%</span>
                    <Button className="ml-2">Update</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Percentage fee taken from each betting transaction.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Minimum Betting Amount</h3>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      defaultValue="5" 
                      className="max-w-xs"
                    />
                    <Button className="ml-2">Update</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Maximum Withdrawal Limits</h3>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      defaultValue="10000" 
                      className="max-w-xs"
                    />
                    <Button className="ml-2">Update</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Maximum amount a user can withdraw per day.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button>Save All Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}