import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Phone, Building, Shield, Lock, Save } from "lucide-react";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user, loading, navigate]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement API call to update profile
      // return await authService.updateProfile(data);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      // TODO: Implement API call to change password
      // return await authService.changePassword(data);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
    });
  };

  const handlePasswordChange = () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (profileData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: profileData.currentPassword,
      newPassword: profileData.newPassword,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact administrator to change your email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={profileData.phoneNumber}
              onChange={(e) =>
                setProfileData({ ...profileData, phoneNumber: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleProfileUpdate}
            disabled={updateProfileMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Username</Label>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-medium">{user?.id}</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Branch
            </Label>
            <p className="font-medium">{user?.branchName || "Not assigned"}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Assigned Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user?.roles?.map((role) => (
                <Badge key={role} variant="secondary">
                  {role.replace("ROLE_", "")}
                </Badge>
              )) || <Badge variant="outline">No roles assigned</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={profileData.currentPassword}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={profileData.newPassword}
              onChange={(e) =>
                setProfileData({ ...profileData, newPassword: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={
              changePasswordMutation.isPending ||
              !profileData.currentPassword ||
              !profileData.newPassword ||
              !profileData.confirmPassword
            }
          >
            <Lock className="h-4 w-4 mr-2" />
            {changePasswordMutation.isPending
              ? "Changing..."
              : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
