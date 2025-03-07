"use client";

import React, { useState } from "react";
import axios from "axios";
import FileInput from "./FileInput";
import PreviewTable from "./PreviewTable";
import DownloadButton from "./DownloadButton";

const SecretSantaForm = () => {
  const [currentParticipants, setCurrentParticipants] = useState<File | null>(
    null
  );
  const [previousPairings, setPreviousPairings] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [csvBlob, setCSVBlob] = useState<Blob | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setPreviewData([]);
    setTotalRows(0);
    setCSVBlob(null);

    if (!currentParticipants || !previousPairings) {
      setError("Please select both files.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("currentParticipants", currentParticipants);
    formData.append("previousPairings", previousPairings);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/secret-santa",
        formData,
        {
          responseType: "blob",
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const blob = response.data as Blob;
      const csvText = await blob.text();
      const rows = csvText.split("\n").filter((row) => row.trim() !== "");
      if (rows.length === 0) {
        throw new Error("The CSV file is empty or corrupted.");
      }

      setTotalRows(rows.length);
      const previewRows = rows.slice(0, 10).map((row) => row.split(","));
      setPreviewData(previewRows);
      setCSVBlob(blob);
    } catch (err: unknown) {
      let errorMessage = "Failed to process files. Please try again.";
      let details: unknown = null;
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data instanceof Blob) {
          // Convert the Blob to text and parse it as JSON
          try {
            const errorText = await err.response.data.text();
            const errorObj = JSON.parse(errorText);
            errorMessage = errorObj.error || errorObj.message || errorMessage;
            details = errorObj.details || null;
          } catch {
            errorMessage = "Failed to process files. Please try again.";
          }
        } else if (err.response.data) {
          const data = err.response.data as {
            error?: string;
            message?: string;
            details?: unknown;
          };
          errorMessage = data.error || data.message || errorMessage;
          details = data.details || null;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setErrorDetails(details);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentParticipants(null);
    setPreviousPairings(null);
    setPreviewData([]);
    setTotalRows(0);
    setCSVBlob(null);
    setError(null);
    setErrorDetails(null);
  };

  // Form section with heading and file inputs centered.
  const formSection = (
    <div className="w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Secret Santa Pairing
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FileInput
          id="currentParticipants"
          label="Current Participants CSV"
          file={currentParticipants}
          onChange={(e) => handleFileChange(e, setCurrentParticipants)}
        />
        <FileInput
          id="previousPairings"
          label="Previous Pairings CSV"
          file={previousPairings}
          onChange={(e) => handleFileChange(e, setPreviousPairings)}
        />

        {error && (
          <div className="text-red-500 text-sm">
            <p>{error}</p>
            {errorDetails != null && (
              <details className="mt-2 cursor-pointer">
                <summary>More details</summary>
                <pre className="whitespace-pre-wrap text-left">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-4">
          {previewData.length === 0 ? (
            <button
              type="submit"
              disabled={isLoading}
              className="w-40 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Generate"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-40 py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition duration-200"
            >
              Generate another
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const previewSection = (
    <div>
      <PreviewTable previewData={previewData} totalRows={totalRows} />
      <DownloadButton csvBlob={csvBlob} />
    </div>
  );

  return (
    <div
      className={`relative bg-white/80 rounded-lg shadow-lg p-8 transition-all duration-300 ${
        previewData.length > 0 ? "max-w-4xl" : "max-w-md"
      } w-full`}
    >
      {previewData.length > 0 ? (
        <div className="flex flex-col md:flex-row items-center gap-6 transition-all duration-300">
          <div className="md:w-1/2">{formSection}</div>
          <div className="md:w-1/2 border-l border-gray-300 pl-6">
            {previewSection}
          </div>
        </div>
      ) : (
        <div>{formSection}</div>
      )}
    </div>
  );
};

export default SecretSantaForm;
