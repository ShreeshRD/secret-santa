"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConflicts = exports.generateDerangement = void 0;
/**
 * Generates a derangement (permutation with no fixed points) of the participants.
 */
const generateDerangement = (arr) => {
    const derangement = [...arr];
    for (let i = derangement.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i); // Swap with a random index < i
        [derangement[i], derangement[j]] = [derangement[j], derangement[i]];
    }
    // Ensure it's a valid derangement (no self-pairing)
    if (derangement.some((p, i) => p === arr[i])) {
        return (0, exports.generateDerangement)(arr); // Retry recursively (rarely needed)
    }
    return derangement;
};
exports.generateDerangement = generateDerangement;
/**
 * Resolves conflicts with previous pairings by swapping recipients.
 */
const resolveConflicts = (pairs, previousPairings) => {
    const conflictParticipants = Array.from(pairs.entries())
        .filter(([giver, receiver]) => previousPairings.get(giver.Employee_EmailID) ===
        receiver.Employee_EmailID)
        .map(([giver]) => giver);
    for (const giver of conflictParticipants) {
        // Find a participant to swap with
        const swappable = Array.from(pairs.entries()).find(([otherGiver, otherReceiver]) => {
            var _a;
            return otherGiver !== giver &&
                previousPairings.get(otherGiver.Employee_EmailID) !==
                    ((_a = pairs.get(giver)) === null || _a === void 0 ? void 0 : _a.Employee_EmailID) &&
                previousPairings.get(giver.Employee_EmailID) !==
                    otherReceiver.Employee_EmailID;
        });
        if (swappable) {
            const [otherGiver, otherReceiver] = swappable;
            // Swap receivers
            pairs.set(giver, otherReceiver);
            pairs.set(otherGiver, pairs.get(giver));
        }
    }
    return pairs;
};
exports.resolveConflicts = resolveConflicts;
