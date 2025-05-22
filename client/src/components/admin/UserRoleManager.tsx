import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Search, MoreHorizontal, UserCheck, UserMinus, Shield, 
  ShieldAlert, User, DollarSign, BarChart2, Clock, AlertCircle, 
  UserX, UserCog, Eye, Lock, Wallet, Ban
} from "lucide-react";

// Define the permission levels and their display names
const PERMISSION_LEVELS = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STAFF: 'staff',
  USER: 'user',
  GUEST: 'guest'
};

// Define what each role can access
const ROLE_PERMISSIONS = {
  [PERMISSION_LEVELS.ADMIN]: {
    canViewAdminDashboard: true,
    canManageUsers: true,
    canManageBets: true,
    canEditSettings: true,
    canAccessFinancial: true,
    canViewUserData: true,
    canUpdatePlatform: true,
    canManageRoles: true,
    canDeleteData: true,
  },
  [PERMISSION_LEVELS.MODERATOR]: {
    canViewAdminDashboard: true,
    canManageUsers: true,
    canManageBets: true,
    canEditSettings: false,
    canAccessFinancial: false,
    canViewUserData: true,
    canUpdatePlatform: false,
    canManageRoles: false,
    canDeleteData: false,
  },
  [PERMISSION_LEVELS.STAFF]: {
    canViewAdminDashboard: true,
    canManageUsers: false,
    canManageBets: true,
    canEditSettings: false,
    canAccessFinancial: false,
    canViewUserData: true,
    canUpdatePlatform: false,
    canManageRoles: false,
    canDeleteData: false,
  },
  [PERMISSION_LEVELS.USER]: {
    canViewAdminDashboard: false,
    canManageUsers: false,
    canManageBets: false,
    canEditSettings: false,
    canAccessFinancial: false,
    canViewUserData: false,
    canUpdatePlatform: false,
    canManageRoles: false,
    canDeleteData: false,
  },
  [PERMISSION_LEVELS.GUEST]: {
    canViewAdminDashboard: false,
    canManageUsers: false,
    canManageBets: false,
    canEditSettings: false,
    canAccessFinancial: false,
    canViewUserData: false,
    canUpdatePlatform: false,
    canManageRoles: false,
    canDeleteData: false,
  },
};

interface UserRoleData {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
}

interface UserRoleManagerProps {
  users: UserRoleData[];
  onUpdateUserRole: (userId: string, newRole: string) => void;
  onSearchUsers: (searchTerm: string) => void;
}

export default function UserRoleManager({ users, onUpdateUserRole, onSearchUsers }: UserRoleManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPermissions, setExpandedPermissions] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRoleData | null>(null);
  const [activeTab, setActiveTab] = useState("permissions");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  const handleSearch = () => {
    onSearchUsers(searchTerm);
  };
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case PERMISSION_LEVELS.ADMIN:
        return 'destructive';
      case PERMISSION_LEVELS.MODERATOR:
        return 'default';
      case PERMISSION_LEVELS.STAFF:
        return 'secondary';
      case PERMISSION_LEVELS.USER:
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const toggleExpandPermissions = (userId: string) => {
    if (expandedPermissions === userId) {
      setExpandedPermissions(null);
    } else {
      setExpandedPermissions(userId);
    }
  };
  
  const renderRoleIcon = (role: string) => {
    switch (role) {
      case PERMISSION_LEVELS.ADMIN:
        return <Shield className="h-4 w-4 text-red-500" />;
      case PERMISSION_LEVELS.MODERATOR:
        return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      case PERMISSION_LEVELS.STAFF:
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus(null)}
            >
              All
            </Button>
            <Button 
              variant={filterStatus === 'active' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Active
            </Button>
            <Button 
              variant={filterStatus === 'inactive' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('inactive')}
              className="flex items-center gap-1"
            >
              <UserX className="h-4 w-4" />
              Inactive
            </Button>
            <Button 
              variant={filterStatus === 'suspended' ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterStatus('suspended')}
              className="flex items-center gap-1"
            >
              <Ban className="h-4 w-4" />
              Suspended
            </Button>
          </div>
          <Button onClick={handleSearch} className="flex-shrink-0">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter(user => filterStatus === null || user.status === filterStatus)
              .map((user) => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {renderRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.status === 'active' 
                          ? 'default' 
                          : user.status === 'suspended' 
                            ? 'destructive' 
                            : 'secondary'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewingUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {renderRoleIcon(user.role)}
                              User Profile: {user.username}
                            </DialogTitle>
                            <DialogDescription>
                              Manage this user's roles, permissions, and account status
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                            <TabsList className="grid grid-cols-3 mb-4">
                              <TabsTrigger value="permissions" className="flex items-center gap-1">
                                <Lock className="h-4 w-4" />
                                Permissions
                              </TabsTrigger>
                              <TabsTrigger value="activity" className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Activity
                              </TabsTrigger>
                              <TabsTrigger value="financial" className="flex items-center gap-1">
                                <Wallet className="h-4 w-4" />
                                Financial
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="permissions">
                              <div className="mb-4">
                                <h4 className="font-medium mb-2">Account Status</h4>
                                <div className="flex gap-2">
                                  <Button 
                                    variant={user.status === 'active' ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, 'active')}
                                    className="flex items-center gap-1"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                    Active
                                  </Button>
                                  <Button 
                                    variant={user.status === 'inactive' ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, 'inactive')}
                                    className="flex items-center gap-1"
                                  >
                                    <UserX className="h-4 w-4" />
                                    Inactive
                                  </Button>
                                  <Button 
                                    variant={user.status === 'suspended' ? "destructive" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, 'suspended')}
                                    className="flex items-center gap-1"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Suspended
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="font-medium mb-2">User Role</h4>
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant={user.role === 'admin' ? "destructive" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.ADMIN)}
                                    className="flex items-center gap-1"
                                  >
                                    <Shield className="h-4 w-4" />
                                    Admin
                                  </Button>
                                  <Button 
                                    variant={user.role === 'moderator' ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.MODERATOR)}
                                    className="flex items-center gap-1"
                                  >
                                    <ShieldAlert className="h-4 w-4" />
                                    Moderator
                                  </Button>
                                  <Button 
                                    variant={user.role === 'staff' ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.STAFF)}
                                    className="flex items-center gap-1"
                                  >
                                    <UserCog className="h-4 w-4" />
                                    Staff
                                  </Button>
                                  <Button 
                                    variant={user.role === 'user' ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.USER)}
                                    className="flex items-center gap-1"
                                  >
                                    <User className="h-4 w-4" />
                                    Regular User
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="bg-muted p-4 rounded-md mt-4">
                                <h4 className="font-medium mb-2">Permissions for {user.role} role:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {Object.entries(ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || {}).map(([permission, allowed]) => (
                                    <div key={permission} className="flex items-center justify-between">
                                      <span className="text-sm">{permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                      <Switch checked={allowed} disabled />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="activity">
                              <div className="space-y-4">
                                <div className="border rounded-md p-4">
                                  <h4 className="font-medium mb-2">Last Activities</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Last Login</span>
                                      <span className="font-medium">{new Date(user.lastLogin).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Last Bet Placed</span>
                                      <span className="font-medium">May 19, 2025 at 3:45 PM</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Last Deposit</span>
                                      <span className="font-medium">May 15, 2025 at 11:20 AM</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Last Withdrawal</span>
                                      <span className="font-medium">May 10, 2025 at 5:30 PM</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-4">
                                  <h4 className="font-medium mb-2">Login History</h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>May 20, 2025 at 9:30 AM</span>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        Success
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>May 18, 2025 at 2:15 PM</span>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        Success
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>May 16, 2025 at 7:05 PM</span>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                        Failed
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span>May 15, 2025 at 11:40 AM</span>
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        Success
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="financial">
                              <div className="space-y-4">
                                <div className="border rounded-md p-4">
                                  <h4 className="font-medium mb-2">Account Balance</h4>
                                  <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">WeParlay Cash</div>
                                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">$1,500.00</div>
                                    </div>
                                    <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Real Cash</div>
                                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$250.00</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border rounded-md p-4">
                                  <h4 className="font-medium mb-2">Transaction Summary</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Deposits</div>
                                      <div className="text-lg font-bold">$820.00</div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawals</div>
                                      <div className="text-lg font-bold">$570.00</div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Net Cash Flow</div>
                                      <div className="text-lg font-bold text-green-600 dark:text-green-400">+$250.00</div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Bets</div>
                                      <div className="text-lg font-bold">124</div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
                                      <div className="text-lg font-bold">43%</div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md">
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Largest Win</div>
                                      <div className="text-lg font-bold">$125.00</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                          
                          <DialogFooter>
                            <Button variant="outline" size="sm">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Send Warning
                            </Button>
                            <Button>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.ADMIN)}>
                            <Shield className="h-4 w-4 mr-2 text-red-500" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, user.status === 'active' ? 'inactive' : 'active')}>
                            {user.status === 'active' ? (
                              <>
                                <UserX className="h-4 w-4 mr-2 text-gray-500" />
                                Deactivate Account
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                                Activate Account
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleExpandPermissions(user.id)}>
                            <Lock className="h-4 w-4 mr-2" />
                            View Permissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedPermissions === user.id && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="bg-muted p-3 rounded-md mt-2">
                        <h4 className="font-medium mb-2">Permissions for {user.role} role:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || {}).map(([permission, allowed]) => (
                            <div key={permission} className="flex items-center justify-between">
                              <span className="text-sm">{permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                              <Switch checked={allowed} disabled />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}