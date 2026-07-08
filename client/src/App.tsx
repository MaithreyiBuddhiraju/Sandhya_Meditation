import { DailyPairing } from "./pages/DailyPairing";

function formattedToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__title">Sandhya</div>
        <div className="app-header__date">{formattedToday()}</div>
      </header>
      <main className="app-main">
        <DailyPairing />
      </main>
    </div>
  );
}

export default App;
