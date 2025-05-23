import { POST } from '../route';
import { NextResponse } from 'next/server';
import { AnalysisRequestSchema } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

describe('POST /api/classify', () => {
  beforeEach(() => {
    process.env.AUTODERM_API_KEY = 'test-key';
    jest.clearAllMocks();
  });

  it('should return validation error for missing image', async () => {
    const req = { json: () => ({}) };
    const response = await POST(req as any);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VALIDATION_ERROR'
      }),
      { status: 400 }
    );
  });

  it('should return clinical mapping data', async () => {
    const mockResponse = {
      predictions: [{ class: 'melanoma', probability: 0.85 }],
      recommendations: ['Urgent referral']
    };
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })
    );

    const req = { 
      json: () => ({
        image: 'data:image/jpeg;base64,test',
        model: 'autoderm_v2_2'
      })
    };
    
    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  it('should handle API errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('API Error')
      })
    );

    const req = { 
      json: () => ({
        image: 'data:image/jpeg;base64,test'
      })
    };
    
    const response = await POST(req as any);
    expect(response.status).toBe(500);
  });
});