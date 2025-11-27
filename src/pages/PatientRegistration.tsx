import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { patientService } from "@/services/patientService";
import { appointmentService } from "@/services/appointmentService";
import { apiClient } from "@/services/api";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [appointmentType, setAppointmentType] = useState("NEW");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Fetch consultants
      const consultantsResponse = await apiClient.get('/api/v1/consultants', {
        params: { isActive: true }
      });
      setConsultants(consultantsResponse.data || []);

      // Fetch departments
      const departmentsResponse = await apiClient.get('/api/v1/departments', {
        params: { isActive: true }
      });
      setDepartments(departmentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
      toast({
        title: "Error",
        description: "Failed to load consultants and departments",
        variant: "destructive",
      });
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user's branch from localStorage
      const currentUser = user;
      if (!currentUser || !currentUser.branchId) {
        throw new Error("User branch information is missing");
      }

      // Calculate age from date of birth
      const age = dateOfBirth ? calculateAge(dateOfBirth) : 0;

      // Create patient record
      const patientData = {
        title,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber: mobile,
        email: email || undefined,
        address,
        city,
        state,
        pincode,
        occupation: occupation || undefined,
        branchId: currentUser.branchId,
        isTemporary: false
      };

      const patient = await patientService.createPatient(patientData);

      // Create appointment for today
      const today = new Date().toISOString().split("T")[0];
      const appointmentData = {
        patientId: parseInt(patient.id),
        consultantId: consultantId ? parseInt(consultantId) : undefined,
        departmentId: departmentId ? parseInt(departmentId) : undefined,
        appointmentDate: today,
        appointmentType: appointmentType as 'NEW' | 'FOLLOWUP' | 'EMERGENCY' | 'ROUTINE',
        notes: "Walk-in registration",
        isEmergency: false
      };

      const appointment = await appointmentService.createAppointment(appointmentData);

      toast({
        title: "Patient registered successfully",
        description: `UHID: ${patient.uhid}, Token: ${appointment.token}`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || error.message || "Failed to register patient",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Patient Registration</h1>
            <p className="text-muted-foreground mt-2">Register new patient and create appointment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Select value={title} onValueChange={setTitle} required>
                    <SelectTrigger id="title">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Baby">Baby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Engineer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Patient Photo (Optional)</Label>
                <Button type="button" variant="outline" className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-semibold">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultant">Consultant</Label>
                  <Select value={consultantId} onValueChange={setConsultantId}>
                    <SelectTrigger id="consultant">
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultants.map((consultant) => (
                        <SelectItem key={consultant.id} value={consultant.id.toString()}>
                          {consultant.fullName} {consultant.specialization && `- ${consultant.specialization}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger id="appointmentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New Patient</SelectItem>
                      <SelectItem value="FOLLOWUP">Follow-up</SelectItem>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> UHID and Token number will be auto-generated upon registration.
                  Patient will be checked-in automatically and added to today's appointment queue.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register & Create Appointment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PatientRegistration;
