import { ProposalStatus } from '@/constants/proposal-status.enum';

/**
 * Helper class for handling proposal status operations
 */
export class ProposalStatusHelper {
  /**
   * Parses and validates a status value from various input formats
   * @param input - The input value (can be an object, string, or number)
   * @returns The validated ProposalStatus enum value
   * @throws Error if the status is invalid
   */
  static parseAndValidateStatus(input: any): ProposalStatus {
    // Extract the status value from the input
    let statusValue: any;

    if (input === null || input === undefined) {
      throw new Error('Status value is required');
    }

    // Handle different input formats
    if (typeof input === 'object' && input !== null) {
      // If input is an object with a status property
      if ('status' in input) {
        statusValue = input.status;
      } else {
        throw new Error('Status property not found in input object');
      }
    } else if (typeof input === 'string' || typeof input === 'number') {
      // If input is a direct string or number value
      statusValue = input;
    } else {
      throw new Error(`Unsupported input type: ${typeof input}`);
    }

    // Convert to string if it's a number
    if (typeof statusValue === 'number') {
      statusValue = String(statusValue);
    }

    // Convert to string and normalize
    const normalizedStatus = String(statusValue).toLowerCase();

    // Find matching enum value (case-insensitive)
    const matchingStatus = Object.values(ProposalStatus).find(
      (status) => status.toLowerCase() === normalizedStatus,
    );

    if (matchingStatus) {
      return matchingStatus as ProposalStatus;
    }

    // If no match found, throw an error
    throw new Error(`Invalid status value: ${statusValue}`);
  }
}
