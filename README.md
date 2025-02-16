documentation:
-- technologies used: next js, express, jest, supertest
-- how to install and run: 
    npm install
    npm run dev

Note: Some assumptions/choices were made
1) I have opted not to use database
2) Even if the file is empty I have assumed that the headers will be present. Testcase will fail for format if headers are not present.

Frontend:

Test Cases
    FileInput
        Renders correctly: Displays the provided label and default "Choose File" text when no file is selected.
        Handles file selection: Invokes the onChange handler when a file is selected.

    PreviewTable
        Renders CSV data: Displays table rows based on the provided preview data.
        Displays row count: Shows a message indicating total rows when there are more rows than previewed.

    DownloadButton
        Renders download button: Ensures the button is rendered with the proper label.
        Triggers download: Simulates a click to verify that window.URL.createObjectURL is called with the CSV Blob.

    SecretSantaForm (Integration Tests)
        Form validation:
        Displays an error if files are not selected before submission.
        Error handling:
        Simulates backend errors such as network failures and invalid CSV format.
        Converts Blob error responses to JSON so that specific messages (e.g., "Invalid CSV Format") and details are displayed to the user.
        Successful submission:
        Verifies that on success, the CSV preview is rendered and the Download button is available.

Backend:

Uploads folder in backend only consists of csvs of last successful request.

Test Cases
    Successful Pair Generation
    - No previous pairings: Generates valid pairs when no previous assignments exist.
    - Avoid previous pairings: Ensures new pairs don't repeat last year's assignments.
    Input Validation
    - Rejects if only one file is provided.
    - Rejects invalid CSV format.
    - Rejects CSVs with missing headers.
    Edge Cases
    - Accepts exactly 2 participants.
    - Rejects if participants are fewer than 2.
    Conflict Resolution
    - Fails gracefully when no valid pairing is possible due to complete constraint conflicts.
