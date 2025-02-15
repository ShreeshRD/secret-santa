import { Participant } from "../types/participant";
import { generateDerangement, resolveConflicts } from "../utils/shuffle_utils";

export const generateSecretSantaPairs = (
  participants: Participant[],
  previousPairings: { Employee_EmailID: string; Secret_Child_EmailID: string }[]
): {
  Employee_Name: string;
  Employee_EmailID: string;
  Secret_Child_Name: string;
  Secret_Child_EmailID: string;
}[] => {
  // Convert previous pairings to a Map for O(1) lookups
  const previousPairingMap = new Map<string, string>(
    previousPairings.map((pp) => [pp.Employee_EmailID, pp.Secret_Child_EmailID])
  );

  // Step 1: Generate a derangement (no self-pairing)
  const derangement = generateDerangement(participants);

  // Step 2: Create initial pairs
  const pairs = new Map<Participant, Participant>(
    participants.map((giver, i) => [giver, derangement[i]])
  );

  // Step 3: Resolve conflicts with previous pairings
  const resolvedPairs = resolveConflicts(pairs, previousPairingMap);

  // Step 4: Convert to the required format
  return Array.from(resolvedPairs.entries()).map(([giver, receiver]) => ({
    Employee_Name: giver.Employee_Name,
    Employee_EmailID: giver.Employee_EmailID,
    Secret_Child_Name: receiver.Employee_Name,
    Secret_Child_EmailID: receiver.Employee_EmailID,
  }));
};
