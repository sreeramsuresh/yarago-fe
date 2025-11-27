import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Pill, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ipdService, DischargeAdmissionRequest } from "@/services/ipdService";

const IPDAdmissionDetail = () => {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dischargeData, setDischargeData] = useState<DischargeAdmissionRequest>({
    dischargeType: "NORMAL",
    dischargeSummary: "",
    dischargeInstructions: "",
    followUpDate: "",
    finalDiagnosis: "",
  });

  const [newVitals, setNewVitals] = useState({
    temperature: "",
    bloodPressure: "",
    pulse: "",
    respiratoryRate: "",
    spo2: "",
    weight: "",
    notes: "",
  });

  const { data: admission, isLoading: admissionLoading } = useQuery({
    queryKey: ["ipd-admission", admissionId],
    queryFn: async () => {
      if (!admissionId) throw new Error("Admission ID is required");
      return await ipdService.getAdmissionById(admissionId);
    },
    enabled: !!admissionId,
  });

  const { data: vitals } = useQuery({
    queryKey: ["ipd-vitals", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];
      return await ipdService.getAdmissionVitals(admissionId);
    },
    enabled: !!admissionId,
  });

  const dischargeMutation = useMutation({
    mutationFn: async () => {
      if (!admissionId) throw new Error("Admission ID is required");
      return await ipdService.dischargeAdmission(admissionId, dischargeData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient discharged successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["ipd-admission", admissionId] });
      navigate("/ipd");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to discharge patient",
        variant: "destructive",
      });
    },
  });

  const addVitalsMutation = useMutation({
    mutationFn: async () => {
      if (!admissionId) throw new Error("Admission ID is required");
      return await ipdService.addVitals(admissionId, {
        temperature: newVitals.temperature ? parseFloat(newVitals.temperature) : undefined,
        bloodPressure: newVitals.bloodPressure || undefined,
        pulse: newVitals.pulse ? parseInt(newVitals.pulse) : undefined,
        respiratoryRate: newVitals.respiratoryRate ? parseInt(newVitals.respiratoryRate) : undefined,
        spo2: newVitals.spo2 ? parseInt(newVitals.spo2) : undefined,
        weight: newVitals.weight ? parseFloat(newVitals.weight) : undefined,
        notes: newVitals.notes || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vitals recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["ipd-vitals", admissionId] });
      setNewVitals({
        temperature: "",
        bloodPressure: "",
        pulse: "",
        respiratoryRate: "",
        spo2: "",
        weight: "",
        notes: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record vitals",
        variant: "destructive",
      });
    },
  });

  if (loading || admissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Admission not found</p>
            <Button onClick={() => navigate("/ipd")} className="mt-4">
              Back to IPD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysAdmitted = Math.ceil(
    (new Date().getTime() - new Date(admission.admissionDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ipd")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">IPD Admission Details</h1>
              <p className="text-muted-foreground">Patient admission and treatment records</p>
            </div>
          </div>
          {admission.status === "ADMITTED" && (
            <Button variant="destructive" onClick={() => dischargeMutation.mutate()}>
              <LogOut className="h-4 w-4 mr-2" />
              Discharge Patient
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient Information</CardTitle>
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{admission.patientName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UHID</p>
                <p className="font-mono">{admission.patientUhid || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{admission.patientAge || "N/A"} Years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{admission.patientGender || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Admission Details</CardTitle>
                <Badge variant={admission.status === "ADMITTED" ? "default" : "secondary"}>
                  {admission.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Ward & Bed</p>
                <p className="font-medium">
                  {admission.wardName || "N/A"} - Bed {admission.bedNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Date</p>
                <p className="font-medium">{new Date(admission.admissionDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Admitted</p>
                <p className="font-medium">{daysAdmitted} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Type</p>
                <Badge variant="outline">{admission.admissionType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Primary Doctor</p>
                <p className="font-medium">{admission.primaryDoctorName || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            {admission.status === "ADMITTED" && <TabsTrigger value="discharge">Discharge</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {admission.chiefComplaint && (
                  <div>
                    <p className="text-sm font-medium mb-1">Chief Complaints</p>
                    <p className="text-sm text-muted-foreground">{admission.chiefComplaint}</p>
                  </div>
                )}
                {admission.provisionalDiagnosis && (
                  <div>
                    <p className="text-sm font-medium mb-1">Provisional Diagnosis</p>
                    <p className="text-sm text-muted-foreground">{admission.provisionalDiagnosis}</p>
                  </div>
                )}
                {admission.medicalHistory && (
                  <div>
                    <p className="text-sm font-medium mb-1">Medical History</p>
                    <p className="text-sm text-muted-foreground">{admission.medicalHistory}</p>
                  </div>
                )}
                {admission.allergies && (
                  <div>
                    <p className="text-sm font-medium mb-1">Allergies</p>
                    <p className="text-sm text-muted-foreground">{admission.allergies}</p>
                  </div>
                )}
                {admission.specialInstructions && (
                  <div>
                    <p className="text-sm font-medium mb-1">Special Instructions</p>
                    <p className="text-sm text-muted-foreground">{admission.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {admission.attendantName && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{admission.attendantName}</p>
                    </div>
                    {admission.attendantPhone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{admission.attendantPhone}</p>
                      </div>
                    )}
                    {admission.attendantRelation && (
                      <div>
                        <p className="text-sm text-muted-foreground">Relation</p>
                        <p className="font-medium">{admission.attendantRelation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            {admission.status === "ADMITTED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Record New Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Pressure</label>
                      <Input
                        placeholder="120/80"
                        value={newVitals.bloodPressure}
                        onChange={(e) => setNewVitals({ ...newVitals, bloodPressure: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pulse (bpm)</label>
                      <Input
                        type="number"
                        placeholder="72"
                        value={newVitals.pulse}
                        onChange={(e) => setNewVitals({ ...newVitals, pulse: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Temperature (°F)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="98.6"
                        value={newVitals.temperature}
                        onChange={(e) => setNewVitals({ ...newVitals, temperature: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Respiratory Rate</label>
                      <Input
                        type="number"
                        placeholder="16"
                        value={newVitals.respiratoryRate}
                        onChange={(e) => setNewVitals({ ...newVitals, respiratoryRate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SpO2 (%)</label>
                      <Input
                        type="number"
                        placeholder="98"
                        value={newVitals.spo2}
                        onChange={(e) => setNewVitals({ ...newVitals, spo2: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70"
                        value={newVitals.weight}
                        onChange={(e) => setNewVitals({ ...newVitals, weight: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Additional notes about vitals"
                      value={newVitals.notes}
                      onChange={(e) => setNewVitals({ ...newVitals, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button onClick={() => addVitalsMutation.mutate()} disabled={addVitalsMutation.isPending}>
                    {addVitalsMutation.isPending ? "Recording..." : "Record Vitals"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Vitals History</CardTitle>
                <CardDescription>All recorded vital signs during admission</CardDescription>
              </CardHeader>
              <CardContent>
                {vitals && vitals.length > 0 ? (
                  <div className="space-y-4">
                    {vitals.map((vital, index) => (
                      <div key={vital.id || index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(vital.recordedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">By: {vital.recordedBy || "Staff"}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {vital.bloodPressure && (
                            <div>
                              <span className="text-muted-foreground">BP:</span> {vital.bloodPressure}
                            </div>
                          )}
                          {vital.pulse && (
                            <div>
                              <span className="text-muted-foreground">Pulse:</span> {vital.pulse} bpm
                            </div>
                          )}
                          {vital.temperature && (
                            <div>
                              <span className="text-muted-foreground">Temp:</span> {vital.temperature}°F
                            </div>
                          )}
                          {vital.respiratoryRate && (
                            <div>
                              <span className="text-muted-foreground">RR:</span> {vital.respiratoryRate}
                            </div>
                          )}
                          {vital.spo2 && (
                            <div>
                              <span className="text-muted-foreground">SpO2:</span> {vital.spo2}%
                            </div>
                          )}
                          {vital.weight && (
                            <div>
                              <span className="text-muted-foreground">Weight:</span> {vital.weight} kg
                            </div>
                          )}
                        </div>
                        {vital.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Pill className="h-12 w-12 mx-auto mb-4" />
                    <p>No vitals recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Billing Summary</CardTitle>
                    <CardDescription>All charges during admission</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Bed Charges</p>
                      <p className="text-sm text-muted-foreground">
                        {daysAdmitted} days × ₹{admission.bedDailyCharges || 0}/day
                      </p>
                    </div>
                    <p className="font-bold">₹{((admission.bedDailyCharges || 0) * daysAdmitted).toFixed(2)}</p>
                  </div>
                </div>

                {admission.advanceAmount && admission.advanceAmount > 0 && (
                  <>
                    <Separator />
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-green-900">Advance Paid</p>
                        <p className="font-bold text-green-900">₹{admission.advanceAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Complete billing details will be available at discharge</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {admission.status === "ADMITTED" && (
            <TabsContent value="discharge">
              <Card>
                <CardHeader>
                  <CardTitle>Discharge Patient</CardTitle>
                  <CardDescription>Complete discharge summary and instructions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discharge Type *</label>
                    <Select
                      value={dischargeData.dischargeType}
                      onValueChange={(value) => setDischargeData({ ...dischargeData, dischargeType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal Discharge</SelectItem>
                        <SelectItem value="LAMA">LAMA (Left Against Medical Advice)</SelectItem>
                        <SelectItem value="REFERRED">Referred to Higher Center</SelectItem>
                        <SelectItem value="DEATH">Death</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Diagnosis *</label>
                    <Textarea
                      value={dischargeData.finalDiagnosis}
                      onChange={(e) => setDischargeData({ ...dischargeData, finalDiagnosis: e.target.value })}
                      placeholder="Enter final diagnosis"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discharge Summary *</label>
                    <Textarea
                      value={dischargeData.dischargeSummary}
                      onChange={(e) => setDischargeData({ ...dischargeData, dischargeSummary: e.target.value })}
                      placeholder="Enter discharge summary including treatment provided, patient condition at discharge, etc."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discharge Instructions</label>
                    <Textarea
                      value={dischargeData.dischargeInstructions}
                      onChange={(e) => setDischargeData({ ...dischargeData, dischargeInstructions: e.target.value })}
                      placeholder="Enter discharge instructions for the patient"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Follow-up Date</label>
                    <Input
                      type="date"
                      value={dischargeData.followUpDate}
                      onChange={(e) => setDischargeData({ ...dischargeData, followUpDate: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={() => dischargeMutation.mutate()}
                    disabled={!dischargeData.dischargeSummary || !dischargeData.finalDiagnosis || dischargeMutation.isPending}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {dischargeMutation.isPending ? "Discharging..." : "Confirm Discharge"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default IPDAdmissionDetail;
