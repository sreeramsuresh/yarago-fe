import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Users, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export const UserProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Check if user has admin role
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card z-50">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {user?.branchName && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                Branch: {user.branchName}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Profile Settings - visible to all users */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/dashboard/profile")}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        {/* User Management - visible only to admins */}
        {isAdmin && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/dashboard/user-management")}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
