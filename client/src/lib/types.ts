export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  ipAddress?: string;
  ipLocation?: string;
  createdAt?: Date;
}

export interface Admin {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Admin | null;
  isLoading: boolean;
}

export interface SortConfig {
  key: keyof User | "";
  direction: "asc" | "desc";
}

export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  isLoading: boolean;
  sortConfig: SortConfig;
  onSort: (key: keyof User) => void;
}

export interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export interface AdminControlsProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onExport: () => void;
  searchValue: string;
  filterValue: string;
  isExporting: boolean;
}

export interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  isSubmitting: boolean;
}

export interface DeleteConfirmModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export interface SuccessModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}
