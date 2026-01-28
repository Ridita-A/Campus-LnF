import { useState } from "react";
import { AuthForm } from "@/app/components/AuthForm.jsx";
import { Dashboard } from "@/app/components/Dashboard.jsx";
import { Toaster } from "@/app/components/ui/sonner.jsx";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
