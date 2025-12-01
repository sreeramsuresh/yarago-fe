import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  UserCheck,
  UserX,
  Lock,
} from "lucide-react";
import { authService } from "@/services/authService";

interface ManagedUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  branchId: string;
  branchName: string;
  designation: string;
  department: string;
  employeeId: string;
  active: boolean;
  accountLocked: boolean;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  { id: "ROLE_ADMIN", name: "Admin", description: "Full system access" },
  { id: "ROLE_DOCTOR", name: "Doctor", description: "Consultations and prescriptions" },
  { id: "ROLE_OPTOMETRIST", name: "Optometrist", description: "Vision testing and refraction" },
  { id: "ROLE_RECEPTIONIST", name: "Receptionist", description: "Patient registration and appointments" },
  { id: "ROLE_BILLING_STAFF", name: "Billing Staff", description: "Invoice and payment management" },
  { id: "ROLE_COUNSELOR", name: "Counselor", description: "Surgery counseling" },
  { id: "ROLE_PHARMACIST", name: "Pharmacist", description: "Medication dispensing" },
  { id: "ROLE_LAB_TECHNICIAN", name: "Lab Technician", description: "Diagnostic tests" },
  { id: "ROLE_MANAGER", name: "Manager", description: "Branch management" },
];

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roles: [] as string[],
    designation: "",
    department: "",
    employeeId: "",
    branchId: "1",
    active: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
    // Check if user is admin
    if (user && !user.roles?.includes("ROLE_ADMIN")) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access User Management",
        variant: "destructive",
      });
    }
  }, [user, loading, navigate, toast]);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["managed-users"],
    queryFn: async () => {
      const response = await authService.getUsers();
      return response;
    },
    enabled: !!user && user.roles?.includes("ROLE_ADMIN"),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await authService.createUser(data);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
      setShowAddDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await authService.updateUser(id, data);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      return await authService.toggleUserStatus(id, active);
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.active ? "User Activated" : "User Deactivated",
        description: `User has been ${variables.active ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      return await authService.resetUserPassword(id, newPassword);
    },
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "User password has been reset successfully.",
      });
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      roles: [],
      designation: "",
      department: "",
      employeeId: "",
      branchId: "1",
      active: true,
    });
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEditUser = (user: ManagedUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      roles: user.roles || [],
      designation: user.designation || "",
      department: user.department || "",
      employeeId: user.employeeId || "",
      branchId: user.branchId || "1",
      active: user.active,
    });
    setShowEditDialog(true);
  };

  const handleResetPassword = (user: ManagedUser) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  const handleToggleStatus = (user: ManagedUser) => {
    toggleStatusMutation.mutate({ id: user.id, active: !user.active });
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, roles: [...formData.roles, roleId] });
    } else {
      setFormData({
        ...formData,
        roles: formData.roles.filter((r) => r !== roleId),
      });
    }
  };

  const handleCreateUser = () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Username, email, and password are required",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    const updateData = { ...formData };
    delete (updateData as any).password; // Don't send password in update
    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const filteredUsers = users.filter(
    (u: ManagedUser) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Click on a user to edit their details or manage their access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u: ManagedUser) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role.replace("ROLE_", "")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{u.department || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={u.active ? "default" : "secondary"}>
                          {u.active ? "Active" : "Inactive"}
                        </Badge>
                        {u.accountLocked && (
                          <Badge variant="destructive">Locked</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(u)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          title={u.active ? "Deactivate User" : "Activate User"}
                        >
                          {u.active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(u)}
                          title="Reset Password"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with assigned roles
            </DialogDescription>
          </DialogHeader>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            handleRoleChange={handleRoleChange}
            isNew={true}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and role assignments
            </DialogDescription>
          </DialogHeader>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            handleRoleChange={handleRoleChange}
            isNew={false}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
        user={selectedUser}
        onReset={(newPassword) => {
          if (selectedUser) {
            resetPasswordMutation.mutate({ id: selectedUser.id, newPassword });
          }
        }}
        isPending={resetPasswordMutation.isPending}
      />
    </div>
  );
};

// User Form Component
const UserForm = ({
  formData,
  setFormData,
  handleRoleChange,
  isNew,
}: {
  formData: any;
  setFormData: (data: any) => void;
  handleRoleChange: (roleId: string, checked: boolean) => void;
  isNew: boolean;
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={!isNew}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      {isNew && (
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) =>
              setFormData({ ...formData, department: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
              <SelectItem value="Optometry">Optometry</SelectItem>
              <SelectItem value="Reception">Reception</SelectItem>
              <SelectItem value="Billing">Billing</SelectItem>
              <SelectItem value="Pharmacy">Pharmacy</SelectItem>
              <SelectItem value="Laboratory">Laboratory</SelectItem>
              <SelectItem value="Counseling">Counseling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input
          id="employeeId"
          value={formData.employeeId}
          onChange={(e) =>
            setFormData({ ...formData, employeeId: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Assign Roles
        </Label>
        <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
          {AVAILABLE_ROLES.map((role) => (
            <div key={role.id} className="flex items-start space-x-2">
              <Checkbox
                id={role.id}
                checked={formData.roles.includes(role.id)}
                onCheckedChange={(checked) =>
                  handleRoleChange(role.id, checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={role.id}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {role.name}
                </label>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reset Password Dialog Component
const ResetPasswordDialog = ({
  open,
  onOpenChange,
  user,
  onReset,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUser | null;
  onReset: (newPassword: string) => void;
  isPending: boolean;
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    onReset(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for {user?.firstName} {user?.lastName} (@{user?.username})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={
              isPending ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagement;
