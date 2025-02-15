import { Participant } from "../types/participant";

/**
 * Generates a derangement (permutation with no fixed points) of the participants.
 */
export const generateDerangement = <T>(arr: T[]): T[] => {
  const derangement = [...arr];
  for (let i = derangement.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // Swap with a random index < i
    [derangement[i], derangement[j]] = [derangement[j], derangement[i]];
  }
  // Ensure it's a valid derangement (no self-pairing)
  if (derangement.some((p, i) => p === arr[i])) {
    return generateDerangement(arr); // Retry recursively (rarely needed)
  }
  return derangement;
};

/**
 * Resolves conflicts with previous pairings by swapping recipients.
 */
export const resolveConflicts = (
  pairs: Map<Participant, Participant>,
  previousPairings: Map<string, string>
): Map<Participant, Participant> => {
  const conflictParticipants = Array.from(pairs.entries())
    .filter(
      ([giver, receiver]) =>
        previousPairings.get(giver.Employee_EmailID) ===
        receiver.Employee_EmailID
    )
    .map(([giver]) => giver);

  for (const giver of conflictParticipants) {
    // Find a participant to swap with
    const swappable = Array.from(pairs.entries()).find(
      ([otherGiver, otherReceiver]) =>
        otherGiver !== giver &&
        previousPairings.get(otherGiver.Employee_EmailID) !==
          pairs.get(giver)?.Employee_EmailID &&
        previousPairings.get(giver.Employee_EmailID) !==
          otherReceiver.Employee_EmailID
    );

    if (swappable) {
      const [otherGiver, otherReceiver] = swappable;
      // Swap receivers
      pairs.set(giver, otherReceiver);
      pairs.set(otherGiver, pairs.get(giver)!);
    }
  }

  return pairs;
};
