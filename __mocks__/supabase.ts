// __mocks__/supabase.ts
// Mock for Supabase client

export const mockSupabaseFrom = jest.fn();
export const mockSupabaseSelect = jest.fn();
export const mockSupabaseInsert = jest.fn();
export const mockSupabaseUpdate = jest.fn();
export const mockSupabaseDelete = jest.fn();
export const mockSupabaseEq = jest.fn();
export const mockSupabaseIn = jest.fn();
export const mockSupabaseSingle = jest.fn();
export const mockSupabaseRpc = jest.fn();

export const supabase = {
  from: mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect.mockReturnThis(),
    insert: mockSupabaseInsert.mockReturnThis(),
    update: mockSupabaseUpdate.mockReturnThis(),
    delete: mockSupabaseDelete.mockReturnThis(),
    eq: mockSupabaseEq.mockReturnThis(),
    in: mockSupabaseIn.mockReturnThis(),
    single: mockSupabaseSingle.mockReturnThis(),
  }),
  rpc: mockSupabaseRpc,
};

// Reset all mocks between tests
export const resetSupabaseMocks = () => {
  mockSupabaseFrom.mockClear();
  mockSupabaseSelect.mockClear();
  mockSupabaseInsert.mockClear();
  mockSupabaseUpdate.mockClear();
  mockSupabaseDelete.mockClear();
  mockSupabaseEq.mockClear();
  mockSupabaseIn.mockClear();
  mockSupabaseSingle.mockClear();
  mockSupabaseRpc.mockClear();
};