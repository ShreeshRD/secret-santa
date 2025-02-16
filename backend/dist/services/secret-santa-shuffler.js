"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecretSantaPairs = void 0;
const shuffle_utils_1 = require("../utils/shuffle_utils");
const generateSecretSantaPairs = (participants, previousPairings) => {
    try {
        // Convert previous pairings to a Map for O(1) lookups
        const previousPairingMap = new Map(previousPairings.map((pp) => [
            pp.Employee_EmailID,
            pp.Secret_Child_EmailID,
        ]));
        // Step 1: Generate a derangement (no self-pairing)
        const derangement = (0, shuffle_utils_1.generateDerangement)(participants);
        // Step 2: Create initial pairs
        const pairs = new Map(participants.map((giver, i) => [giver, derangement[i]]));
        // Step 3: Resolve conflicts with previous pairings
        const resolvedPairs = (0, shuffle_utils_1.resolveConflicts)(pairs, previousPairingMap);
        // Verify all conflicts are resolved
        const hasConflicts = Array.from(resolvedPairs.entries()).some(([giver, receiver]) => previousPairingMap.get(giver.Employee_EmailID) ===
            receiver.Employee_EmailID);
        if (hasConflicts) {
            throw new Error("Impossible to generate valid pairs due to constraints");
        }
        // Step 4: Convert to the required format
        return Array.from(resolvedPairs.entries()).map(([giver, receiver]) => ({
            Employee_Name: giver.Employee_Name,
            Employee_EmailID: giver.Employee_EmailID,
            Secret_Child_Name: receiver.Employee_Name,
            Secret_Child_EmailID: receiver.Employee_EmailID,
        }));
    }
    catch (error) {
        throw new Error("Failed to generate valid pairs");
    }
};
exports.generateSecretSantaPairs = generateSecretSantaPairs;
