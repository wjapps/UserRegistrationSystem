import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function UsersTestPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  // Direct login function
  const handleDirectLogin = async () => {
    try {
      await login({ username: "admin", password: "password" });
      toast({
        title: "Logged in successfully",
        description: "Attempting to fetch users...",
      });
      fetchUsers();
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Direct API fetch
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching users directly...");
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      toast({
        title: "Error fetching users",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Users Test Page</h1>
      
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={handleDirectLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login as Admin
        </button>
        
        <button 
          onClick={fetchUsers}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Fetch Users Directly
        </button>
        
        <button
          onClick={() => setLocation('/admin')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Go to Admin Panel
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Data:</h2>
        
        {loading && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && users.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            No users found. This could be due to authentication issues or empty database.
          </div>
        )}
        
        {!loading && users.length > 0 && (
          <div>
            <p className="mb-2 text-green-600 font-semibold">Found {users.length} users:</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Logged In' : 'Not Logged In'}</p>
        <p><strong>User Count:</strong> {users.length}</p>
      </div>
    </div>
  );
}