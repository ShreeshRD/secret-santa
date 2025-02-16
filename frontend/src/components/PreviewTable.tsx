// src/components/PreviewTable.tsx
import React from "react";

interface PreviewTableProps {
  previewData: string[][];
  totalRows: number;
}

const PreviewTable: React.FC<PreviewTableProps> = ({
  previewData,
  totalRows,
}) => {
  return (
    <div className="flex-1">
      <h2 className="text-xl font-bold text-black text-center mb-4">
        CSV Preview
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <tbody>
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="p-2 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {totalRows > 10 && previewData.length > 0 && (
              <tr>
                <td
                  colSpan={previewData[0].length}
                  className="p-2 text-center text-sm text-gray-500"
                >
                  ... (Total {totalRows} rows)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewTable;
