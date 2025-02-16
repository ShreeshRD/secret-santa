// src/components/PreviewTable.test.tsx
import { render, screen } from "@testing-library/react";
import PreviewTable from "./PreviewTable";

describe("PreviewTable", () => {
  const sampleData = [
    ["Name", "Email"],
    ["John Doe", "john@example.com"],
  ];

  it("renders table rows based on previewData", () => {
    render(<PreviewTable previewData={sampleData} totalRows={2} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(sampleData.length);
  });

  it("displays total rows message when totalRows > 10", () => {
    render(<PreviewTable previewData={sampleData} totalRows={15} />);
    expect(screen.getByText(/Total 15 rows/i)).toBeInTheDocument();
  });
});
