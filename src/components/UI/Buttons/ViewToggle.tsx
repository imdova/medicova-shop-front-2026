import React from "react";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "grid";
  onChange: (view: "list" | "grid") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  // Clicking the shown button toggles to the other view
  const toggleView = () => {
    onChange(view === "grid" ? "list" : "grid");
  };

  return (
    <div className="h-full border-l border-gray-100 pl-2">
      {view === "list" ? (
        <button
          type="button"
          onClick={toggleView}
          className="flex items-center justify-center rounded-md p-2 text-gray-500"
          aria-label="Grid view (click to switch)"
          title="Grid view (click to switch)"
        >
          <LayoutGrid size={20} />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleView}
          className="flex items-center justify-center rounded-md p-2 text-gray-500"
          aria-label="List view (click to switch)"
          title="List view (click to switch)"
        >
          <List size={20} />
        </button>
      )}
    </div>
  );
};

export default ViewToggle;
