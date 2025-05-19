export interface ModalModel {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
