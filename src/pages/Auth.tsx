import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import healthcareTeam from "@/assets/healthcare-team.jpg";
import { authService } from "@/services/authService";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupBranch, setSignupBranch] = useState("");
  const [signupRole, setSignupRole] = useState("reception");

  useEffect(() => {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: loginUsername,
        password: loginPassword,
      });

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.firstName}!`,
      });

      // Redirect to dashboard after successful login
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.register({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        firstName: signupFirstName,
        lastName: signupLastName,
        phoneNumber: signupPhone,
        role: signupRole,
        branchId: signupBranch,
      });

      toast({
        title: "Account created",
        description: "You can now login with your credentials.",
      });

      // Clear form
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupFirstName("");
      setSignupLastName("");
      setSignupPhone("");
      setSignupBranch("");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image and branding */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${healthcareTeam})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <Logo className="mb-8" />
          <h1 className="text-4xl font-bold mb-4">
            Smart, Secure & Streamlined Patient Management
          </h1>
          <p className="text-lg text-white/90">
            A modern platform designed to simplify hospital workflows, improve
            patient care, and provide a seamless experience.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <Card className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Log in to continue delivering care with ease
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="username"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Register to start using the system
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name *</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        value={signupFirstName}
                        onChange={(e) => setSignupFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name *</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        value={signupLastName}
                        onChange={(e) => setSignupLastName(e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="johndoe"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="john@hospital.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role *</Label>
                    <Select value={signupRole} onValueChange={setSignupRole}>
                      <SelectTrigger id="signup-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                        <SelectItem value="optometrist">Optometrist</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="counselor">Counselor</SelectItem>
                        <SelectItem value="ipd_staff">IPD Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-branch">Branch ID *</Label>
                    <Input
                      id="signup-branch"
                      type="text"
                      value={signupBranch}
                      onChange={(e) => setSignupBranch(e.target.value)}
                      placeholder="BRANCH-001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
