import { useState } from "react";
import classnames from "classnames";

import "./dropdown.css";

interface DropdownProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonLabel: React.ReactNode;
  items: { label: string; onClick: () => void; className?: string }[];
}

export const Dropdown = ({ buttonLabel, items, className }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={classnames("dropdown-button", className)}
      >
        {buttonLabel}
      </div>
      {isOpen && (
        <div className="dropdown-container">
          <ul>
            {items.map((item, index) => (
              <li key={index} className={classnames(item.className)}>
                <button
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
