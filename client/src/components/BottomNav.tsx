import "./BottomNav.css";

export interface NavTab {
  id: string;
  label: string;
}

export function BottomNav({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: NavTab[];
  activeTab: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={
            tab.id === activeTab ? "bottom-nav__button bottom-nav__button--active" : "bottom-nav__button"
          }
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
