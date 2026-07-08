import { useEffect, useState } from "react";
import { DailyPairing } from "./pages/DailyPairing";
import { Journal } from "./pages/Journal";
import { ThoughtSorter } from "./pages/ThoughtSorter";
import { Explore } from "./pages/Explore";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { BottomNav, type NavTab } from "./components/BottomNav";
import { authApi } from "./api/auth";

const TABS: NavTab[] = [
  { id: "today", label: "Today" },
  { id: "journal", label: "Journal" },
  { id: "sort", label: "Sort" },
  { id: "explore", label: "Explore" },
  { id: "settings", label: "Settings" },
];

function formattedToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

type AuthState = "checking" | "needs-login" | "authenticated";

function App() {
  const [activeTab, setActiveTab] = useState("today");
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    authApi
      .getStatus()
      .then(({ authRequired, authenticated }) => {
        setAuthState(!authRequired || authenticated ? "authenticated" : "needs-login");
      })
      .catch(() => setAuthState("authenticated")); // fail open locally rather than lock the user out
  }, []);

  if (authState === "checking") return null;
  if (authState === "needs-login") {
    return <Login onSuccess={() => setAuthState("authenticated")} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__title">Sandhya</div>
        <div className="app-header__date">{formattedToday()}</div>
      </header>
      <main className="app-main">
        {activeTab === "today" && <DailyPairing />}
        {activeTab === "journal" && <Journal />}
        {activeTab === "sort" && <ThoughtSorter />}
        {activeTab === "explore" && <Explore />}
        {activeTab === "settings" && (
          <Settings onLogout={() => setAuthState("needs-login")} />
        )}
      </main>
      <BottomNav tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
}

export default App;
