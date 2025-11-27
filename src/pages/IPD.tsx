import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Bed, Users, UserPlus, FileText, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ipdService } from "@/services/ipdService";

const IPD = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  const { data: wards, isLoading: wardsLoading } = useQuery({
    queryKey: ["wards"],
    queryFn: async () => {
      return await ipdService.getWards({ isActive: true });
    },
    refetchInterval: 30000,
  });

  const { data: bedsData, isLoading: bedsLoading } = useQuery({
    queryKey: ["beds-overview"],
    queryFn: async () => {
      const beds = await ipdService.getBeds({ isActive: true });

      const totalBeds = beds.length;
      const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
      const available = beds.filter((b) => b.status === "AVAILABLE").length;
      const maintenance = beds.filter((b) => b.status === "MAINTENANCE").length;

      return {
        beds,
        stats: { totalBeds, occupied, available, maintenance },
      };
    },
    refetchInterval: 30000,
  });

  const { data: admissions, isLoading: admissionsLoading } = useQuery({
    queryKey: ["ipd-admissions"],
    queryFn: async () => {
      const response = await ipdService.getAdmissions(0, 100);
      return response.content || [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!loading) {
      // Queries are automatically refetched every 30 seconds due to refetchInterval
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  const admittedPatients = admissions?.filter((a) => a.status === "ADMITTED") || [];
  const dischargedPatients = admissions?.filter((a) => a.status === "DISCHARGED") || [];

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => navigate("/ipd/admit")}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bedsData?.stats.totalBeds || 0}</div>
              <p className="text-xs text-muted-foreground">Across all wards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{bedsData?.stats.occupied || 0}</div>
              <p className="text-xs text-muted-foreground">
                {bedsData?.stats.totalBeds
                  ? Math.round((bedsData.stats.occupied / bedsData.stats.totalBeds) * 100)
                  : 0}
                % occupancy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{bedsData?.stats.available || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for admission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admittedPatients.length}</div>
              <p className="text-xs text-muted-foreground">Currently admitted</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="admitted" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admitted">
              Admitted Patients ({admittedPatients.length})
            </TabsTrigger>
            <TabsTrigger value="discharged">
              Discharged ({dischargedPatients.length})
            </TabsTrigger>
            <TabsTrigger value="beds">Bed Status</TabsTrigger>
          </TabsList>

          <TabsContent value="admitted">
            <Card>
              <CardHeader>
                <CardTitle>Currently Admitted Patients</CardTitle>
                <CardDescription>Patients currently under IPD care</CardDescription>
              </CardHeader>
              <CardContent>
                {admissionsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : admittedPatients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UHID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Bed</TableHead>
                        <TableHead>Ward</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admittedPatients.map((admission) => (
                        <TableRow key={admission.id}>
                          <TableCell className="font-mono">{admission.patientUhid}</TableCell>
                          <TableCell className="font-medium">{admission.patientName}</TableCell>
                          <TableCell>{admission.bedNumber}</TableCell>
                          <TableCell>{admission.wardName}</TableCell>
                          <TableCell>
                            {new Date(admission.admissionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{admission.primaryDoctorName || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{admission.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/ipd/admission/${admission.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No admitted patients</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discharged">
            <Card>
              <CardHeader>
                <CardTitle>Discharged Patients</CardTitle>
                <CardDescription>Recent discharge history</CardDescription>
              </CardHeader>
              <CardContent>
                {admissionsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : dischargedPatients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UHID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Discharge Date</TableHead>
                        <TableHead>Discharge Type</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dischargedPatients.map((admission) => (
                        <TableRow key={admission.id}>
                          <TableCell className="font-mono">{admission.patientUhid}</TableCell>
                          <TableCell className="font-medium">{admission.patientName}</TableCell>
                          <TableCell>
                            {new Date(admission.admissionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {admission.dischargeDate
                              ? new Date(admission.dischargeDate).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{admission.dischargeType || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/ipd/admission/${admission.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No discharge records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beds">
            <div className="space-y-6">
              {wardsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                wards?.map((ward) => {
                  const wardBeds = bedsData?.beds.filter((b) => b.wardId === ward.id) || [];
                  const occupiedCount = wardBeds.filter((b) => b.status === "OCCUPIED").length;

                  return (
                    <Card key={ward.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{ward.wardName}</CardTitle>
                            <CardDescription>
                              Floor {ward.floorNumber} - {ward.wardType} | Capacity: {ward.totalBeds}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {occupiedCount}/{wardBeds.length} Occupied
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                          {wardBeds.map((bed) => (
                            <div
                              key={bed.id}
                              className={`
                                p-3 rounded-lg text-center text-sm font-medium cursor-pointer
                                transition-colors
                                ${
                                  bed.status === "AVAILABLE"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : bed.status === "OCCUPIED"
                                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }
                              `}
                              title={`${bed.bedNumber} - ${bed.status}${bed.currentPatientName ? ` - ${bed.currentPatientName}` : ''}`}
                            >
                              <Bed className="h-4 w-4 mx-auto mb-1" />
                              {bed.bedNumber}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IPD;
