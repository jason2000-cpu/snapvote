import { createPoll, updatePoll } from './actions';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// We're not mocking zod anymore, we'll use real validation

describe('Poll Actions', () => {
  const mockUserId = 'user-123';
  const mockPollId = 'poll-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createPoll', () => {
    const validPollData = {
      title: 'Test Poll',
      description: 'This is a test poll',
      options: [
        { value: 'Option 1' },
        { value: 'Option 2' },
      ],
    };
    
    it('should create a poll successfully', async () => {
      // Mock Supabase responses
      const mockInsertPoll = jest.fn().mockResolvedValue({
        data: { id: mockPollId },
        error: null,
      });
      
      const mockInsertOptions = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      
      // Setup the mock chain
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'polls') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockReturnValue(mockInsertPoll()),
              }),
            }),
          };
        } else if (table === 'options') {
          return {
            insert: jest.fn().mockReturnValue(mockInsertOptions()),
          };
        }
        return {};
      });
      
      const result = await createPoll(validPollData, mockUserId);
      
      // Assertions
      expect(result).toEqual({ success: true, data: { pollId: mockPollId } });
      expect(supabase.from).toHaveBeenCalledWith('polls');
      expect(supabase.from).toHaveBeenCalledWith('options');
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
    });
    
    it('should handle validation errors', async () => {
      // Title too short (min 5 chars) according to PollSchema
      const invalidPollData = {
        title: 'Test',
        description: 'This is a test poll',
        options: [
          { value: 'Option 1' },
          { value: 'Option 2' },
        ],
      };
      
      const result = await createPoll(invalidPollData as any, mockUserId);
      
      expect(result.success).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });
    
    it('should handle database errors when creating poll', async () => {
      // Mock Supabase error response
      const mockError = new Error('Database error');
      
      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      }));
      
      const result = await createPoll(validPollData, mockUserId);
      
      expect(result).toEqual({
        success: false,
        error: `Error creating poll: ${mockError.message}`,
      });
    });
    
    it('should handle database errors when creating options', async () => {
      // Mock successful poll creation but failed options creation
      const mockInsertPoll = jest.fn().mockResolvedValue({
        data: { id: mockPollId },
        error: null,
      });
      
      const mockOptionsError = new Error('Options error');
      
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'polls') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockReturnValue(mockInsertPoll()),
              }),
            }),
          };
        } else if (table === 'options') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: null,
              error: mockOptionsError,
            }),
          };
        }
        return {};
      });
      
      const result = await createPoll(validPollData, mockUserId);
      
      expect(result).toEqual({
        success: false,
        error: `Error creating options: ${mockOptionsError.message}`,
      });
    });
  });
  
  describe('updatePoll', () => {
    const pollId = 'poll-123';
    const validUpdateData = {
      title: 'Updated Poll',
      description: 'This is an updated poll',
      options: [
        { id: 'option-1', value: 'Updated Option 1' },
        { id: 'option-2', value: 'Option 2' },
        { value: 'New Option' }, // New option without ID
      ],
    };
    
    it('should update a poll successfully', async () => {
      // Mock existing poll check
      const mockExistingPoll = {
        data: { user_id: mockUserId },
        error: null,
      };
      
      // Mock existing options
      const mockExistingOptions = {
        data: [
          { id: 'option-1', value: 'Option 1' },
          { id: 'option-2', value: 'Option 2' },
          { id: 'option-3', value: 'Option to delete' },
        ],
        error: null,
      };
      
      // Setup the mock chain for poll check
      const mockPollSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue(mockExistingPoll),
        }),
      });
      
      // Setup the mock chain for poll update
      const mockPollUpdate = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      
      // Setup the mock chain for options fetch
      const mockOptionsSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue(mockExistingOptions),
      });
      
      // Setup the mock chain for option update
      const mockOptionUpdate = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      
      // Setup the mock chain for option delete
      const mockOptionDelete = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      
      // Setup the mock chain for option insert
      const mockOptionInsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      
      // Setup the supabase mock implementation
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'polls') {
          return {
            select: mockPollSelect,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockPollUpdate()),
            }),
          };
        } else if (table === 'options') {
          return {
            select: mockOptionsSelect,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockOptionUpdate()),
            }),
            delete: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue(mockOptionDelete()),
            }),
            insert: jest.fn().mockReturnValue(mockOptionInsert()),
          };
        }
        return {};
      });
      
      const result = await updatePoll(pollId, validUpdateData, mockUserId);
      
      // Assertions
      expect(result).toEqual({ success: true, data: { pollId } });
      expect(supabase.from).toHaveBeenCalledWith('polls');
      expect(supabase.from).toHaveBeenCalledWith('options');
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
      expect(revalidatePath).toHaveBeenCalledWith(`/polls/${pollId}`);
    });
    
    it('should reject unauthorized users', async () => {
      // Mock existing poll with different user_id
      const differentUserId = 'different-user';
      const mockExistingPoll = {
        data: { user_id: differentUserId },
        error: null,
      };
      
      // Setup the mock chain
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockExistingPoll),
          }),
        }),
      }));
      
      const result = await updatePoll(pollId, validUpdateData, mockUserId);
      
      expect(result).toEqual({
        success: false,
        error: 'Unauthorized: Only the creator can edit this poll',
      });
    });
    
    it('should handle poll not found', async () => {
      // Mock poll not found
      const mockNotFound = {
        data: null,
        error: null,
      };
      
      // Setup the mock chain
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockNotFound),
          }),
        }),
      }));
      
      const result = await updatePoll(pollId, validUpdateData, mockUserId);
      
      expect(result).toEqual({
        success: false,
        error: 'Poll not found',
      });
    });
    
    it('should handle validation errors', async () => {
      // Title too short (min 5 chars) according to PollSchema
      const invalidUpdateData = {
        title: 'Test',
        description: 'This is a test poll',
        options: [
          { id: 'option-1', value: 'Option 1' },
          { id: 'option-2', value: 'Option 2' },
        ],
      };
      
      const result = await updatePoll(pollId, invalidUpdateData as any, mockUserId);
      
      expect(result.success).toBe(false);
      expect(supabase.from).not.toHaveBeenCalled();
    });
    
    it('should handle database errors when updating poll', async () => {
      // Mock existing poll check
      const mockExistingPoll = {
        data: { user_id: mockUserId },
        error: null,
      };
      
      // Mock update error
      const mockUpdateError = new Error('Update error');
      
      // Setup the mock chain
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'polls') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue(mockExistingPoll),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: mockUpdateError,
              }),
            }),
          };
        }
        return {};
      });
      
      const result = await updatePoll(pollId, validUpdateData, mockUserId);
      
      expect(result).toEqual({
        success: false,
        error: `Error updating poll: ${mockUpdateError.message}`,
      });
    });
  });
});