import { useState } from "react";
import { DailyPairing } from "./pages/DailyPairing";
import { Journal } from "./pages/Journal";
import { ThoughtSorter } from "./pages/ThoughtSorter";
import { Settings } from "./pages/Settings";
import { BottomNav, type NavTab } from "./components/BottomNav";

const TABS: NavTab[] = [
  { id: "today", label: "Today" },
  { id: "journal", label: "Journal" },
  { id: "sort", label: "Sort" },
  { id: "settings", label: "Settings" },
];

function formattedToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function App() {
  const [activeTab, setActiveTab] = useState("today");

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
        {activeTab === "settings" && <Settings />}
      </main>
      <BottomNav tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  );
}

export default App;
