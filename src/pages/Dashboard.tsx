import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import Appointments from "./Appointments";
import ReceptionQueue from "./ReceptionQueue";
import Optometry from "./Optometry";
import DoctorQueue from "./DoctorQueue";
import Admin from "./Admin";
import PatientSearch from "./PatientSearch";
import Analytics from "./Analytics";
import IPD from "./IPD";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
              </div>
              <div className="flex-1 max-w-2xl">
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <UserProfileDropdown />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="reception-queue" element={<ReceptionQueue />} />
              <Route path="optometry" element={<Optometry />} />
              <Route path="doctor" element={<DoctorQueue />} />
              <Route path="admin" element={<Admin />} />
              <Route path="patient-search" element={<PatientSearch />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ipd" element={<IPD />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
