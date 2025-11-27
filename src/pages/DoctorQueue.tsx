import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Clock, Stethoscope } from "lucide-react";
import Logo from "@/components/Logo";
import { appointmentService } from "@/services/appointmentService";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";

interface ExtendedAppointment {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  consultantId: string;
  consultantName: string;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  checkInTime?: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  optometryEndTime?: string;
  patient?: any;
  consultant?: any;
  consultation?: any[];
  optometry_examination?: any[];
}

const DoctorQueue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [waitingAppointments, setWaitingAppointments] = useState<ExtendedAppointment[]>([]);
  const [inProgressAppointments, setInProgressAppointments] = useState<ExtendedAppointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<ExtendedAppointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();

      // Polling interval - refresh every 30 seconds
      const pollingInterval = setInterval(() => {
        fetchAppointments();
      }, 30000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setIsLoadingData(true);
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's appointments
      const appointments = await appointmentService.getAppointmentsByDate(today);

      // Filter appointments for consultation
      const consultationAppointments = appointments.filter(
        (apt: any) =>
          apt.status === "IN_CONSULTATION" ||
          apt.status === "IN-CONSULTATION" ||
          apt.status === "COMPLETED"
      );

      // Separate into waiting, in-progress, and completed
      const waiting: ExtendedAppointment[] = [];
      const inProgress: ExtendedAppointment[] = [];
      const completed: ExtendedAppointment[] = [];

      // Enrich appointments with patient data
      for (const apt of consultationAppointments) {
        try {
          const patient = await patientService.getPatientById(apt.patientId);
          const enrichedApt: ExtendedAppointment = {
            ...apt,
            patient: {
              uhid: patient.uhid,
              full_name: patient.fullName,
              age: patient.age,
              gender: patient.gender,
              mobile: patient.phoneNumber,
            },
            consultant: {
              name: apt.consultantName || "General",
            },
          };

          // Try to fetch consultation data
          try {
            const consultation = await consultationService.getConsultation(apt.id.toString());
            enrichedApt.consultation = [consultation];

            if (consultation.status === "COMPLETED") {
              completed.push(enrichedApt);
            } else if (consultation.status === "IN_PROGRESS") {
              inProgress.push(enrichedApt);
            } else {
              waiting.push(enrichedApt);
            }
          } catch (error) {
            // No consultation yet - this is a waiting patient
            if (apt.status === "COMPLETED") {
              completed.push(enrichedApt);
            } else if (apt.consultationStartTime) {
              inProgress.push(enrichedApt);
            } else {
              waiting.push(enrichedApt);
            }
          }
        } catch (error) {
          console.error("Error fetching patient:", error);
          // Add with fallback data
          const enrichedApt: ExtendedAppointment = {
            ...apt,
            patient: {
              uhid: "N/A",
              full_name: apt.patientName || "Unknown",
              age: 0,
              gender: "Unknown",
              mobile: apt.patientPhone || "N/A",
            },
            consultant: {
              name: apt.consultantName || "General",
            },
          };

          if (apt.status === "COMPLETED") {
            completed.push(enrichedApt);
          } else if (apt.consultationStartTime) {
            inProgress.push(enrichedApt);
          } else {
            waiting.push(enrichedApt);
          }
        }
      }

      setWaitingAppointments(waiting);
      setInProgressAppointments(inProgress);
      setCompletedAppointments(completed);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error loading appointments",
        description: error.message || "Failed to load appointment data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const calculateWaitingTime = (checkInTime: string | null | undefined) => {
    if (!checkInTime) return 0;
    try {
      const waitingTimeMs = new Date().getTime() - new Date(checkInTime).getTime();
      return Math.floor(waitingTimeMs / 60000);
    } catch (error) {
      return 0;
    }
  };

  const startConsultation = (appointmentId: string) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-background">
      <div className="p-6">
        <Tabs defaultValue="waiting" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="waiting">
              Waiting Patients ({waitingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiting">
            {isLoadingData && waitingAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </Card>
            ) : waitingAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No waiting patients</p>
                <p className="text-muted-foreground">
                  Patients will appear here when sent from optometry
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {waitingAppointments.map((apt) => (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl font-bold text-primary">
                          #{apt.tokenNumber}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {apt.patient?.full_name || apt.patientName}
                          </h3>

                          <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-muted-foreground">UHID:</span>
                              <span className="ml-2 font-medium">
                                {apt.patient?.uhid || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Age:</span>
                              <span className="ml-2 font-medium">
                                {apt.patient?.age || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gender:</span>
                              <span className="ml-2 font-medium">
                                {apt.patient?.gender || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-orange-500">
                                {calculateWaitingTime(apt.optometryEndTime || apt.checkInTime)} min waiting
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className={
                                apt.appointmentType === "NEW"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-warning/10 text-warning"
                              }
                            >
                              {apt.appointmentType}
                            </Badge>
                            {apt.optometry_examination?.[0] && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                Optometry Done
                              </Badge>
                            )}
                            {apt.optometry_examination?.[0]?.is_dilated && (
                              <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                                Dilated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => startConsultation(apt.id)}>
                        Start Consultation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {isLoadingData && inProgressAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </Card>
            ) : inProgressAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No consultations in progress</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {inProgressAppointments.map((apt) => (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl font-bold text-yellow-500">
                          #{apt.tokenNumber}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {apt.patient?.full_name || apt.patientName}
                          </h3>

                          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-muted-foreground">UHID:</span>
                              <span className="ml-2 font-medium">
                                {apt.patient?.uhid || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Started:</span>
                              <span className="ml-2 font-medium">
                                {apt.consultationStartTime
                                  ? new Date(apt.consultationStartTime).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : apt.consultation?.[0]?.createdAt
                                  ? new Date(apt.consultation[0].createdAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </div>

                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                            IN PROGRESS
                          </Badge>
                        </div>
                      </div>

                      <Button onClick={() => startConsultation(apt.id)} variant="outline">
                        Continue Consultation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoadingData && completedAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </Card>
            ) : completedAppointments.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No completed consultations today</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedAppointments.map((apt) => (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{apt.tokenNumber}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {apt.patient?.full_name || apt.patientName}
                          </h3>

                          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-muted-foreground">UHID:</span>
                              <span className="ml-2 font-medium">
                                {apt.patient?.uhid || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Completed:</span>
                              <span className="ml-2 font-medium">
                                {apt.consultationEndTime
                                  ? new Date(apt.consultationEndTime).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : apt.consultation?.[0]?.completedAt
                                  ? new Date(apt.consultation[0].completedAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </div>

                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            COMPLETED
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => startConsultation(apt.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorQueue;
