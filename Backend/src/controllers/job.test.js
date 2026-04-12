import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// 1. Em ESM, módulos locais devem ser mockados com unstable_mockModule
// antes de serem importados pelo código que será testado.
await jest.unstable_mockModule('../lib/supabase.js', () => {
  const mockPostgrestBuilder = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    // Essencial para o 'await query' funcionar
    then: jest.fn((onFulfilled) => onFulfilled({ data: [], error: null })),
    single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return { supabase: mockPostgrestBuilder };
});

// 2. Importamos os módulos dinamicamente para garantir que usem o Mock
const { JobController } = await import('./job.controller.js');
const { supabase } = await import('../lib/supabase.js');

describe('JobController - Smart Matching', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { query: {}, studentId: 'student-123', userRole: 'STUDENT' };
    mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    jest.clearAllMocks();

    // Reset do comportamento padrão do then()
    supabase.then.mockImplementation((onFulfilled) => onFulfilled({ data: [], error: null }));
  });

  test('Deve calcular o Match Score corretamente (50%)', async () => {
    const mockJobs = [
      { id: 'job-1', requirements: ['React', 'NodeJS', 'TypeScript', 'Docker'] }
    ];
    
    // Mock do perfil do estudante (tem 2 das 4 skills)
    const mockStudent = { skills: ['React', 'NodeJS'] };

    // Intercepta o 'await query' da listagem de vagas
    supabase.then.mockImplementationOnce((onFulfilled) => onFulfilled({ data: mockJobs, error: null }));
    
    // Intercepta o .single() da busca de skills do estudante
    supabase.single.mockResolvedValueOnce({ data: mockStudent, error: null });

    await JobController.getJobs(mockReq, mockRes);

    const responseData = mockRes.json.mock.calls[0][0].data;
    expect(responseData[0].matchScore).toBe(50);
  });

  test('Deve retornar 100% se a vaga não tiver requisitos especificados', async () => {
    const mockJobs = [{ id: 'job-2', requirements: [] }];
    const mockStudent = { skills: ['Any'] };

    // Configura os resultados para o segundo teste
    supabase.then.mockImplementationOnce((onFulfilled) => onFulfilled({ data: mockJobs, error: null }));
    supabase.single.mockResolvedValueOnce({ data: mockStudent, error: null });

    await JobController.getJobs(mockReq, mockRes);

    expect(mockRes.json.mock.calls[0][0].data[0].matchScore).toBe(100);
  });
});