import { useState, useEffect } from "react";
import { AuthForm } from "@/app/components/AuthForm.jsx";
import { Dashboard } from "@/app/components/Dashboard.jsx";
import { Toaster } from "@/app/components/ui/sonner.jsx";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem("currentSession");
    if (session) {
      setCurrentUser(JSON.parse(session));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentSession", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentSession");
  };

  return (
    <>
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
      <Toaster />
    </>
  );
}
