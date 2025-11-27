import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface AppointmentCardProps {
  token: string;
  time: string;
  uhid: string;
  name: string;
  type: string;
  doctor: string;
  status: string;
  waitingTime?: number;
}

export const AppointmentCard = ({
  token,
  time,
  uhid,
  name,
  type,
  doctor,
  status,
  waitingTime,
}: AppointmentCardProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-orange-500/10 text-orange-500";
      case "IN-OPTOMETRY":
        return "bg-yellow-500/10 text-yellow-500";
      case "IN-CONSULTATION":
        return "bg-green-500/10 text-green-500";
      case "COMPLETED":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-primary">#{token}</div>
          <div>
            <div className="font-semibold text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">UHID: {uhid}</div>
          </div>
        </div>
        <Badge variant="secondary" className={getTypeColor(type)}>
          {type}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-muted-foreground">Time:</span>
          <span className="ml-2 font-medium">{time}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Doctor:</span>
          <span className="ml-2 font-medium">{doctor}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status.replace("-", " ")}
        </Badge>
        {waitingTime !== undefined && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {waitingTime} min
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" className="flex-1">
          View Details
        </Button>
        <Button size="sm" className="flex-1">
          Check-in
        </Button>
      </div>
    </Card>
  );
};
