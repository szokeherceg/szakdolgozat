import { ModalModel } from "../../models";

import "./../pages.css";

export const Modal = ({ isOpen, onClose, children }: ModalModel) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};
