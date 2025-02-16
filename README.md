# Secret Santa Pairing Application

## Technologies Used
- Next.js
- Express
- Jest
- Supertest

## Installation and Running the Application

### Backend Setup
```sh
cd backend
npm install
npm run dev
```

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```
### Build and run frontend and backend
```sh
npm run build
npm start
```
### Test frontend and backend
```sh
npm test
```
## Assumptions & Design Choices
1. No database is used.
2. Even if the file is empty, it is assumed that the headers will be present. The test case will fail for format validation if headers are missing.

---

## Frontend

### Component-wise Test Cases
#### `FileInput`
- **Renders correctly**: Displays the provided label and default "Choose File" text when no file is selected.
- **Handles file selection**: Invokes the `onChange` handler when a file is selected.

#### `PreviewTable`
- **Renders CSV data**: Displays table rows based on the provided preview data.
- **Displays row count**: Shows a message indicating total rows when there are more rows than previewed.

#### `DownloadButton`
- **Renders download button**: Ensures the button is rendered with the proper label.
- **Triggers download**: Simulates a click to verify that `window.URL.createObjectURL` is called with the CSV Blob.

#### `SecretSantaForm` (Integration Tests)
- **Form validation**:
  - Displays an error if files are not selected before submission.
- **Error handling**:
  - Simulates backend errors such as network failures and invalid CSV format.
  - Converts Blob error responses to JSON so that specific messages (e.g., "Invalid CSV Format") and details are displayed to the user.
- **Successful submission**:
  - Verifies that on success, the CSV preview is rendered and the Download button is available.

---

## Backend

### Uploads Directory
- The `uploads` folder in the backend only contains CSV files from the last successful request.

### Test Cases
#### **Successful Pair Generation**
- **No previous pairings**: Generates valid pairs when no previous assignments exist.
- **Avoid previous pairings**: Ensures new pairs don't repeat last year's assignments.

#### **Input Validation**
- **Rejects if only one file is provided.**
- **Rejects invalid CSV format.**
- **Rejects CSVs with missing headers.**

#### **Edge Cases**
- **Accepts exactly 2 participants.**
- **Rejects if participants are fewer than 2.**

#### **Conflict Resolution**
- **Fails gracefully when no valid pairing is possible due to complete constraint conflicts.**

---

## Shuffling Algorithm
The Secret Santa shuffling algorithm ensures that participants are assigned a recipient without self-pairing while avoiding previous pairings. The process follows these steps:

1. **Generate a Derangement:**
   - A derangement is a permutation where no element appears in its original position.
   - The algorithm performs a Fisher-Yates shuffle, swapping elements randomly while ensuring no one gets themselves as a recipient.
   - If a self-pairing occurs, the process is retried recursively (though rare).

2. **Initial Pairing:**
   - After generating the derangement, the participants are mapped to their corresponding Secret Santa recipients.

3. **Resolve Conflicts with Previous Pairings:**
   - The algorithm checks for conflicts where a participant is assigned the same recipient as last year.
   - If conflicts exist, the algorithm attempts to swap conflicting recipients with others who also have no conflicts.
   - If an unresolvable conflict exists (e.g., complete constraint conflicts preventing valid pairing), an error is thrown.

4. **Finalizing Pairs:**
   - Once conflicts are resolved, the final Secret Santa pairs are returned.
   - The format includes both participant and recipient details, ensuring a valid pairing structure.

