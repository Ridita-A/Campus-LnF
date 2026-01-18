import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs.jsx";





export function AuthForm({ onLogin }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupStudentId, setSignupStudentId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Get stored users
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === loginEmail && u.password === loginPassword
    )
    if (user) {
      const { password, ...userWithoutPassword } = user;
      onLogin(userWithoutPassword);
    } else {
      setError("Invalid email or password");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (!signupEmail || !signupName || !signupStudentId || !signupPassword) {
      setError("All fields are required");
      return;
    }

    // Get stored users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    if (users.find((u) => u.email === signupEmail)) {
      setError("Email already registered");
      return;
    }

    // Check if student ID already exists
    if (users.find((u) => u.studentId === signupStudentId)) {
      setError("Student ID already registered");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: signupEmail,
      name: signupName,
      studentId: signupStudentId,
      password: signupPassword,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    onLogin(userWithoutPassword);
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
          <Tabs defaultValue="login">
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
