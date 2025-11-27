import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";

export const DashboardOverview = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const formattedDate = currentDate.toISOString().split("T")[0];
  const displayDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments-today", formattedDate],
    queryFn: async () => {
      return await appointmentService.getTodayAppointments(formattedDate);
    },
    refetchInterval: 30000,
  });

  const stats = {
    total: appointments.length,
    checkedIn: appointments.filter((apt) => apt.status === "CHECKED_IN" || apt.status === "IN_PROGRESS").length,
    waiting: appointments.filter((apt) => apt.status === "SCHEDULED" || apt.status === "WAITING").length,
    avgWaitTime: 24,
  };

  const appointmentTypes = {
    booked: appointments.filter((apt) => apt.appointmentType === "SCHEDULED").length,
    walkins: appointments.filter((apt) => apt.appointmentType === "WALKIN").length,
    followups: appointments.filter((apt) => apt.appointmentType === "FOLLOWUP").length,
  };

  const newPatients = appointments.filter((apt) => apt.isNewPatient).length;

  const doctors = [
    { name: "Dr. Ram Krishna", slots: ["12:45", "1:00", "2:00", "2:15"] },
    { name: "Dr. Arjun Ramesh", slots: [] },
    { name: "Dr. Vindya Nadu", slots: ["3:15", "3:30"] },
    { name: "Dr. Rachel John", slots: [] },
    { name: "Dr. Deepak Gowda", slots: [] },
    { name: "Dr. Sunny T", slots: [] },
  ];

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const isToday = formattedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card border border-border rounded-lg px-6 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[200px] text-center">
          {isToday ? "TODAY" : displayDate}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Total Appointments</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.total}</span>
            <span className="text-sm text-muted-foreground">appointments</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Checked-in Patients</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.checkedIn}</span>
            <span className="text-sm text-muted-foreground">patients</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Waiting Patients Count</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.waiting}</span>
            <span className="text-sm text-muted-foreground">patients</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Average Waiting Time</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.avgWaitTime}</span>
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">Appointment Type</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="bg-primary/20 rounded-full h-8 flex items-center px-3"
                style={{ width: `${appointmentTypes.booked > 0 ? (appointmentTypes.booked / stats.total) * 100 : 10}%`, minWidth: "120px" }}
              >
                <span className="text-sm font-medium">Booked: {appointmentTypes.booked}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="bg-warning/20 rounded-full h-8 flex items-center px-3"
                style={{ width: `${appointmentTypes.walkins > 0 ? (appointmentTypes.walkins / stats.total) * 100 : 10}%`, minWidth: "120px" }}
              >
                <span className="text-sm font-medium">Walk-ins: {appointmentTypes.walkins}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="bg-accent/20 rounded-full h-8 flex items-center px-3"
                style={{ width: `${appointmentTypes.followups > 0 ? (appointmentTypes.followups / stats.total) * 100 : 10}%`, minWidth: "120px" }}
              >
                <span className="text-sm font-medium">Follow-ups: {appointmentTypes.followups}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">New Patients Registered</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold">{newPatients}</span>
            <span className="text-sm text-muted-foreground">patients</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-success rounded h-16 flex items-center justify-center flex-col text-success-foreground">
              <span className="text-xs">By Staff</span>
              <span className="text-2xl font-bold">{Math.floor(newPatients * 0.7)}</span>
            </div>
            <div className="flex-1 bg-primary rounded h-16 flex items-center justify-center flex-col text-primary-foreground">
              <span className="text-xs">Self</span>
              <span className="text-2xl font-bold">{Math.ceil(newPatients * 0.3)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Doctor & Slot Status</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{displayDate}</span>
          </div>
        </div>
        <div className="space-y-2">
          {doctors.map((doctor, idx) => (
            <div key={idx} className="flex items-center gap-4 py-2">
              <span className="text-sm w-48">{doctor.name}</span>
              <div className="flex gap-2 flex-1">
                {doctor.slots.length > 0 ? (
                  doctor.slots.map((slot, slotIdx) => (
                    <Badge key={slotIdx} variant="secondary" className="bg-success/10 text-success">
                      {slot}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No available slots</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
