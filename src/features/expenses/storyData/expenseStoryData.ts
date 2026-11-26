import type { ExpenseDto, PublicUserProfileDto } from "../../../types";

// Sample data for the expense stories.
const profile = (id: string, displayName: string): PublicUserProfileDto => ({
  id,
  displayName,
  profilePictureUrl: null,
  customBio: null,
  recordCreated: "2026-01-01T12:00:00Z",
});

export const storyParticipants = [
  profile("sam", "Sam"),
  profile("ann", "Ann"),
  profile("bob", "Bob"),
];

// Sam paid 45, split evenly over the three; Bob's share is already settled.
export const storyExpense: ExpenseDto = {
  id: "expense-1",
  groupId: "group-1",
  paidByUserId: "sam",
  createdByUserId: "sam",
  title: "Dinner in Ghent",
  amount: 45,
  receiptUrl: "https://example.com/receipt.jpg",
  recordCreated: "2026-03-14T19:30:00Z",
  paidByProfile: storyParticipants[0],
  createdByProfile: storyParticipants[0],
  splits: storyParticipants.map((participant, index) => ({
    id: `split-${participant.id}`,
    expenseId: "expense-1",
    userId: participant.id,
    amountOwed: 15,
    isSettled: index === 2,
    userProfile: participant,
  })),
};
