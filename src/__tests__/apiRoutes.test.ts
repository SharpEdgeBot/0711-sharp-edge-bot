import fetch from 'node-fetch';

describe('API Route Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  it('/api/data/mlb should return valid response', async () => {
    const res = await fetch(`${baseUrl}/api/data/mlb?action=schedule`);
    expect(res.status).toBe(200);
    const data = await res.json() as unknown;
    console.log('MLB API Response:', JSON.stringify(data, null, 2));
    expect(data).toBeDefined();
    if (typeof data === 'object' && data !== null) {
      expect('dates' in data || 'games' in data).toBe(true);
    }
  });

  it('/api/data/optimal should return valid response', async () => {
    const res = await fetch(`${baseUrl}/api/data/optimal?action=events`);
    expect(res.status).toBe(200);
    const data = await res.json() as unknown;
    console.log('OptimalBet API Response:', JSON.stringify(data, null, 2));
    expect(data).toBeDefined();
    if (typeof data === 'object' && data !== null) {
      expect('events' in data).toBe(true);
    }
  });

  it('/api/chat should return valid response', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test message' })
    });
    expect(res.status).toBe(200);
    const data = await res.json() as unknown;
    console.log('Chat API Response:', JSON.stringify(data, null, 2));
    expect(data).toBeDefined();
    if (typeof data === 'object' && data !== null) {
      expect('response' in data).toBe(true);
    }
  });

  it('/api/stripe/webhook should reject GET', async () => {
    const res = await fetch(`${baseUrl}/api/stripe/webhook`);
    console.log('Stripe Webhook GET Response:', res.status);
    expect(res.status).toBe(405);
  });
});
