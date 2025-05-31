import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Edit, Ban, DollarSign, Crown, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  weparlayCash: number;
  tier: string;
  status: string;
  createdAt: string;
  totalBets: number;
  totalWins: number;
}

export default function ManageUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/users");
        return response as User[];
      } catch (err) {
        console.warn("Failed to fetch users, using fallback data:", err);
        // Return mock data for development
        return [
          {
            id: "admin-1",
            username: "WeParlay_Admin",
            email: "admin@weparlay.io",
            balance: 50000,
            weparlayCash: 100000,
            tier: "platinum",
            status: "active",
            createdAt: new Date().toISOString(),
            totalBets: 1250,
            totalWins: 750
          },
          {
            id: "user-1",
            username: "SportsBetter123",
            email: "user@example.com",
            balance: 1500,
            weparlayCash: 5000,
            tier: "gold",
            status: "active",
            createdAt: new Date().toISOString(),
            totalBets: 45,
            totalWins: 23
          },
          {
            id: "user-2",
            username: "CasinoKing",
            email: "king@example.com",
            balance: 750,
            weparlayCash: 2500,
            tier: "silver",
            status: "suspended",
            createdAt: new Date().toISOString(),
            totalBets: 12,
            totalWins: 3
          }
        ] as User[];
      }
    },
    retry: false
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; updates: Partial<User> }) => {
      return apiRequest("PUT", `/api/admin/users/${userData.id}`, userData.updates);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user information.",
        variant: "destructive",
      });
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/admin/users/${userId}/suspend`);
    },
    onSuccess: () => {
      toast({
        title: "User Suspended",
        description: "User account has been suspended.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    }
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/add-funds`, { amount });
    },
    onSuccess: () => {
      toast({
        title: "Funds Added",
        description: "Funds have been successfully added to user account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    }
  });

  const filteredUsers = users?.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'bronze': return 'bg-orange-500';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-muted-foreground">View and manage all WeParlay users</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Complete list of registered users and their account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="text-red-500 mb-4">
                <Mail className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Authentication Issue</h3>
                <p className="text-sm text-muted-foreground">Using demo data for development</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>WeParlay Cash</TableHead>
                  <TableHead>Betting Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(user.tier)}>
                        {user.tier?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{user.weparlayCash || 0} WPC</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.totalBets || 0} bets</div>
                        <div className="text-green-600">{user.totalWins || 0} wins</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addFundsMutation.mutate({ userId: user.id, amount: 100 })}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => suspendUserMutation.mutate(user.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user account details
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  defaultValue={selectedUser.username}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tier" className="text-right">
                  Tier
                </Label>
                <Select defaultValue={selectedUser.tier}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateUserMutation.mutate({
                    id: selectedUser.id,
                    updates: { tier: 'gold', status: 'active' }
                  });
                }
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}