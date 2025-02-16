import { render, screen, fireEvent } from "@testing-library/react";
import FileInput from "./FileInput";

describe("FileInput", () => {
  it('renders with the provided label and shows "Choose File" when no file is selected', () => {
    render(
      <FileInput
        id="test-file"
        label="Test File"
        file={null}
        onChange={() => {}}
      />
    );

    expect(screen.getByText(/Test File/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose File/i)).toBeInTheDocument();
  });

  it("calls onChange callback when a file is selected", () => {
    const handleChange = jest.fn();
    render(
      <FileInput
        id="test-file"
        label="Test File"
        file={null}
        onChange={handleChange}
      />
    );

    // Get the hidden file input via its associated label.
    const fileInput = screen.getByLabelText(/Test File/i) as HTMLInputElement;
    const file = new File(["dummy content"], "dummy.csv", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleChange).toHaveBeenCalled();
  });
});
