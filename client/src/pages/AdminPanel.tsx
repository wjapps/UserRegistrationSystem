import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, SortConfig } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import UserTable from "@/components/UserTable";
import AdminControls from "@/components/AdminControls";
import EditUserModal from "@/components/EditUserModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import SuccessModal from "@/components/SuccessModal";

export default function AdminPanel() {
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // States for modals and success messages
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // States for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "id",
    direction: "asc",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch users
  const { data: users = [], isLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });
  
  // Log data for debugging
  console.log("Successfully fetched users:", users);
  
  // Debug information
  console.log("Auth state:", { isAuthenticated, authLoading, user });
  console.log("Users data:", { users, isLoading, usersError });

  // Edit user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (user: User) => {
      const res = await apiRequest("PUT", `/api/users/${user.id}`, user);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowEditModal(false);
      setSuccessMessage("User updated successfully!");
      setShowSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowDeleteModal(false);
      setSuccessMessage("User deleted successfully!");
      setShowSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Export users mutation
  const exportUsersMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/export/users", {
        method: "GET",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to export users");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export users",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter: string) => {
    setFilterOption(filter);
  };

  const handleSort = (key: keyof User) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (userId: number) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    updateUserMutation.mutate(updatedUser);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId !== null) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  const handleExport = () => {
    exportUsersMutation.mutate();
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
  };

  // Process users data for display (filtering, sorting)
  const processUsersData = (): User[] => {
    // If users is not an array or is empty, return empty array
    if (!Array.isArray(users) || users.length === 0) {
      console.log("No users data available to process");
      return [];
    }

    console.log("Processing users data:", users);

    // Filter users based on search query and filter option
    let filteredUsers = users;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredUsers = users.filter(
        (user: User) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.mobile.toLowerCase().includes(query) ||
          user.address.toLowerCase().includes(query)
      );
    }

    if (filterOption === "recent") {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      filteredUsers = filteredUsers.filter((user: User) => {
        if (!user.createdAt) return false;
        const createdDate = new Date(user.createdAt);
        return createdDate > twentyFourHoursAgo;
      });
    }

    // Sort users
    if (sortConfig.key !== "") {
      filteredUsers = [...filteredUsers].sort((a: User, b: User) => {
        const key = sortConfig.key as keyof User;
        
        // Handle special case for dates
        if (key === 'createdAt') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        
        // Handle normal string/number comparisons
        const aValue = String(a[key] || '');
        const bValue = String(b[key] || '');
        
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      });
    }

    return filteredUsers;
  };

  const processedUsers = processUsersData();
  console.log("Processed users for display:", processedUsers);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl font-semibold mb-2 md:mb-0">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {user && <span className="text-sm text-gray-300">{user.username}</span>}
            <button 
              onClick={() => logout()} 
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminControls
          onSearch={handleSearch}
          onFilter={handleFilter}
          onExport={handleExport}
          searchValue={searchQuery}
          filterValue={filterOption}
          isExporting={exportUsersMutation.isPending}
        />

        <div className="mt-6">
          <UserTable
            users={processedUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>
      </main>

      <EditUserModal
        user={editUser}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateUser}
        isSubmitting={updateUserMutation.isPending}
      />

      <DeleteConfirmModal
        userId={deleteUserId}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteUserMutation.isPending}
      />

      <SuccessModal
        message={successMessage}
        isOpen={showSuccess}
        onClose={closeSuccessModal}
      />
    </div>
  );
}
