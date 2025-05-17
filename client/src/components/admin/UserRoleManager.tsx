import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserCheck, UserMinus, Shield, ShieldAlert, User } from "lucide-react";

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
        <div className="flex mb-4">
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
          <Button onClick={handleSearch} className="ml-2">Search</Button>
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
            {users.map((user) => (
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
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleExpandPermissions(user.id)}
                      >
                        Permissions
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.ADMIN)}>
                            <Shield className="h-4 w-4 mr-2 text-red-500" />
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.MODERATOR)}>
                            <ShieldAlert className="h-4 w-4 mr-2 text-blue-500" />
                            Moderator
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.STAFF)}>
                            <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                            Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateUserRole(user.id, PERMISSION_LEVELS.USER)}>
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            Regular User
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