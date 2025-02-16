import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecretSantaForm from "./SecretSantaForm";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SecretSantaForm", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it("displays an error when form is submitted without selecting files", async () => {
    render(<SecretSantaForm />);
    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);
    await waitFor(() => {
      expect(screen.getByText(/please select both files/i)).toBeInTheDocument();
    });
  });

  it("submits form and displays preview on success", async () => {
    // Create a fake CSV string and blob.
    const fakeCSV = "col1,col2\nval1,val2";
    const blob = new Blob([fakeCSV], { type: "text/csv" });
    // Polyfill the text() method on the blob.
    blob.text = () => Promise.resolve(fakeCSV);

    mockedAxios.post.mockResolvedValue({ data: blob });

    render(<SecretSantaForm />);

    // Create dummy CSV files.
    const file1 = new File(["dummy content"], "file1.csv", {
      type: "text/csv",
    });
    const file2 = new File(["dummy content"], "file2.csv", {
      type: "text/csv",
    });

    // Simulate file selection for both file inputs.
    const currentInput = screen.getByLabelText(
      /Current Participants CSV/i
    ) as HTMLInputElement;
    const previousInput = screen.getByLabelText(
      /Previous Pairings CSV/i
    ) as HTMLInputElement;

    fireEvent.change(currentInput, { target: { files: [file1] } });
    fireEvent.change(previousInput, { target: { files: [file2] } });

    // Click the generate button.
    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    // Wait for axios call and for preview to appear.
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());

    // Check that the preview heading is rendered.
    await waitFor(() => {
      expect(screen.getByText(/CSV Preview/i)).toBeInTheDocument();
    });
  });
});
