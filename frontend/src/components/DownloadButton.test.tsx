import { render, screen, fireEvent } from "@testing-library/react";
import DownloadButton from "./DownloadButton";

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = jest.fn(() => "blob:url");
}

describe("DownloadButton", () => {
  it("renders download button", () => {
    render(<DownloadButton csvBlob={null} />);
    expect(screen.getByText(/Download CSV/i)).toBeInTheDocument();
  });

  it("triggers download when clicked if csvBlob is provided", () => {
    const blob = new Blob(["test content"], { type: "text/csv" });
    const createObjectURLSpy = jest.spyOn(window.URL, "createObjectURL");

    render(<DownloadButton csvBlob={blob} />);
    const button = screen.getByText(/Download CSV/i);
    fireEvent.click(button);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    createObjectURLSpy.mockRestore();
  });
});
