import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus } from "lucide-react";
import { AppointmentCard } from "@/components/AppointmentCard";
import { appointmentService } from "@/services/appointmentService";

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentService.getTodayQueue();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="p-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Appointment List</TabsTrigger>
            <TabsTrigger value="form3c">Form3C Report</TabsTrigger>
            <TabsTrigger value="dilated">Dilated Patient</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
            <TabsTrigger value="laser">Laser Appts.</TabsTrigger>
            <TabsTrigger value="injection">Injection Appts.</TabsTrigger>
            <TabsTrigger value="surgical">Surgical Appts.</TabsTrigger>
            <TabsTrigger value="tracking">Patient Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Appointment List</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage all your appointments in one convenient view.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter By
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search among patients" className="pl-9 w-64" />
                  </div>
                  <Button size="sm" onClick={() => navigate("/register-patient")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Patient
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No appointments for today</p>
                  <Button onClick={() => navigate("/register-patient")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Patient
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        token={apt.token}
                        time={apt.appointmentTime ? new Date(`2000-01-01T${apt.appointmentTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'N/A'}
                        uhid={apt.patientId}
                        name={apt.patientName || 'N/A'}
                        type={apt.appointmentType}
                        doctor={apt.consultantName || 'N/A'}
                        status={apt.status}
                        waitingTime={apt.checkInTime ? Math.floor((new Date().getTime() - new Date(apt.checkInTime).getTime()) / 60000) : undefined}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-muted-foreground">
                      Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="form3c">
            <div className="text-center py-12 text-muted-foreground">
              Form3C Report content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="dilated">
            <div className="text-center py-12 text-muted-foreground">
              Dilated Patient content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="investigations">
            <div className="text-center py-12 text-muted-foreground">
              Investigations content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="laser">
            <div className="text-center py-12 text-muted-foreground">
              Laser Appointments content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="injection">
            <div className="text-center py-12 text-muted-foreground">
              Injection Appointments content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="surgical">
            <div className="text-center py-12 text-muted-foreground">
              Surgical Appointments content will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="tracking">
            <div className="text-center py-12 text-muted-foreground">
              Patient Tracking content will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Appointments;
