import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Mail,
  Shield,
} from 'lucide-react';
import { User, UserRole, UserPermissions } from '@/types/recruitment';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/context/UsersContext';
import { useRecruitment } from '@/context/RecruitmentContext';

const getDefaultPermissions = (role: UserRole): UserPermissions => {
  // Super Admin gets all permissions by default
  if (role === 'super_admin') {
    return {
      isSuperAdmin: true,
      canManageUsers: true,
      features: {
        dashboard: true,
        demands: true,
        demandRoles: true,
        candidates: true,
        interviews: true,
        offers: true,
        onboarding: true,
        bench: true,
        projects: true,
      },
    };
  }

  // Default permissions for other roles (admin gets most, others get role-specific)
  const baseFeatures = {
    dashboard: true,
    demands: role === 'admin' || role === 'hiring_manager',
    demandRoles: role === 'admin' || role === 'hiring_manager',
    candidates: role === 'admin' || role === 'hiring_manager',
    interviews: role === 'admin' || role === 'interviewer',
    offers: role === 'admin',
    onboarding: role === 'admin',
    bench: role === 'admin',
    projects: role === 'admin',
  };

  return {
    canManageUsers: false,
    features: baseFeatures,
  };
};

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin (HR)',
  hiring_manager: 'Hiring Manager',
  interviewer: 'Interviewer',
};

const roleBadgeVariants: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  hiring_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  interviewer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const UserManagement = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { users, addUser, updateUser, deleteUser, sendInviteEmail } = useUsers();
  const { emailTemplates } = useRecruitment();
  const userInviteTemplate = emailTemplates.find(t => t.id === 'user_invite');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    permissions: UserPermissions;
  }>({
    name: '',
    email: '',
    role: 'interviewer' as UserRole,
    permissions: getDefaultPermissions('interviewer'),
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      permissions: newUser.permissions,
    };

    addUser(user);

    // Automatically send invitation email with template from Settings
    const result = await sendInviteEmail(user, userInviteTemplate);
    if (result.success) {
      toast.success('User created and invitation sent successfully');
    } else {
      toast.error('User created but failed to send invitation email');
    }

    setNewUser({
      name: '',
      email: '',
      role: 'interviewer',
      permissions: getDefaultPermissions('interviewer'),
    });
    setIsCreateOpen(false);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    updateUser(selectedUser);
    setIsEditOpen(false);
    setSelectedUser(null);
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast.success('User deleted successfully');
  };

  const handleToggleActive = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUser({ ...user, isActive: !user.isActive });
      toast.success('User status updated');
    }
  };

  const handleSendInvite = async (user: User) => {
    toast.loading('Sending invitation...', { id: 'invite-toast' });
    const result = await sendInviteEmail(user, userInviteTemplate);
    if (result.success) {
      toast.success(`Invitation resent to ${user.email}`, { id: 'invite-toast' });
    } else {
      toast.error(`Failed to send invitation to ${user.email}`, { id: 'invite-toast' });
    }
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Manage Users</h2>
            <p className="text-muted-foreground mt-1">Add, edit, and manage user access</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and assign a role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: UserRole) => {
                      const newPermissions = getDefaultPermissions(value);
                      setNewUser({ ...newUser, role: value, permissions: newPermissions });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin (HR)</SelectItem>
                      <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                      <SelectItem value="interviewer">Interviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions Section */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-semibold">Permissions</Label>

                  {/* Super Admin Access Checkbox */}
                  <div className="flex items-center space-x-2 p-2 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <Checkbox
                      id="isSuperAdmin"
                      checked={newUser.permissions.isSuperAdmin || false}
                      onCheckedChange={(checked) =>
                        setNewUser({
                          ...newUser,
                          permissions: {
                            ...newUser.permissions,
                            isSuperAdmin: checked as boolean,
                            // If granting super admin, also grant all other permissions
                            ...(checked ? {
                              canManageUsers: true,
                              features: {
                                dashboard: true,
                                demands: true,
                                demandRoles: true,
                                candidates: true,
                                interviews: true,
                                offers: true,
                                onboarding: true,
                                bench: true,
                                projects: true,
                              }
                            } : {})
                          },
                        })
                      }
                    />
                    <Label htmlFor="isSuperAdmin" className="font-semibold text-sm cursor-pointer text-purple-700 dark:text-purple-400">
                      Super Admin Access (Full System Control)
                    </Label>
                  </div>

                  {/* Can Manage Users Checkbox */}
                  {!newUser.permissions.isSuperAdmin && (
                    <div className="flex items-center space-x-2 p-2 rounded bg-muted/50">
                      <Checkbox
                        id="canManageUsers"
                        checked={newUser.permissions.canManageUsers || false}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              canManageUsers: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="canManageUsers" className="font-semibold text-sm cursor-pointer">
                        Can Manage Users & Assign Permissions
                      </Label>
                    </div>
                  )}

                  {/* Feature Access Checkboxes */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select features this user can access:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries({
                        dashboard: 'Dashboard',
                        demands: 'Demands',
                        demandRoles: 'Demand Roles',
                        candidates: 'Candidates',
                        interviews: 'Interviews',
                        offers: 'Offers',
                        onboarding: 'Onboarding',
                        bench: 'Bench Resources',
                        projects: 'Projects',
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`new-${key}`}
                            checked={newUser.permissions.features[key as keyof typeof newUser.permissions.features]}
                            onCheckedChange={(checked) =>
                              setNewUser({
                                ...newUser,
                                permissions: {
                                  ...newUser.permissions,
                                  features: {
                                    ...newUser.permissions.features,
                                    [key]: checked as boolean,
                                  },
                                },
                              })
                            }
                            disabled={newUser.role === 'super_admin' || newUser.permissions.isSuperAdmin}
                          />
                          <Label htmlFor={`new-${key}`} className="text-sm cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {(newUser.role === 'super_admin' || newUser.permissions.isSuperAdmin) && (
                      <p className="text-xs text-muted-foreground italic">
                        {newUser.permissions.isSuperAdmin ? 'Super Admin Access grants all features' : 'Super Admin has access to all features'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin (HR)</SelectItem>
              <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
              <SelectItem value="interviewer">Interviewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleBadgeVariants[user.role]}>
                      <Shield className="h-3 w-3 mr-1" />
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user.id)}
                      />
                      <span className={user.isActive ? 'text-success' : 'text-muted-foreground'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSendInvite(user)}
                        title="Send Invite"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditOpen(true);
                        }}
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and role assignment.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value: UserRole) => {
                      const newPermissions = selectedUser.permissions || getDefaultPermissions(value);
                      setSelectedUser({ ...selectedUser, role: value, permissions: newPermissions });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin (HR)</SelectItem>
                      <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                      <SelectItem value="interviewer">Interviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions Section */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-semibold">Permissions</Label>

                  {/* Super Admin Access Checkbox */}
                  <div className="flex items-center space-x-2 p-2 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <Checkbox
                      id="edit-isSuperAdmin"
                      checked={selectedUser.permissions?.isSuperAdmin || false}
                      onCheckedChange={(checked) =>
                        setSelectedUser({
                          ...selectedUser,
                          permissions: {
                            ...selectedUser.permissions!,
                            isSuperAdmin: checked as boolean,
                            // If granting super admin, also grant all other permissions
                            ...(checked ? {
                              canManageUsers: true,
                              features: {
                                dashboard: true,
                                demands: true,
                                demandRoles: true,
                                candidates: true,
                                interviews: true,
                                offers: true,
                                onboarding: true,
                                bench: true,
                                projects: true,
                              }
                            } : {})
                          },
                        })
                      }
                    />
                    <Label htmlFor="edit-isSuperAdmin" className="font-semibold text-sm cursor-pointer text-purple-700 dark:text-purple-400">
                      Super Admin Access (Full System Control)
                    </Label>
                  </div>

                  {/* Can Manage Users Checkbox */}
                  {!selectedUser.permissions?.isSuperAdmin && (
                    <div className="flex items-center space-x-2 p-2 rounded bg-muted/50">
                      <Checkbox
                        id="edit-canManageUsers"
                        checked={selectedUser.permissions?.canManageUsers || false}
                        onCheckedChange={(checked) =>
                          setSelectedUser({
                            ...selectedUser,
                            permissions: {
                              ...selectedUser.permissions!,
                              canManageUsers: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="edit-canManageUsers" className="font-semibold text-sm cursor-pointer">
                        Can Manage Users & Assign Permissions
                      </Label>
                    </div>
                  )}

                  {/* Feature Access Checkboxes */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select features this user can access:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries({
                        dashboard: 'Dashboard',
                        demands: 'Demands',
                        demandRoles: 'Demand Roles',
                        candidates: 'Candidates',
                        interviews: 'Interviews',
                        offers: 'Offers',
                        onboarding: 'Onboarding',
                        bench: 'Bench Resources',
                        projects: 'Projects',
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${key}`}
                            checked={selectedUser.permissions?.features?.[key as keyof typeof selectedUser.permissions.features] || false}
                            onCheckedChange={(checked) =>
                              setSelectedUser({
                                ...selectedUser,
                                permissions: {
                                  ...selectedUser.permissions!,
                                  features: {
                                    ...selectedUser.permissions!.features,
                                    [key]: checked as boolean,
                                  },
                                },
                              })
                            }
                            disabled={selectedUser.role === 'super_admin' || selectedUser.permissions?.isSuperAdmin}
                          />
                          <Label htmlFor={`edit-${key}`} className="text-sm cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {(selectedUser.role === 'super_admin' || selectedUser.permissions?.isSuperAdmin) && (
                      <p className="text-xs text-muted-foreground italic">
                        {selectedUser.permissions?.isSuperAdmin ? 'Super Admin Access grants all features' : 'Super Admin has access to all features'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
