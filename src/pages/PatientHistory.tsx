import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Phone, MapPin, Activity, Eye, Stethoscope, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";
import { consultationService } from "@/services/consultationService";

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { loading } = useAuth();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("Patient ID is required");
      return await patientService.getPatientById(patientId);
    },
    enabled: !!patientId,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["patient-appointments", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await appointmentService.getAppointmentsByPatient(parseInt(patientId));
      return response || [];
    },
    enabled: !!patientId,
  });

  const { data: examinations, isLoading: examinationsLoading } = useQuery({
    queryKey: ["patient-examinations", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      // Since there's no specific endpoint, we'll return empty array
      // In a real implementation, you would fetch from the appropriate endpoint
      return [];
    },
    enabled: !!patientId,
  });

  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ["patient-consultations", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      // Since there's no specific endpoint for patient consultations, return empty
      // In a real implementation, you would have an endpoint like:
      // return await consultationService.getConsultationsByPatient(patientId);
      return [];
    },
    enabled: !!patientId,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["patient-prescriptions", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      // Since there's no specific endpoint for patient prescriptions, return empty
      // In a real implementation, you would have an endpoint like:
      // return await consultationService.getPrescriptionsByPatient(patientId);
      return [];
    },
    enabled: !!patientId,
  });

  if (loading || patientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Patient not found</p>
            <Button onClick={() => navigate("/patient-search")} className="mt-4">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = appointmentsLoading || examinationsLoading || consultationsLoading || prescriptionsLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patient-search")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient History</h1>
            <p className="text-muted-foreground">Complete medical records and timeline</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{patient.fullName}</CardTitle>
                <CardDescription className="text-lg mt-1">UHID: {patient.uhid}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {patient.isActive ? "Active Patient" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Age / Gender</p>
                  <p className="font-medium">{patient.age || "N/A"} Years / {patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{patient.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{patient.city || "N/A"}</p>
                </div>
              </div>
            </div>
            {patient.address && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="text-sm">{patient.address}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="examinations">Examinations</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Timeline Events - Appointments */}
                {appointments?.map((apt: any) => (
                  <Card key={apt.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Appointment #{apt.token}</h3>
                            <Badge>{apt.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                            {apt.appointmentTime && ` at ${apt.appointmentTime}`}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Type:</span> {apt.appointmentType}
                            </p>
                            {apt.notes && (
                              <p className="text-sm">
                                <span className="font-medium">Notes:</span> {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Timeline Events - Examinations */}
                {examinations?.map((exam: any) => (
                  <Card key={exam.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-secondary/10">
                          <Eye className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Optometry Examination</h3>
                            <Badge variant="secondary">{exam.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(exam.createdAt).toLocaleString()}
                          </p>
                          {exam.chiefComplaints && exam.chiefComplaints.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Chief Complaints:</p>
                              <p className="text-sm text-muted-foreground">
                                {exam.chiefComplaints.join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Timeline Events - Consultations */}
                {consultations?.map((consult: any) => (
                  <Card key={consult.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-accent/10">
                          <Stethoscope className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Doctor Consultation</h3>
                            <Badge variant="outline">{consult.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(consult.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Timeline Events - Prescriptions */}
                {prescriptions?.map((rx: any) => (
                  <Card key={rx.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Pill className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Prescription</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(rx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!isLoading && (!appointments || appointments.length === 0) && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
                      <p className="text-muted-foreground">This patient has no medical history yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            {appointmentsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt: any) => (
                  <Card key={apt.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Token #{apt.token}</CardTitle>
                        <Badge>{apt.status}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                        {apt.appointmentTime && ` at ${apt.appointmentTime}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {apt.appointmentType}
                      </p>
                      {apt.isEmergency && (
                        <Badge variant="destructive">Emergency</Badge>
                      )}
                      {apt.notes && (
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span> {apt.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No appointments found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="examinations">
            {examinationsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : examinations && examinations.length > 0 ? (
              <div className="space-y-4">
                {examinations.map((exam: any) => (
                  <Card key={exam.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Optometry Examination</CardTitle>
                        <Badge variant="secondary">{exam.status}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(exam.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {exam.chiefComplaints && exam.chiefComplaints.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Chief Complaints:</p>
                          <p className="text-sm text-muted-foreground">
                            {exam.chiefComplaints.join(", ")}
                          </p>
                        </div>
                      )}
                      {exam.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{exam.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No examinations found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consultations">
            {consultationsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : consultations && consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consult: any) => (
                  <Card key={consult.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Consultation</CardTitle>
                        <Badge variant="outline">{consult.status}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(consult.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {consult.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{consult.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No consultations found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prescriptions">
            {prescriptionsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map((rx: any) => (
                  <Card key={rx.id}>
                    <CardHeader>
                      <CardTitle>Prescription</CardTitle>
                      <CardDescription>
                        {new Date(rx.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {rx.medications && Array.isArray(rx.medications) && rx.medications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Medications:</p>
                          <div className="space-y-2">
                            {rx.medications.map((med: any, idx: number) => (
                              <div key={idx} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium">{med.drugName}</p>
                                {med.dosage && (
                                  <p className="text-sm text-muted-foreground">
                                    Dosage: {med.dosage} - {med.frequency}
                                  </p>
                                )}
                                {med.instructions && (
                                  <p className="text-sm text-muted-foreground">{med.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rx.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{rx.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No prescriptions found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientHistory;
