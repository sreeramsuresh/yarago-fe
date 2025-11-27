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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Save, Send, Clock, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { appointmentService } from "@/services/appointmentService";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";

// Mock master data - replace with API calls when endpoints are available
const MOCK_CHIEF_COMPLAINTS = [
  { id: "1", name: "Blurred vision", is_active: true },
  { id: "2", name: "Eye pain", is_active: true },
  { id: "3", name: "Headache", is_active: true },
  { id: "4", name: "Redness", is_active: true },
  { id: "5", name: "Watering", is_active: true },
  { id: "6", name: "Double vision", is_active: true },
  { id: "7", name: "Floaters", is_active: true },
  { id: "8", name: "Difficulty reading", is_active: true },
];

const MOCK_MEDICAL_HISTORY = [
  { id: "1", name: "Diabetes", is_active: true },
  { id: "2", name: "Hypertension", is_active: true },
  { id: "3", name: "Thyroid disorder", is_active: true },
  { id: "4", name: "Heart disease", is_active: true },
  { id: "5", name: "Previous eye surgery", is_active: true },
  { id: "6", name: "Glaucoma", is_active: true },
  { id: "7", name: "Cataract", is_active: true },
];

const OptometryExamination = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);
  const [examination, setExamination] = useState<any>(null);
  const [chiefComplaints, setChiefComplaints] = useState<any[]>(MOCK_CHIEF_COMPLAINTS);
  const [medicalHistoryItems, setMedicalHistoryItems] = useState<any[]>(MOCK_MEDICAL_HISTORY);

  // Form state
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [customComplaints, setCustomComplaints] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dominantEye, setDominantEye] = useState("Right");

  // Refraction data
  const [undilatedRefraction, setUndilatedRefraction] = useState({
    right: { sph: "", cyl: "", axis: "", vision: "" },
    left: { sph: "", cyl: "", axis: "", vision: "" },
  });

  // Additional tests
  const [iopRight, setIopRight] = useState("");
  const [iopLeft, setIopLeft] = useState("");
  const [colorVision, setColorVision] = useState("");

  // Dilation
  const [isDilationStarted, setIsDilationStarted] = useState(false);
  const [dilationTimer, setDilationTimer] = useState(0);
  const [dilationEyeDrops, setDilationEyeDrops] = useState("");
  const [dilationInstructions, setDilationInstructions] = useState("");
  const [dilationStartTime, setDilationStartTime] = useState<string | null>(null);

  // Remarks
  const [remarksForDoctor, setRemarksForDoctor] = useState("");

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDilationStarted) {
      interval = setInterval(() => {
        setDilationTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDilationStarted]);

  const fetchData = async () => {
    try {
      // Fetch appointment details
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

      // Try to fetch existing examination
      try {
        const examData = await consultationService.getOptometryExam(appointmentId!);
        if (examData) {
          setExamination(examData);
          loadExaminationData(examData);
        }
      } catch (error) {
        console.log("No existing examination found");
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

  const loadExaminationData = (exam: any) => {
    // Load chief complaints
    if (exam.chiefComplaint) {
      const complaints = exam.chiefComplaint.split(",").map((c: string) => c.trim());
      setSelectedComplaints(complaints);
    }

    setCustomComplaints(exam.notes || "");

    // Load medical history from notes if structured
    setFamilyHistory(exam.pastHistory || "");
    setAllergies(exam.allergies || "");
    setDominantEye("Right"); // Default

    // Load IOP
    setIopRight(exam.iopRightEye?.toString() || "");
    setIopLeft(exam.iopLeftEye?.toString() || "");

    setColorVision(exam.colorVision || "");
    setRemarksForDoctor(exam.notes || "");

    // Load refraction
    if (exam.rightEyeSphere !== undefined || exam.leftEyeSphere !== undefined) {
      setUndilatedRefraction({
        right: {
          sph: exam.rightEyeSphere?.toString() || "",
          cyl: exam.rightEyeCylinder?.toString() || "",
          axis: exam.rightEyeAxis?.toString() || "",
          vision: exam.rightEyeVision || "",
        },
        left: {
          sph: exam.leftEyeSphere?.toString() || "",
          cyl: exam.leftEyeCylinder?.toString() || "",
          axis: exam.leftEyeAxis?.toString() || "",
          vision: exam.leftEyeVision || "",
        },
      });
    }

    // Handle dilation if already started
    if (exam.dilationStartedAt) {
      setIsDilationStarted(true);
      setDilationStartTime(exam.dilationStartedAt);
      const elapsed = Math.floor(
        (new Date().getTime() - new Date(exam.dilationStartedAt).getTime()) / 1000
      );
      setDilationTimer(elapsed);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const examinationData = {
        appointmentId: appointmentId!,
        patientId: appointment.patientId.toString(),
        patientName: appointment.patientName,
        examinationDate: new Date().toISOString().split("T")[0],
        performedBy: user?.userId || user?.id || "",
        performedByName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),

        // Vision and refraction
        visualAcuityRightEye: undilatedRefraction.right.vision,
        visualAcuityLeftEye: undilatedRefraction.left.vision,
        rightEyeSphere: undilatedRefraction.right.sph ? parseFloat(undilatedRefraction.right.sph) : undefined,
        rightEyeCylinder: undilatedRefraction.right.cyl ? parseFloat(undilatedRefraction.right.cyl) : undefined,
        rightEyeAxis: undilatedRefraction.right.axis ? parseFloat(undilatedRefraction.right.axis) : undefined,
        rightEyeVision: undilatedRefraction.right.vision,
        leftEyeSphere: undilatedRefraction.left.sph ? parseFloat(undilatedRefraction.left.sph) : undefined,
        leftEyeCylinder: undilatedRefraction.left.cyl ? parseFloat(undilatedRefraction.left.cyl) : undefined,
        leftEyeAxis: undilatedRefraction.left.axis ? parseFloat(undilatedRefraction.left.axis) : undefined,
        leftEyeVision: undilatedRefraction.left.vision,

        // IOP
        iopRightEye: iopRight ? parseFloat(iopRight) : undefined,
        iopLeftEye: iopLeft ? parseFloat(iopLeft) : undefined,

        // Clinical data
        chiefComplaint: selectedComplaints.join(", ") + (customComplaints ? "; " + customComplaints : ""),
        pastHistory: selectedHistory.join(", ") + (familyHistory ? "; " + familyHistory : ""),
        allergies: allergies || undefined,
        colorVision: colorVision || undefined,
        notes: remarksForDoctor,

        status: "IN_PROGRESS",
      };

      if (examination) {
        // Update existing examination
        await consultationService.updateOptometryExam(examination.id, examinationData);
      } else {
        // Create new examination
        const newExam = await consultationService.createOptometryExam(examinationData);
        setExamination(newExam);
      }

      toast({
        title: "Examination saved",
        description: "Progress has been saved successfully",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save examination data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToDoctor = async () => {
    setIsSaving(true);
    try {
      // Save first
      await handleSave();

      // Complete the examination
      if (examination?.id) {
        await consultationService.completeOptometryExam(examination.id);
      }

      // Update appointment status to IN-CONSULTATION
      await appointmentService.updateAppointmentStatus(
        Number(appointmentId),
        "IN_CONSULTATION"
      );

      toast({
        title: "Sent to doctor",
        description: "Patient moved to consultation queue",
      });

      navigate("/optometry");
    } catch (error: any) {
      console.error("Send to doctor error:", error);
      toast({
        title: "Failed to send",
        description: error.message || "Failed to send patient to doctor",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startDilation = () => {
    setIsDilationStarted(true);
    setDilationTimer(0);
    setDilationStartTime(new Date().toISOString());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
              <h1 className="text-xl font-semibold">Optometry Examination</h1>
              <p className="text-sm text-muted-foreground">
                Token #{appointment.tokenNumber} - {appointment.patient?.full_name || appointment.patientName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/optometry")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button onClick={handleSendToDoctor} disabled={isSaving}>
              <Send className="h-4 w-4 mr-2" />
              Send to Doctor
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Patient Info Banner */}
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
              <span className="text-muted-foreground">Consultant:</span>
              <span className="ml-2 font-medium">{appointment.consultant?.name || appointment.consultantName}</span>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="complaints" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="refraction">Refraction</TabsTrigger>
            <TabsTrigger value="tests">Additional Tests</TabsTrigger>
            <TabsTrigger value="dilation">
              Dilation
              {isDilationStarted && (
                <Badge variant="secondary" className="ml-2 bg-purple-500/10 text-purple-500">
                  {formatTime(dilationTimer)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Complaints Tab */}
          <TabsContent value="complaints">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Chief Complaints
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {chiefComplaints.map((complaint) => (
                      <div key={complaint.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={complaint.id}
                          checked={selectedComplaints.includes(complaint.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedComplaints([...selectedComplaints, complaint.name]);
                            } else {
                              setSelectedComplaints(
                                selectedComplaints.filter((c) => c !== complaint.name)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={complaint.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {complaint.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customComplaints">Custom Complaints</Label>
                  <Textarea
                    id="customComplaints"
                    value={customComplaints}
                    onChange={(e) => setCustomComplaints(e.target.value)}
                    placeholder="Enter any additional complaints..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Medical History
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {medicalHistoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={selectedHistory.includes(item.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedHistory([...selectedHistory, item.name]);
                            } else {
                              setSelectedHistory(
                                selectedHistory.filter((h) => h !== item.name)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium leading-none"
                        >
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="familyHistory">Family History</Label>
                  <Textarea
                    id="familyHistory"
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                    placeholder="Enter family history..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Enter any allergies..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Refraction Tab */}
          <TabsContent value="refraction">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Dominant Eye
                  </Label>
                  <Select value={dominantEye} onValueChange={setDominantEye}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Right">Right</SelectItem>
                      <SelectItem value="Left">Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Undilated Refraction - Right Eye
                  </Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">SPH</Label>
                      <Input
                        value={undilatedRefraction.right.sph}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            right: { ...undilatedRefraction.right, sph: e.target.value },
                          })
                        }
                        placeholder="+0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">CYL</Label>
                      <Input
                        value={undilatedRefraction.right.cyl}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            right: { ...undilatedRefraction.right, cyl: e.target.value },
                          })
                        }
                        placeholder="-0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">AXIS</Label>
                      <Input
                        value={undilatedRefraction.right.axis}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            right: { ...undilatedRefraction.right, axis: e.target.value },
                          })
                        }
                        placeholder="0-180"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vision</Label>
                      <Input
                        value={undilatedRefraction.right.vision}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            right: { ...undilatedRefraction.right, vision: e.target.value },
                          })
                        }
                        placeholder="6/6"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Undilated Refraction - Left Eye
                  </Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">SPH</Label>
                      <Input
                        value={undilatedRefraction.left.sph}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            left: { ...undilatedRefraction.left, sph: e.target.value },
                          })
                        }
                        placeholder="+0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">CYL</Label>
                      <Input
                        value={undilatedRefraction.left.cyl}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            left: { ...undilatedRefraction.left, cyl: e.target.value },
                          })
                        }
                        placeholder="-0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">AXIS</Label>
                      <Input
                        value={undilatedRefraction.left.axis}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            left: { ...undilatedRefraction.left, axis: e.target.value },
                          })
                        }
                        placeholder="0-180"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vision</Label>
                      <Input
                        value={undilatedRefraction.left.vision}
                        onChange={(e) =>
                          setUndilatedRefraction({
                            ...undilatedRefraction,
                            left: { ...undilatedRefraction.left, vision: e.target.value },
                          })
                        }
                        placeholder="6/6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Additional Tests Tab */}
          <TabsContent value="tests">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="iopRight">IOP - Right Eye (mmHg)</Label>
                    <Input
                      id="iopRight"
                      value={iopRight}
                      onChange={(e) => setIopRight(e.target.value)}
                      placeholder="12-21"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iopLeft">IOP - Left Eye (mmHg)</Label>
                    <Input
                      id="iopLeft"
                      value={iopLeft}
                      onChange={(e) => setIopLeft(e.target.value)}
                      placeholder="12-21"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="colorVision">Color Vision Test</Label>
                  <Input
                    id="colorVision"
                    value={colorVision}
                    onChange={(e) => setColorVision(e.target.value)}
                    placeholder="Enter color vision test results..."
                  />
                </div>

                <div>
                  <Label htmlFor="remarksForDoctor">Remarks for Doctor</Label>
                  <Textarea
                    id="remarksForDoctor"
                    value={remarksForDoctor}
                    onChange={(e) => setRemarksForDoctor(e.target.value)}
                    placeholder="Any notes or observations for the consulting doctor..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Dilation Tab */}
          <TabsContent value="dilation">
            <Card className="p-6">
              {!isDilationStarted ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Start Dilation Process</h3>
                  <p className="text-muted-foreground mb-6">
                    Administer eye drops and start the dilation timer
                  </p>

                  <div className="max-w-md mx-auto space-y-4 mb-6">
                    <div>
                      <Label htmlFor="dilationDrops">Eye Drops Used</Label>
                      <Input
                        id="dilationDrops"
                        value={dilationEyeDrops}
                        onChange={(e) => setDilationEyeDrops(e.target.value)}
                        placeholder="e.g., Tropicamide 1%"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dilationInstructions">Instructions</Label>
                      <Textarea
                        id="dilationInstructions"
                        value={dilationInstructions}
                        onChange={(e) => setDilationInstructions(e.target.value)}
                        placeholder="Special instructions..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Button onClick={startDilation} size="lg">
                    <Clock className="h-4 w-4 mr-2" />
                    Start Dilation Timer
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-purple-500/10 mb-4">
                    <Clock className="h-16 w-16 text-purple-500" />
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{formatTime(dilationTimer)}</h3>
                  <p className="text-muted-foreground mb-4">Dilation in progress</p>

                  <div className="max-w-md mx-auto text-left space-y-2 mb-6 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Eye Drops:</span>
                      <span className="ml-2 font-medium">{dilationEyeDrops || "-"}</span>
                    </div>
                    {dilationInstructions && (
                      <div>
                        <span className="text-sm text-muted-foreground">Instructions:</span>
                        <p className="mt-1 text-sm">{dilationInstructions}</p>
                      </div>
                    )}
                  </div>

                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 text-lg px-6 py-2">
                    Patient is dilated
                  </Badge>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OptometryExamination;
