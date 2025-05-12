import { UserTableProps, User } from "@/lib/types";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserTable({ 
  users, 
  onEdit, 
  onDelete, 
  isLoading,
  sortConfig,
  onSort 
}: UserTableProps) {
  const getSortIcon = (column: keyof User) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>IP Location</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("id")}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  {getSortIcon("id")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("email")}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("mobile")}
              >
                <div className="flex items-center space-x-1">
                  <span>Mobile</span>
                  {getSortIcon("mobile")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("ipLocation")}
              >
                <div className="flex items-center space-x-1">
                  <span>IP Location</span>
                  {getSortIcon("ipLocation")}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Registration Date</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>
                  {user.ipAddress ? (
                    <>
                      <span className="text-gray-500">{user.ipAddress}</span>
                      {user.ipLocation && (
                        <span className="block text-xs text-gray-500 mt-1">
                          ({user.ipLocation})
                        </span>
                      )}
                    </>
                  ) : (
                    "Not recorded"
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt 
                    ? format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")
                    : "Unknown date"
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of <span className="font-medium">{users.length}</span> results
        </div>
      </div>
    </div>
  );
}
