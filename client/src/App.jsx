
import { useState } from "react";
import Auth from "./Auth/Auth";
import Website from "./Code/Website";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lifebudget-session")
      );
    } catch {
      return null;
    }
  });

  function handleLogin(userData) {
    const session = {
      name: userData.name,
      email: userData.email,
    };

    localStorage.setItem(
      "lifebudget-session",
      JSON.stringify(session)
    );

    setUser(session);
  }

  function handleLogout() {
    localStorage.removeItem("lifebudget-session");
    setUser(null);
  }

  return user ? (
    <Website user={user} onLogout={handleLogout} />
  ) : (
    <Auth onLogin={handleLogin} />
  );
}

export default App;
