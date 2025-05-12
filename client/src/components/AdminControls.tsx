import { AdminControlsProps } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileDown, Loader2 } from "lucide-react";

export default function AdminControls({
  onSearch,
  onFilter,
  onExport,
  searchValue,
  filterValue,
  isExporting
}: AdminControlsProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    onFilter(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:w-2/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center sm:w-auto w-full">
            <label htmlFor="filter-status" className="text-sm text-gray-600 mr-2 whitespace-nowrap">
              Filter by:
            </label>
            <Select 
              value={filterValue} 
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]" id="filter-status">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="recent">Recent Registrations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
