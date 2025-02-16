import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecretSantaForm from "./SecretSantaForm";
import axios from "axios";

jest.spyOn(console, "error").mockImplementation(() => {});

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

  it("handles backend not accessible error", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Network Error"));
    render(<SecretSantaForm />);

    // Create dummy CSV files.
    const file1 = new File(["dummy content"], "file1.csv", {
      type: "text/csv",
    });
    const file2 = new File(["dummy content"], "file2.csv", {
      type: "text/csv",
    });

    const currentInput = screen.getByLabelText(
      /Current Participants CSV/i
    ) as HTMLInputElement;
    const previousInput = screen.getByLabelText(
      /Previous Pairings CSV/i
    ) as HTMLInputElement;
    fireEvent.change(currentInput, { target: { files: [file1] } });
    fireEvent.change(previousInput, { target: { files: [file2] } });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    });
  });

  it("handles CSV corrupted/wrong format error", async () => {
    // Create an empty CSV blob.
    const fakeCSV = "";
    const blob = new Blob([fakeCSV], { type: "text/csv" });
    // Polyfill blob.text
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

    const currentInput = screen.getByLabelText(
      /Current Participants CSV/i
    ) as HTMLInputElement;
    const previousInput = screen.getByLabelText(
      /Previous Pairings CSV/i
    ) as HTMLInputElement;
    fireEvent.change(currentInput, { target: { files: [file1] } });
    fireEvent.change(previousInput, { target: { files: [file2] } });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(
        screen.getByText(/The CSV file is empty or corrupted/i)
      ).toBeInTheDocument();
    });
  });

  it("submits form and displays preview on success", async () => {
    // Create a fake CSV string and blob.
    const fakeCSV = "col1,col2\nval1,val2";
    const blob = new Blob([fakeCSV], { type: "text/csv" });
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

    const currentInput = screen.getByLabelText(
      /Current Participants CSV/i
    ) as HTMLInputElement;
    const previousInput = screen.getByLabelText(
      /Previous Pairings CSV/i
    ) as HTMLInputElement;
    fireEvent.change(currentInput, { target: { files: [file1] } });
    fireEvent.change(previousInput, { target: { files: [file2] } });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());

    await waitFor(() => {
      expect(screen.getByText(/CSV Preview/i)).toBeInTheDocument();
    });
  });
});
