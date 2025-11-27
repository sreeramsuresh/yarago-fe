import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { patientService } from "@/services/patientService";

const PatientSearch = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [uhid, setUhid] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ["patients-search", uhid, name, mobile, dateFrom, dateTo],
    queryFn: async () => {
      const query: string[] = [];
      if (uhid) query.push(`uhid=${uhid}`);
      if (name) query.push(`name=${name}`);
      if (mobile) query.push(`mobile=${mobile}`);
      if (dateFrom) query.push(`fromDate=${dateFrom}`);
      if (dateTo) query.push(`toDate=${dateTo}`);

      const response = await patientService.searchPatients(query.join('&'));
      return response;
    },
    enabled: !!(uhid || name || mobile || dateFrom || dateTo),
  });

  const handleSearch = () => {
    refetch();
  };

  const handleClear = () => {
    setUhid("");
    setName("");
    setMobile("");
    setDateFrom("");
    setDateTo("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>Enter search criteria to find patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">UHID</label>
                <Input
                  placeholder="Enter UHID"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  placeholder="Enter patient name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mobile</label>
                <Input
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {patients && patients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({patients.length})</CardTitle>
              <CardDescription>Click on a patient to view their complete history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UHID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono">{patient.uhid}</TableCell>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell>
                        {patient.age}Y / {patient.gender}
                      </TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.city || "-"}</TableCell>
                      <TableCell>
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patient-history/${patient.id}`)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {patients && patients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}

        {!patients && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">Start searching</h3>
              <p className="text-muted-foreground">Enter search criteria above to find patients</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;
