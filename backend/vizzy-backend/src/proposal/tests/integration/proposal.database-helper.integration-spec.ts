import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ProposalDatabaseHelper } from '../../helpers/proposal-database.helper';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { FetchProposalsOptions } from '../../helpers/proposal-database.types';
import { HttpException } from '@nestjs/common';
import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalType } from '@/constants/proposal-types.enum';

describe('ProposalDatabaseHelper Integration Tests', () => {
  let supabase: SupabaseClient;
  // Using IDs from profiles.sql
  const testUserId = '00000000-0000-0000-0000-000000000001'; // Basi
  const testSenderId = '11111111-1111-1111-1111-111111111111'; // testuser1
  const testReceiverId = '22222222-2222-2222-2222-222222222222'; // testuser2
  const nonExistentProposalId = 999999;

  beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for integration tests',
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    // Verify database connection
    const { error } = await supabase.from('proposals').select('count').single();
    if (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  });

  describe('basic operations', () => {
    describe('fetchBasicProposalsByFilters', () => {
      it('should successfully retrieve proposals for a user', async () => {
        const options: FetchProposalsOptions = {
          limit: 10,
          page: 1,
          received: true,
          sent: false,
        };

        const result =
          await ProposalDatabaseHelper.fetchBasicProposalsByFilters(
            supabase,
            testUserId,
            options,
          );

        expect(result).toBeDefined();
        expect(result.proposals).toBeDefined();
        expect(Array.isArray(result.proposals)).toBe(true);
        expect(result.proposals.length).toBeGreaterThan(0);
        expect(result.totalProposals).toBeGreaterThan(0);

        const proposal = result.proposals[0];
        expect(proposal).toHaveProperty('id');
        expect(proposal).toHaveProperty('title');
        expect(proposal).toHaveProperty('description');
        expect(proposal).toHaveProperty('sender_id');
        expect(proposal).toHaveProperty('receiver_id');
        expect(proposal).toHaveProperty('proposal_type');
        expect(proposal).toHaveProperty('proposal_status');
      });

      it('should return empty array for user with no proposals', async () => {
        const options: FetchProposalsOptions = {
          limit: 10,
          page: 1,
          received: true,
          sent: true,
        };

        const result =
          await ProposalDatabaseHelper.fetchBasicProposalsByFilters(
            supabase,
            '99999999-9999-9999-9999-999999999999', // Non-existent user
            options,
          );

        expect(result).toBeDefined();
        expect(result.proposals).toEqual([]);
        expect(result.totalProposals).toBe(0);
      });

      it('should filter proposals by status', async () => {
        const options: FetchProposalsOptions = {
          limit: 10,
          page: 1,
          pending: true,
          received: true,
          sent: false,
        };

        const result =
          await ProposalDatabaseHelper.fetchBasicProposalsByFilters(
            supabase,
            testUserId,
            options,
          );

        expect(result.proposals).toBeDefined();
        expect(result.proposals.length).toBeGreaterThan(0);
        expect(
          result.proposals.every(
            (proposal) => proposal.proposal_status === ProposalStatus.PENDING,
          ),
        ).toBe(true);
      });
    });

    describe('getProposalDataById', () => {
      it('should successfully retrieve a proposal by ID', async () => {
        const proposal = await ProposalDatabaseHelper.getProposalDataById(
          supabase,
          1,
        );

        expect(proposal).toBeDefined();
        expect(proposal.id).toBe(1);
        expect(proposal.title).toBe('Offer for iPhone 13 Pro');
        expect(proposal.description).toBeDefined();
        expect(proposal.sender_id).toBe(testSenderId);
        expect(proposal.receiver_id).toBe(testUserId);
      });

      it('should return null for non-existent proposal', async () => {
        const proposal = await ProposalDatabaseHelper.getProposalDataById(
          supabase,
          nonExistentProposalId,
        );
        expect(proposal).toBeNull();
      });
    });

    describe('insertProposal', () => {
      it('should successfully create a sale proposal', async () => {
        const createProposalDto: CreateProposalDto = {
          title: 'Test Sale Proposal',
          description: 'Test Description for Sale',
          listing_id: 1, // iPhone 13 Pro listing
          receiver_id: testReceiverId,
          proposal_type: ProposalType.SALE,
          offered_price: 100,
        };

        const result = await ProposalDatabaseHelper.insertProposal(
          supabase,
          createProposalDto,
          testUserId,
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe('number');

        // Verify the created proposal
        const proposal = await ProposalDatabaseHelper.getProposalDataById(
          supabase,
          result.id,
        );
        expect(proposal).toBeDefined();
        expect(proposal.title).toBe(createProposalDto.title);
        expect(proposal.proposal_type).toBe(ProposalType.SALE);
        expect(proposal.offered_price).toBe(createProposalDto.offered_price);
      });

      it('should successfully create a rental proposal', async () => {
        const createProposalDto: CreateProposalDto = {
          title: 'Test Rental Proposal',
          description: 'Test Description for Rental',
          listing_id: 2, // Gaming PC listing
          receiver_id: testReceiverId,
          proposal_type: ProposalType.RENTAL,
          offered_rent_per_day: 50,
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-01-10'),
        };

        const result = await ProposalDatabaseHelper.insertProposal(
          supabase,
          createProposalDto,
          testUserId,
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        const proposal = await ProposalDatabaseHelper.getProposalDataById(
          supabase,
          result.id,
        );
        expect(proposal).toBeDefined();
        expect(proposal.proposal_type).toBe(ProposalType.RENTAL);
        expect(proposal.offered_rent_per_day).toBe(
          createProposalDto.offered_rent_per_day,
        );
        expect(proposal.start_date).toBeDefined();
        expect(proposal.end_date).toBeDefined();
      });

      it('should successfully create a swap proposal', async () => {
        const createProposalDto: CreateProposalDto = {
          title: 'Test Swap Proposal',
          description: 'Test Description for Swap',
          listing_id: 3, // Sony Headphones listing
          receiver_id: testReceiverId,
          proposal_type: ProposalType.SWAP,
          swap_with: 'Item to swap with',
        };

        const result = await ProposalDatabaseHelper.insertProposal(
          supabase,
          createProposalDto,
          testUserId,
        );

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        const proposal = await ProposalDatabaseHelper.getProposalDataById(
          supabase,
          result.id,
        );
        expect(proposal).toBeDefined();
        expect(proposal.proposal_type).toBe(ProposalType.SWAP);
        expect(proposal.swap_with).toBe(createProposalDto.swap_with);
      });
    });

    describe('updateProposalStatus', () => {
      let testProposalId: number;

      beforeEach(async () => {
        // Create a test proposal to update
        const createProposalDto: CreateProposalDto = {
          title: 'Test Status Update Proposal',
          description: 'Test Description',
          listing_id: 1, // iPhone 13 Pro listing
          receiver_id: testReceiverId,
          proposal_type: ProposalType.SALE,
          offered_price: 100,
        };

        const result = await ProposalDatabaseHelper.insertProposal(
          supabase,
          createProposalDto,
          testUserId,
        );
        testProposalId = result.id;
      });

      it('should successfully update proposal status', async () => {
        await ProposalDatabaseHelper.updateProposalStatus(
          supabase,
          testProposalId,
          ProposalStatus.ACCEPTED,
          testReceiverId,
        );

        const updatedProposal =
          await ProposalDatabaseHelper.getProposalDataById(
            supabase,
            testProposalId,
          );
        expect(updatedProposal.proposal_status).toBe(ProposalStatus.ACCEPTED);
      });

      it('should throw error when updating with unauthorized user', async () => {
        await expect(
          ProposalDatabaseHelper.updateProposalStatus(
            supabase,
            testProposalId,
            ProposalStatus.ACCEPTED,
            '99999999-9999-9999-9999-999999999999', // Unauthorized user
          ),
        ).rejects.toThrow(HttpException);
      });

      it('should throw error when updating non-existent proposal', async () => {
        await expect(
          ProposalDatabaseHelper.updateProposalStatus(
            supabase,
            nonExistentProposalId,
            ProposalStatus.ACCEPTED,
            testUserId,
          ),
        ).rejects.toThrow(HttpException);
      });
    });

    describe('getProposalMetadata', () => {
      it('should successfully retrieve proposal metadata', async () => {
        const metadata = await ProposalDatabaseHelper.getProposalMetadata(
          supabase,
          1, // iPhone 13 Pro proposal
        );

        expect(metadata).toBeDefined();
        expect(metadata.sender_id).toBe(testSenderId);
        expect(metadata.receiver_id).toBe(testUserId);
        expect(typeof metadata.sender_id).toBe('string');
        expect(typeof metadata.receiver_id).toBe('string');
      });

      it('should return null for non-existent proposal', async () => {
        const metadata = await ProposalDatabaseHelper.getProposalMetadata(
          supabase,
          nonExistentProposalId,
        );
        expect(metadata).toBeNull();
      });
    });

    describe('getProposalBalance', () => {
      it('should successfully calculate user proposal balance', async () => {
        const balance = await ProposalDatabaseHelper.getProposalBalance(
          supabase,
          testUserId,
        );

        expect(balance).toBeDefined();
        expect(typeof balance).toBe('number');
      });

      it('should return 0 for user with no proposals', async () => {
        const balance = await ProposalDatabaseHelper.getProposalBalance(
          supabase,
          '99999999-9999-9999-9999-999999999999', // User with no proposals
        );

        expect(balance).toBe(0);
      });
    });
  });
});
