import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Clock, UserCheck, UserX, Eye, Filter } from "lucide-react";
import Logo from "@/components/Logo";
import { appointmentService } from "@/services/appointmentService";
import { apiClient } from "@/services/api";

const ReceptionQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConsultants();
      fetchAppointments();

      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchAppointments();
      }, 30000); // Poll every 30 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [user]);

  const fetchConsultants = async () => {
    try {
      const response = await apiClient.get('/api/v1/consultants', {
        params: { isActive: true }
      });
      if (response.data) setConsultants(response.data);
    } catch (error) {
      console.error('Failed to fetch consultants:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await appointmentService.getAppointmentsByDate(today);
      if (data) {
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const calculateWaitingTime = (waitingSince: string | null) => {
    if (!waitingSince) return 0;
    const now = new Date().getTime();
    const startTime = new Date(waitingSince).getTime();
    return Math.floor((now - startTime) / 60000); // Convert to minutes
  };

  const handleCheckIn = async (appointmentId: number) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, "WAITING");
      toast({
        title: "Patient checked in",
        description: "Patient added to waiting queue",
      });
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Check-in failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (appointmentId: number) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, "COMPLETED");
      toast({
        title: "Patient checked out",
        description: "Appointment marked as completed",
      });
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Check-out failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      toast({
        title: "Status updated",
        description: `Appointment status changed to ${newStatus.replace("-", " ")}`,
      });
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Status update failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-orange-500/10 text-orange-500";
      case "IN-OPTOMETRY":
        return "bg-yellow-500/10 text-yellow-500";
      case "DILATED":
        return "bg-purple-500/10 text-purple-500";
      case "IN-CONSULTATION":
        return "bg-green-500/10 text-green-500";
      case "COMPLETED":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "NEW":
        return "bg-accent/10 text-accent";
      case "FOLLOW-UP":
        return "bg-warning/10 text-warning";
      case "REVIEW":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesConsultant =
      selectedConsultant === "all" || apt.consultant_id === selectedConsultant;
    const matchesStatus = selectedStatus === "all" || apt.status === selectedStatus;
    return matchesConsultant && matchesStatus;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-background">
      <div className="p-6">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Consultant:</span>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultants</SelectItem>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="WAITING">Waiting</SelectItem>
                  <SelectItem value="IN-OPTOMETRY">In Optometry</SelectItem>
                  <SelectItem value="DILATED">Dilated</SelectItem>
                  <SelectItem value="IN-CONSULTATION">In Consultation</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </div>
          </div>
        </Card>

        {/* Queue List */}
        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No appointments match the selected filters</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <Card
                key={apt.id}
                className={`p-4 ${apt.is_emergency ? "border-red-500 border-2" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left section - Patient info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl font-bold text-primary min-w-[60px]">
                      #{apt.token_number}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{apt.patient.full_name}</h3>
                        {apt.is_emergency && (
                          <Badge variant="destructive" className="text-xs">
                            EMERGENCY
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">UHID:</span>
                          <span className="ml-2 font-medium">{apt.patient.uhid}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <span className="ml-2 font-medium">{apt.patient.age}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mobile:</span>
                          <span className="ml-2 font-medium">{apt.patient.mobile}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <span className="ml-2 font-medium">
                            {new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Consultant:</span>
                          <span className="ml-2 font-medium">{apt.consultant.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-orange-500">
                            {calculateWaitingTime(apt.waiting_since)} min waiting
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className={getTypeColor(apt.appointment_type)}>
                          {apt.appointment_type}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                          {apt.mode}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right section - Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <Select
                      value={apt.status}
                      onValueChange={(value) => handleStatusUpdate(apt.id, value)}
                    >
                      <SelectTrigger className={`w-48 ${getStatusColor(apt.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WAITING">Waiting</SelectItem>
                        <SelectItem value="IN-OPTOMETRY">In Optometry</SelectItem>
                        <SelectItem value="DILATED">Dilated</SelectItem>
                        <SelectItem value="IN-CONSULTATION">In Consultation</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      {!apt.checked_in_at ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleCheckIn(apt.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      ) : apt.status !== "COMPLETED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(apt.id)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Check Out
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="px-4 py-2">
                          Completed
                        </Badge>
                      )}

                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionQueue;
