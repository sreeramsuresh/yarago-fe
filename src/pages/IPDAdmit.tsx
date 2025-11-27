import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ipdService, CreateAdmissionRequest } from "@/services/ipdService";
import { patientService } from "@/services/patientService";

const IPDAdmit = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const { toast } = useToast();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState("");
  const [formData, setFormData] = useState({
    bedId: "",
    admissionType: "EMERGENCY",
    admissionCategory: "TREATMENT",
    primaryDoctorId: "",
    departmentId: "",
    provisionalDiagnosis: "",
    chiefComplaint: "",
    medicalHistory: "",
    allergies: "",
    specialInstructions: "",
    temperature: "",
    bloodPressure: "",
    pulse: "",
    respiratoryRate: "",
    spo2: "",
    weight: "",
    height: "",
    attendantName: "",
    attendantPhone: "",
    attendantRelation: "",
    advanceAmount: "",
  });

  const { data: patients } = useQuery({
    queryKey: ["patients-search", patientSearch],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2) return [];
      return await patientService.searchPatients(patientSearch);
    },
    enabled: patientSearch.length >= 2,
  });

  const { data: wards } = useQuery({
    queryKey: ["wards"],
    queryFn: async () => {
      return await ipdService.getWards({ isActive: true });
    },
  });

  const { data: availableBeds } = useQuery({
    queryKey: ["available-beds", selectedWard],
    queryFn: async () => {
      if (!selectedWard) return [];
      return await ipdService.getAvailableBeds(selectedWard);
    },
    enabled: !!selectedWard,
  });

  const admissionMutation = useMutation({
    mutationFn: async (admissionData: CreateAdmissionRequest) => {
      return await ipdService.createAdmission(admissionData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Patient admitted successfully",
      });
      navigate(`/ipd/admission/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to admit patient",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!formData.bedId) {
      toast({
        title: "Error",
        description: "Please select a bed",
        variant: "destructive",
      });
      return;
    }

    if (!formData.primaryDoctorId) {
      toast({
        title: "Error",
        description: "Please select primary doctor",
        variant: "destructive",
      });
      return;
    }

    const admissionData: CreateAdmissionRequest = {
      patientId: selectedPatient.id,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionTime: new Date().toTimeString().split(' ')[0],
      admissionType: formData.admissionType,
      admissionCategory: formData.admissionCategory,
      wardId: selectedWard,
      bedId: formData.bedId,
      primaryDoctorId: formData.primaryDoctorId,
      departmentId: formData.departmentId || undefined,
      provisionalDiagnosis: formData.provisionalDiagnosis,
      chiefComplaint: formData.chiefComplaint,
      medicalHistory: formData.medicalHistory || undefined,
      allergies: formData.allergies || undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      bloodPressure: formData.bloodPressure || undefined,
      pulse: formData.pulse ? parseInt(formData.pulse) : undefined,
      respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
      spo2: formData.spo2 ? parseInt(formData.spo2) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      attendantName: formData.attendantName || undefined,
      attendantPhone: formData.attendantPhone || undefined,
      attendantRelation: formData.attendantRelation || undefined,
      specialInstructions: formData.specialInstructions || undefined,
      advanceAmount: formData.advanceAmount ? parseFloat(formData.advanceAmount) : undefined,
      branchId: user?.branchId || "default-branch",
    };

    await admissionMutation.mutateAsync(admissionData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ipd")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">New IPD Admission</h1>
            <p className="text-muted-foreground">Admit a patient to In-Patient Department</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Search and select the patient to admit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Patient</label>
                <Input
                  placeholder="Enter UHID, name, or mobile number"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              {patients && patients.length > 0 && (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 cursor-pointer hover:bg-muted ${
                        selectedPatient?.id === patient.id ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch("");
                      }}
                    >
                      <p className="font-medium">{patient.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        UHID: {patient.uhid} | Age: {patient.age} | Mobile: {patient.phoneNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Selected Patient</p>
                  <p className="text-sm text-green-700">
                    {selectedPatient.fullName} - UHID: {selectedPatient.uhid}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ward *</label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards?.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.wardName} - {ward.wardType} ({ward.availableBeds} beds available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bed *</label>
                  <Select
                    value={formData.bedId}
                    onValueChange={(value) => setFormData({ ...formData, bedId: value })}
                    disabled={!selectedWard}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBeds?.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.bedNumber} - {bed.bedType} (₹{bed.dailyCharges}/day)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admission Type *</label>
                  <Select
                    value={formData.admissionType}
                    onValueChange={(value) => setFormData({ ...formData, admissionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admission Category *</label>
                  <Select
                    value={formData.admissionCategory}
                    onValueChange={(value) => setFormData({ ...formData, admissionCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SURGERY">Surgery</SelectItem>
                      <SelectItem value="OBSERVATION">Observation</SelectItem>
                      <SelectItem value="TREATMENT">Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Doctor *</label>
                  <Select
                    value={formData.primaryDoctorId}
                    onValueChange={(value) => setFormData({ ...formData, primaryDoctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor-1">Dr. Smith</SelectItem>
                      <SelectItem value="doctor-2">Dr. Johnson</SelectItem>
                      <SelectItem value="doctor-3">Dr. Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dept-1">Ophthalmology</SelectItem>
                      <SelectItem value="dept-2">General Surgery</SelectItem>
                      <SelectItem value="dept-3">Internal Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chief Complaint *</label>
                <Textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  placeholder="Enter chief complaints"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Provisional Diagnosis *</label>
                <Textarea
                  value={formData.provisionalDiagnosis}
                  onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
                  placeholder="Enter provisional diagnosis"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Medical History</label>
                <Textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Enter medical history"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allergies</label>
                <Input
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Enter known allergies"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Special Instructions</label>
                <Textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  placeholder="Enter special instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vital Signs at Admission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blood Pressure</label>
                  <Input
                    placeholder="120/80"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pulse (bpm)</label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature (°F)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Respiratory Rate</label>
                  <Input
                    type="number"
                    placeholder="16"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SpO2 (%)</label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (cm)</label>
                  <Input
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendant Name</label>
                  <Input
                    value={formData.attendantName}
                    onChange={(e) => setFormData({ ...formData, attendantName: e.target.value })}
                    placeholder="Enter attendant name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendant Phone</label>
                  <Input
                    value={formData.attendantPhone}
                    onChange={(e) => setFormData({ ...formData, attendantPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relation</label>
                  <Input
                    value={formData.attendantRelation}
                    onChange={(e) => setFormData({ ...formData, attendantRelation: e.target.value })}
                    placeholder="e.g., Father, Mother, Spouse"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Advance Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                  placeholder="Enter advance amount"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={admissionMutation.isPending || !selectedPatient}>
              <Save className="h-4 w-4 mr-2" />
              {admissionMutation.isPending ? "Admitting..." : "Admit Patient"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/ipd")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IPDAdmit;
