import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs.jsx";
import { supabase } from "../../supabase";

export function AuthForm({ onLogin }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupStudentId, setSignupStudentId] = useState("");
  const [signupContact, setSignupContact] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // console.log('Attempting login with:', { user_email: loginEmail, user_password: loginPassword });
      const { data, error } = await supabase.rpc('user_login', {
        user_email: loginEmail,
        user_password: loginPassword,
      });

       // console.log('RPC Response - Data:', data);
       // console.log('RPC Response - Error:', error);

      if (error) {
        setError(error.message);
        return;
      }

      if (data && data.length > 0 && data[0].success) {
        // console.log('Login successful, calling onLogin with:', { id: data[0].user_id, email: loginEmail });
        onLogin({ id: data[0].user_id, email: loginEmail });
      } else {
        setError(data && data.length > 0 ? data[0].message : 'Invalid email or password.');
        // console.log('Login failed:', data && data.length > 0 ? data[0].message : 'Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!signupEmail || !signupName || !signupStudentId || !signupContact || !signupPassword) {
      setError("All fields are required");
      return;
    }

    const parsedStudentId = parseInt(signupStudentId, 10);
    if (isNaN(parsedStudentId)) {
      setError("Student ID must be a valid number.");
      return;
    }

    const parsedContact = parseInt(signupContact, 10);
    if (isNaN(parsedContact)) {
      setError("Contact Number must be a valid number.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc('user_signup', {
        user_name: signupName,
        user_contact: parsedContact,
        user_email: signupEmail,
        user_student_id: parsedStudentId, 
        user_password: signupPassword,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // If signup is successful, move to the login tab and clear signup form
      setSignupName("");
      setSignupEmail("");
      setSignupStudentId("");
      setSignupContact("");
      setSignupPassword("");
      setError("Signup successful! Please log in.");
      setActiveTab("login");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Campus Lost & Found</CardTitle>
          <CardDescription>
            Secure system for lost and found items on campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-contact">Contact Number</Label>
                  <Input
                    id="signup-contact"
                    type="number"
                    placeholder="e.g., 1234567890"
                    value={signupContact}
                    onChange={(e) => setSignupContact(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-student-id">Student ID</Label>
                  <Input
                    id="signup-student-id"
                    type="text"
                    placeholder="S12345678"
                    value={signupStudentId}
                    onChange={(e) => setSignupStudentId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
