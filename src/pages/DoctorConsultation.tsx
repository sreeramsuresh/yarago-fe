import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, CheckCircle, Eye, Plus, X, Search } from "lucide-react";
import Logo from "@/components/Logo";
import { appointmentService } from "@/services/appointmentService";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";

// Mock master data - replace with API calls when endpoints are available
const MOCK_FINDINGS = [
  { id: "1", name: "Conjunctival injection", is_active: true },
  { id: "2", name: "Corneal opacity", is_active: true },
  { id: "3", name: "Anterior chamber reaction", is_active: true },
  { id: "4", name: "Lens opacities", is_active: true },
  { id: "5", name: "Nuclear sclerosis", is_active: true },
  { id: "6", name: "Posterior subcapsular cataract", is_active: true },
  { id: "7", name: "Increased cup-disc ratio", is_active: true },
  { id: "8", name: "Disc hemorrhage", is_active: true },
  { id: "9", name: "Macular edema", is_active: true },
  { id: "10", name: "Retinal hemorrhages", is_active: true },
];

const MOCK_DIAGNOSIS = [
  { id: "1", name: "Cataract", icd_code: "H25.9", is_active: true },
  { id: "2", name: "Primary open-angle glaucoma", icd_code: "H40.11", is_active: true },
  { id: "3", name: "Diabetic retinopathy", icd_code: "E11.319", is_active: true },
  { id: "4", name: "Age-related macular degeneration", icd_code: "H35.30", is_active: true },
  { id: "5", name: "Conjunctivitis", icd_code: "H10.9", is_active: true },
  { id: "6", name: "Dry eye syndrome", icd_code: "H04.12", is_active: true },
  { id: "7", name: "Myopia", icd_code: "H52.1", is_active: true },
  { id: "8", name: "Hyperopia", icd_code: "H52.0", is_active: true },
  { id: "9", name: "Astigmatism", icd_code: "H52.2", is_active: true },
  { id: "10", name: "Presbyopia", icd_code: "H52.4", is_active: true },
];

const MOCK_DRUGS = [
  { id: "1", name: "Timolol", strength: "0.5%", category: "Eye Drops", price: 120, available_quantity: 50, instructions_template: "1 drop BD" },
  { id: "2", name: "Latanoprost", strength: "0.005%", category: "Eye Drops", price: 450, available_quantity: 30, instructions_template: "1 drop HS" },
  { id: "3", name: "Moxifloxacin", strength: "0.5%", category: "Eye Drops", price: 180, available_quantity: 60, instructions_template: "1 drop QID" },
  { id: "4", name: "Prednisolone", strength: "1%", category: "Eye Drops", price: 80, available_quantity: 40, instructions_template: "1 drop QID" },
  { id: "5", name: "Carboxymethylcellulose", strength: "0.5%", category: "Eye Drops", price: 150, available_quantity: 100, instructions_template: "1 drop QID" },
  { id: "6", name: "Tropicamide", strength: "1%", category: "Eye Drops", price: 90, available_quantity: 25, instructions_template: "1 drop for dilation" },
  { id: "7", name: "Ciprofloxacin", strength: "500mg", category: "Oral Tablets", price: 60, available_quantity: 200, instructions_template: "1 tablet BD" },
  { id: "8", name: "Vitamin A", strength: "25000 IU", category: "Oral Capsules", price: 40, available_quantity: 150, instructions_template: "1 capsule OD" },
  { id: "9", name: "Dorzolamide-Timolol", strength: "2%-0.5%", category: "Eye Drops", price: 350, available_quantity: 35, instructions_template: "1 drop BD" },
  { id: "10", name: "Bimatoprost", strength: "0.03%", category: "Eye Drops", price: 550, available_quantity: 20, instructions_template: "1 drop HS" },
];

const MOCK_ADVICE = [
  { id: "1", name: "Avoid eye strain", is_active: true },
  { id: "2", name: "Use sunglasses outdoors", is_active: true },
  { id: "3", name: "Regular eye exercises", is_active: true },
  { id: "4", name: "Maintain blood sugar levels", is_active: true },
  { id: "5", name: "Maintain blood pressure", is_active: true },
  { id: "6", name: "Avoid rubbing eyes", is_active: true },
  { id: "7", name: "Take breaks during screen time", is_active: true },
  { id: "8", name: "Use prescribed glasses regularly", is_active: true },
  { id: "9", name: "Keep eyes clean", is_active: true },
  { id: "10", name: "Follow medication schedule", is_active: true },
];

const MOCK_CONSULTANTS = [
  { id: "1", name: "Dr. Sarah Smith", specialization: "Retina Specialist", is_active: true },
  { id: "2", name: "Dr. John Doe", specialization: "Glaucoma Specialist", is_active: true },
  { id: "3", name: "Dr. Emily Johnson", specialization: "Pediatric Ophthalmology", is_active: true },
  { id: "4", name: "Dr. Michael Brown", specialization: "Cornea Specialist", is_active: true },
];

const DoctorConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);
  const [optometryExam, setOptometryExam] = useState<any>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);

  // Master data
  const [allFindings, setAllFindings] = useState<any[]>(MOCK_FINDINGS);
  const [allDiagnosis, setAllDiagnosis] = useState<any[]>(MOCK_DIAGNOSIS);
  const [allDrugs, setAllDrugs] = useState<any[]>(MOCK_DRUGS);
  const [allAdvice, setAllAdvice] = useState<any[]>(MOCK_ADVICE);
  const [consultants, setConsultants] = useState<any[]>(MOCK_CONSULTANTS);

  // Form state
  const [selectedFindings, setSelectedFindings] = useState<any[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any[]>([]);
  const [customFindings, setCustomFindings] = useState("");
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [examinationNotes, setExaminationNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [selectedAdvice, setSelectedAdvice] = useState<string[]>([]);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [drugSearch, setDrugSearch] = useState("");
  const [showAddDrug, setShowAddDrug] = useState(false);

  // Referrals
  const [referBackToOptometry, setReferBackToOptometry] = useState(false);
  const [optometryInstructions, setOptometryInstructions] = useState("");
  const [crossReferTo, setCrossReferTo] = useState("");
  const [crossReferRemarks, setCrossReferRemarks] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);

  const fetchData = async () => {
    try {
      // Fetch appointment with optometry data
      const aptData = await appointmentService.getAppointmentById(Number(appointmentId));

      // Enrich with patient data
      const patient = await patientService.getPatientById(aptData.patientId.toString());

      const enrichedAppointment = {
        ...aptData,
        patient: {
          uhid: patient.uhid,
          full_name: patient.fullName,
          age: patient.age,
          gender: patient.gender,
          mobile: patient.phoneNumber,
        },
        consultant: {
          name: aptData.consultantName || "General",
        },
      };

      setAppointment(enrichedAppointment);

      // Try to fetch optometry examination
      try {
        const examData = await consultationService.getOptometryExam(appointmentId!);
        if (examData) {
          setOptometryExam(examData);
        }
      } catch (error) {
        console.log("No optometry examination found");
      }

      // Try to fetch existing consultation
      try {
        const consultData = await consultationService.getConsultation(appointmentId!);
        if (consultData) {
          setConsultation(consultData);
          loadConsultationData(consultData);
        }
      } catch (error) {
        console.log("No existing consultation found");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load appointment details",
        variant: "destructive",
      });
    }
  };

  const loadConsultationData = (consult: any) => {
    // Load diagnosis
    if (consult.diagnosis) {
      const diagnosisList = consult.diagnosis.split(",").map((d: string) => {
        const parts = d.trim().split(" - ");
        return {
          name: parts[0],
          eye: parts[1] || "Both",
        };
      });
      setSelectedDiagnosis(diagnosisList);
    }

    setCustomDiagnosis(consult.diagnosis || "");
    setExaminationNotes(consult.presentIllness || "");
    setTreatmentPlan(consult.treatment || "");

    // Load advice
    if (consult.advice) {
      const adviceList = consult.advice.split(",").map((a: string) => a.trim());
      setSelectedAdvice(adviceList);
    }

    // Load prescription if available
    if (consult.prescriptionId) {
      consultationService.getPrescription(consult.prescriptionId).then((prescData) => {
        setPrescription(prescData);
        if (prescData.medications) {
          setPrescriptionItems(
            prescData.medications.map((med: any, index: number) => ({
              id: `${index}`,
              drug_name: med.medicineName,
              instructions: med.instructions || "",
              duration_days: parseInt(med.duration) || 7,
              eye: med.eye || "Both",
              food_timing: "After food",
              quantity: 1,
              price: 0,
              dosage: med.dosage,
              frequency: med.frequency,
            }))
          );
        }
      }).catch((error) => {
        console.log("No prescription found");
      });
    }
  };

  const addPrescriptionItem = (drug: any) => {
    const newItem = {
      id: crypto.randomUUID(),
      drug_id: drug.id,
      drug_name: drug.name,
      category: drug.category,
      strength: drug.strength,
      instructions: drug.instructions_template || "",
      duration_days: 7,
      eye: "Both",
      food_timing: "After food",
      quantity: 1,
      price: drug.price,
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setShowAddDrug(false);
    setDrugSearch("");
  };

  const removePrescriptionItem = (itemId: string) => {
    setPrescriptionItems(prescriptionItems.filter((item) => item.id !== itemId));
  };

  const toggleFinding = (finding: any, eye: string) => {
    const existing = selectedFindings.find(
      (f) => f.finding_id === finding.id && f.eye === eye
    );
    if (existing) {
      setSelectedFindings(
        selectedFindings.filter((f) => !(f.finding_id === finding.id && f.eye === eye))
      );
    } else {
      setSelectedFindings([
        ...selectedFindings,
        { finding_id: finding.id, name: finding.name, eye },
      ]);
    }
  };

  const toggleDiagnosis = (diagnosis: any, eye: string) => {
    const existing = selectedDiagnosis.find(
      (d) => d.diagnosis_id === diagnosis.id && d.eye === eye
    );
    if (existing) {
      setSelectedDiagnosis(
        selectedDiagnosis.filter((d) => !(d.diagnosis_id === diagnosis.id && d.eye === eye))
      );
    } else {
      setSelectedDiagnosis([
        ...selectedDiagnosis,
        { diagnosis_id: diagnosis.id, name: diagnosis.name, icd_code: diagnosis.icd_code, eye },
      ]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const consultationData = {
        appointmentId: appointmentId!,
        patientId: appointment.patientId.toString(),
        patientName: appointment.patientName,
        consultantId: appointment.consultantId?.toString() || "",
        consultantName: appointment.consultantName || "General",
        consultationDate: new Date().toISOString().split("T")[0],

        // Clinical findings
        chiefComplaint: selectedFindings.map((f) => `${f.name} - ${f.eye}`).join(", ") + (customFindings ? "; " + customFindings : ""),
        diagnosis: selectedDiagnosis.map((d) => `${d.name} - ${d.eye}`).join(", ") + (customDiagnosis ? "; " + customDiagnosis : ""),
        presentIllness: examinationNotes,
        treatment: treatmentPlan,
        advice: selectedAdvice.join(", "),

        status: "IN_PROGRESS",
      };

      let consultationId = consultation?.id;

      if (consultation) {
        // Update existing consultation
        await consultationService.updateConsultation(consultation.id, consultationData);
      } else {
        // Create new consultation
        const newConsult = await consultationService.createConsultation(consultationData);
        setConsultation(newConsult);
        consultationId = newConsult.id;
      }

      // Save prescription
      if (prescriptionItems.length > 0 && consultationId) {
        const medications = prescriptionItems.map((item) => ({
          medicineName: item.drug_name,
          dosage: item.strength || "As prescribed",
          frequency: item.instructions || "As directed",
          duration: `${item.duration_days} days`,
          instructions: item.instructions,
          eye: item.eye,
        }));

        const prescriptionData = {
          consultationId: consultationId,
          patientId: appointment.patientId.toString(),
          patientName: appointment.patientName,
          consultantId: appointment.consultantId?.toString() || "",
          consultantName: appointment.consultantName || "General",
          prescriptionDate: new Date().toISOString().split("T")[0],
          medications: medications,
          isValid: true,
        };

        if (prescription) {
          // Update existing prescription
          await consultationService.updatePrescription(prescription.id, prescriptionData);
        } else {
          // Create new prescription
          const newPrescription = await consultationService.createPrescription(prescriptionData);
          setPrescription(newPrescription);
        }
      }

      toast({
        title: "Consultation saved",
        description: "Progress has been saved successfully",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save consultation data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Save first
      await handleSave();

      // Complete the consultation
      if (consultation?.id) {
        await consultationService.completeConsultation(consultation.id);
      }

      // Determine next status
      let newStatus = "COMPLETED";
      if (referBackToOptometry) {
        newStatus = "IN_OPTOMETRY";
      } else if (crossReferTo) {
        newStatus = "IN_CONSULTATION";
      }

      // Update appointment status
      await appointmentService.updateAppointmentStatus(
        Number(appointmentId),
        newStatus
      );

      toast({
        title: "Consultation completed",
        description: "Patient consultation has been completed",
      });

      navigate("/doctor");
    } catch (error: any) {
      console.error("Complete error:", error);
      toast({
        title: "Failed to complete",
        description: error.message || "Failed to complete consultation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDrugs = allDrugs.filter((drug) =>
    drug.name.toLowerCase().includes(drugSearch.toLowerCase())
  );

  if (loading || !appointment) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <div>
              <h1 className="text-xl font-semibold">Doctor Consultation</h1>
              <p className="text-sm text-muted-foreground">
                Token #{appointment.tokenNumber} - {appointment.patient?.full_name || appointment.patientName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/doctor")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {optometryExam && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Optometry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Optometry Examination</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {optometryExam.chiefComplaint && (
                      <div>
                        <Label className="font-semibold">Chief Complaints:</Label>
                        <p className="text-sm">{optometryExam.chiefComplaint}</p>
                      </div>
                    )}
                    {(optometryExam.rightEyeSphere !== undefined || optometryExam.leftEyeSphere !== undefined) && (
                      <div>
                        <Label className="font-semibold">Refraction:</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <div>
                            <span className="text-muted-foreground">Right:</span> SPH{" "}
                            {optometryExam.rightEyeSphere || "-"}, CYL{" "}
                            {optometryExam.rightEyeCylinder || "-"}, AXIS{" "}
                            {optometryExam.rightEyeAxis || "-"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Left:</span> SPH{" "}
                            {optometryExam.leftEyeSphere || "-"}, CYL{" "}
                            {optometryExam.leftEyeCylinder || "-"}, AXIS{" "}
                            {optometryExam.leftEyeAxis || "-"}
                          </div>
                        </div>
                      </div>
                    )}
                    {(optometryExam.iopRightEye || optometryExam.iopLeftEye) && (
                      <div>
                        <Label className="font-semibold">IOP:</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <div>Right: {optometryExam.iopRightEye || "-"} mmHg</div>
                          <div>Left: {optometryExam.iopLeftEye || "-"} mmHg</div>
                        </div>
                      </div>
                    )}
                    {optometryExam.notes && (
                      <div>
                        <Label className="font-semibold">Remarks:</Label>
                        <p className="text-sm">{optometryExam.notes}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button onClick={handleComplete} disabled={isSaving}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Consultation
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Patient Info */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">UHID:</span>
              <span className="ml-2 font-medium">{appointment.patient?.uhid || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Age/Gender:</span>
              <span className="ml-2 font-medium">
                {appointment.patient?.age || "N/A"} / {appointment.patient?.gender || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mobile:</span>
              <span className="ml-2 font-medium">{appointment.patient?.mobile || appointment.patientPhone}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="secondary" className="ml-2">
                {appointment.appointmentType}
              </Badge>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="findings">Findings & Diagnosis</TabsTrigger>
            <TabsTrigger value="prescription">
              Prescription ({prescriptionItems.length})
            </TabsTrigger>
            <TabsTrigger value="advice">Advice</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          {/* Findings & Diagnosis */}
          <TabsContent value="findings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <Label className="text-base font-semibold mb-4 block">Clinical Findings</Label>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {allFindings.map((finding) => (
                    <div key={finding.id} className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded">
                      <span className="flex-1 text-sm">{finding.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={
                            selectedFindings.some(
                              (f) => f.finding_id === finding.id && f.eye === "Right"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleFinding(finding, "Right")}
                          className="px-2 h-7"
                        >
                          R
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedFindings.some(
                              (f) => f.finding_id === finding.id && f.eye === "Left"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleFinding(finding, "Left")}
                          className="px-2 h-7"
                        >
                          L
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedFindings.some(
                              (f) => f.finding_id === finding.id && f.eye === "Both"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleFinding(finding, "Both")}
                          className="px-2 h-7"
                        >
                          B
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Textarea
                  placeholder="Custom findings..."
                  value={customFindings}
                  onChange={(e) => setCustomFindings(e.target.value)}
                  rows={3}
                />
              </Card>

              <Card className="p-6">
                <Label className="text-base font-semibold mb-4 block">Diagnosis</Label>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {allDiagnosis.map((dx) => (
                    <div key={dx.id} className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{dx.name}</span>
                        {dx.icd_code && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({dx.icd_code})
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={
                            selectedDiagnosis.some(
                              (d) => d.diagnosis_id === dx.id && d.eye === "Right"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleDiagnosis(dx, "Right")}
                          className="px-2 h-7"
                        >
                          R
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedDiagnosis.some(
                              (d) => d.diagnosis_id === dx.id && d.eye === "Left"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleDiagnosis(dx, "Left")}
                          className="px-2 h-7"
                        >
                          L
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            selectedDiagnosis.some(
                              (d) => d.diagnosis_id === dx.id && d.eye === "Both"
                            )
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleDiagnosis(dx, "Both")}
                          className="px-2 h-7"
                        >
                          B
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Textarea
                  placeholder="Custom diagnosis..."
                  value={customDiagnosis}
                  onChange={(e) => setCustomDiagnosis(e.target.value)}
                  rows={3}
                />
              </Card>
            </div>

            <Card className="p-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="examNotes">Examination Notes</Label>
                  <Textarea
                    id="examNotes"
                    value={examinationNotes}
                    onChange={(e) => setExaminationNotes(e.target.value)}
                    placeholder="Detailed examination findings..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                  <Textarea
                    id="treatmentPlan"
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Recommended treatment approach..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Prescription */}
          <TabsContent value="prescription">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Prescription Items</Label>
                <Dialog open={showAddDrug} onOpenChange={setShowAddDrug}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Medication</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search medications..."
                          value={drugSearch}
                          onChange={(e) => setDrugSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredDrugs.map((drug) => (
                          <div
                            key={drug.id}
                            className="flex items-center justify-between p-3 hover:bg-muted/30 rounded cursor-pointer"
                            onClick={() => addPrescriptionItem(drug)}
                          >
                            <div>
                              <div className="font-medium">{drug.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {drug.strength} - {drug.category}
                                {drug.price && ` - Rs.${drug.price}`}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              Stock: {drug.available_quantity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {prescriptionItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No medications added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptionItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{item.drug_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.strength} - {item.category}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescriptionItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Instructions</Label>
                          <Input
                            value={item.instructions}
                            onChange={(e) => {
                              const updated = prescriptionItems.map((i) =>
                                i.id === item.id ? { ...i, instructions: e.target.value } : i
                              );
                              setPrescriptionItems(updated);
                            }}
                            placeholder="e.g., 1 drop BD"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration (days)</Label>
                          <Input
                            type="number"
                            value={item.duration_days}
                            onChange={(e) => {
                              const updated = prescriptionItems.map((i) =>
                                i.id === item.id
                                  ? { ...i, duration_days: parseInt(e.target.value) }
                                  : i
                              );
                              setPrescriptionItems(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Eye</Label>
                          <Select
                            value={item.eye}
                            onValueChange={(value) => {
                              const updated = prescriptionItems.map((i) =>
                                i.id === item.id ? { ...i, eye: value } : i
                              );
                              setPrescriptionItems(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Both">Both Eyes</SelectItem>
                              <SelectItem value="Right">Right Eye</SelectItem>
                              <SelectItem value="Left">Left Eye</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Advice */}
          <TabsContent value="advice">
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">Patient Advice</Label>
              <div className="grid grid-cols-2 gap-3">
                {allAdvice.map((advice) => (
                  <div key={advice.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={advice.id}
                      checked={selectedAdvice.includes(advice.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAdvice([...selectedAdvice, advice.name]);
                        } else {
                          setSelectedAdvice(selectedAdvice.filter((a) => a !== advice.name));
                        }
                      }}
                    />
                    <label htmlFor={advice.id} className="text-sm font-medium leading-none">
                      {advice.name}
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Referrals */}
          <TabsContent value="referrals">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="referOptometry"
                    checked={referBackToOptometry}
                    onCheckedChange={(checked) => setReferBackToOptometry(checked as boolean)}
                  />
                  <label htmlFor="referOptometry" className="text-base font-semibold">
                    Refer back to Optometry
                  </label>
                </div>
                {referBackToOptometry && (
                  <Textarea
                    placeholder="Instructions for optometry re-examination..."
                    value={optometryInstructions}
                    onChange={(e) => setOptometryInstructions(e.target.value)}
                    rows={4}
                  />
                )}
              </Card>

              <Card className="p-6">
                <Label className="text-base font-semibold mb-4 block">
                  Cross-consultation Referral
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="crossRefer">Refer to Consultant</Label>
                    <Select value={crossReferTo} onValueChange={setCrossReferTo}>
                      <SelectTrigger id="crossRefer">
                        <SelectValue placeholder="Select consultant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {consultants.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.id}>
                            {consultant.name} - {consultant.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {crossReferTo && (
                    <div>
                      <Label htmlFor="crossReferRemarks">Referral Remarks</Label>
                      <Textarea
                        id="crossReferRemarks"
                        placeholder="Reason for cross-consultation..."
                        value={crossReferRemarks}
                        onChange={(e) => setCrossReferRemarks(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorConsultation;
