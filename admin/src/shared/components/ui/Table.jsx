import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className={`min-w-full divide-y divide-gray-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', hover = true, ...props }) => {
  const hoverClass = hover ? 'hover:bg-gray-50' : '';
  return (
    <tr className={`${hoverClass} ${className}`} {...props}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = '', header = false, ...props }) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap text-sm';
  const headerClasses = header ? 'font-medium text-gray-500 uppercase tracking-wider' : 'text-gray-900';
  
  return (
    <td className={`${baseClasses} ${headerClasses} ${className}`} {...props}>
      {children}
    </td>
  );
};

const TableHeaderCell = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`} {...props}>
      {children}
    </th>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;

export default Table;
