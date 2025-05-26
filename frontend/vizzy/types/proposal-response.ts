export interface ProposalResponseDto {
  id: number;
  title: string;
  description: string;
  listingId: number;
  listingTitle: string;
  proposalType: string;
  proposalStatus: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  createdAt: Date;
  message?: string;
  offeredRentPerDay?: number;
  startDate?: Date;
  endDate?: Date;
  offeredPrice?: number;
  swapWith?: string;
}
