// src/components/DownloadButton.tsx
import React from "react";

interface DownloadButtonProps {
  csvBlob: Blob | null;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ csvBlob }) => {
  const handleDownload = () => {
    if (csvBlob) {
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "result.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handleDownload}
        className="w-40 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200"
      >
        Download CSV
      </button>
    </div>
  );
};

export default DownloadButton;
