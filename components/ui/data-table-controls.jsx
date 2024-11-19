import React from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { MagnifyingGlass, FileXls, CaretDown } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const DataTableControls = ({
  // Search related props
  searchTerm,
  onSearchChange,
  searchParameter,
  onSearchParameterChange,
  searchParameters,
  // Column management props
  visibleColumns,
  onColumnChange,
  columnList,
  // Data for export
  data,
  filename = 'export'
}) => {
  const handleExport = () => {
    if (data.length === 0) return;

    // Get all headers from the first data item
    const headers = Object.keys(data[0]);

    // Create CSV content with all columns
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(header =>
          // Handle values that might contain commas
          typeof row[header] === 'string' && row[header].includes(',')
            ? `"${row[header]}"`
            : row[header]
        ).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div className="flex flex-col gap-3 mb-6 lg:flex-row">
      <div className="relative w-full lg:w-96">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlass className="w-5 h-5 text-gray-500" />
        </div>
        <Input
          placeholder={`Search ${searchParameter === 'all' ? '' : `by ${searchParameter.replace(/([A-Z])/g, ' $1').toLowerCase()}`}`.trim()}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-8"
        />
        {searchTerm && (
          <div className="absolute flex justify-center items-center inset-y-0 right-0">
            <Button
              variant="outline"
              className="h-6 text-xs px-1.5 mr-2 rounded"
              onClick={() => onSearchChange("")}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
      <div className="w-full flex justify-between gap-2">
        <Select
          value={searchParameter}
          onValueChange={onSearchParameterChange}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {searchParameters.map(param => (
              <SelectItem key={param.value} value={param.value}>
                {param.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {data.length !== 0 && (
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              onClick={handleExport}
            >
              <FileXls />
              Export
            </Button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap justify-between">
                  Columns
                  <CaretDown className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columnList.map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.value}
                    checked={visibleColumns[column.value]}
                    onCheckedChange={(checked) =>
                      onColumnChange({ ...visibleColumns, [column.value]: checked })
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTableControls;