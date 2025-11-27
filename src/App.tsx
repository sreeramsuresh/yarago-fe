import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import OptometryExamination from "./pages/OptometryExamination";
import DoctorConsultation from "./pages/DoctorConsultation";
import PatientHistory from "./pages/PatientHistory";
import IPDAdmit from "./pages/IPDAdmit";
import IPDAdmissionDetail from "./pages/IPDAdmissionDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/appointments" element={<Navigate to="/dashboard/appointments" replace />} />
          <Route path="/reception-queue" element={<Navigate to="/dashboard/reception-queue" replace />} />
          <Route path="/optometry" element={<Navigate to="/dashboard/optometry" replace />} />
          <Route path="/doctor" element={<Navigate to="/dashboard/doctor" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/patient-search" element={<Navigate to="/dashboard/patient-search" replace />} />
          <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
          <Route path="/ipd" element={<Navigate to="/dashboard/ipd" replace />} />
          <Route path="/register-patient" element={<PatientRegistration />} />
          <Route path="/optometry/examination/:appointmentId" element={<OptometryExamination />} />
          <Route path="/doctor/consultation/:appointmentId" element={<DoctorConsultation />} />
          <Route path="/patient-history/:patientId" element={<PatientHistory />} />
          <Route path="/ipd/admit" element={<IPDAdmit />} />
          <Route path="/ipd/admission/:admissionId" element={<IPDAdmissionDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
