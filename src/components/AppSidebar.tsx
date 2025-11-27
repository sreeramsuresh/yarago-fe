import { 
  Calendar, 
  UserCheck, 
  Eye, 
  Stethoscope, 
  Settings, 
  Search, 
  BarChart3, 
  BedDouble,
  LayoutDashboard
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/appointments", icon: Calendar },
  { title: "Reception", url: "/dashboard/reception-queue", icon: UserCheck },
  { title: "Optometry", url: "/dashboard/optometry", icon: Eye },
  { title: "Doctor", url: "/dashboard/doctor", icon: Stethoscope },
  { title: "Admin", url: "/dashboard/admin", icon: Settings },
  { title: "Patient Search", url: "/dashboard/patient-search", icon: Search },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "IPD", url: "/dashboard/ipd", icon: BedDouble },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            {open && "Hospital Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
