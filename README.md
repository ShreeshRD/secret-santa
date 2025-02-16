documentation:
-- technologies used: next js, express, jest, supertest
-- how to install and run: 
    npm install
    npm run dev

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
