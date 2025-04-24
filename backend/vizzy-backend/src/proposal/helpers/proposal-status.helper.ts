import { ProposalStatus } from '@/constants/proposal-status.enum';

/**
 * Helper class for handling proposal status operations
 */
export class ProposalStatusHelper {
  /**
   * Parses and validates a status value from various input formats
   * @param {any} input - The input value (can be an object, string, or number)
   * @returns {ProposalStatus} The validated ProposalStatus enum value
   * @throws {Error} If the status is invalid, missing, or input type is unsupported
   */
  static parseAndValidateStatus(input: any): ProposalStatus {
    this.validateInput(input);
    const statusValue = this.extractStatusValue(input);
    return this.validateAndConvertStatus(statusValue);
  }

  /**
   * Validates that the input is not null or undefined
   * @param {any} input - The input value to validate
   * @throws {Error} If the input is null or undefined
   * @private
   */
  private static validateInput(input: any): void {
    if (input === null || input === undefined) {
      throw new Error('Status value is required');
    }
  }

  /**
   * Extracts the status value from the input based on its type
   * @param {any} input - The input value to extract status from
   * @returns {any} The extracted status value
   * @throws {Error} If status property is not found in object or input type is unsupported
   * @private
   */
  private static extractStatusValue(input: any): any {
    if (typeof input === 'object') {
      if ('status' in input) {
        return input.status;
      }
      throw new Error('Status property not found in input object');
    }

    if (typeof input === 'string' || typeof input === 'number') {
      return input;
    }

    throw new Error(`Unsupported input type: ${typeof input}`);
  }

  /**
   * Validates and converts the status value to a ProposalStatus enum value
   * @param {any} statusValue - The status value to validate and convert
   * @returns {ProposalStatus} The matching ProposalStatus enum value
   * @throws {Error} If the status value doesn't match any ProposalStatus enum value
   * @private
   */
  private static validateAndConvertStatus(statusValue: any): ProposalStatus {
    const normalizedStatus = String(statusValue).toLowerCase();

    const matchingStatus = Object.values(ProposalStatus).find(
      (status) => status.toLowerCase() === normalizedStatus,
    );

    if (!matchingStatus) {
      throw new Error(`Invalid status value: ${statusValue}`);
    }

    return matchingStatus;
  }
}
