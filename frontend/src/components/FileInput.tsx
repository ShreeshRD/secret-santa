import React from "react";

interface FileInputProps {
  id: string;
  label: string;
  file: File | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, file, onChange }) => {
  return (
    <div className="text-center">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept=".csv"
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="cursor-pointer inline-block w-48 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition mx-auto"
      >
        {file ? file.name : "Choose File"}
      </label>
    </div>
  );
};

export default FileInput;
