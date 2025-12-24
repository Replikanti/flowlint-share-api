import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker, { Env } from './index';

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('Worker API', () => {
  const env: Env = { GITHUB_TOKEN: 'fake-token' };
  const ctx: ExecutionContext = {
    waitUntil: () => {},
    passThroughOnException: () => {},
  } as any;

  beforeEach(() => {
    globalFetch.mockReset();
  });

  describe('POST /share', () => {
    it('returns 400 if workflow data is missing', async () => {
      const request = new Request('http://localhost/share', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(400);
      const data = await response.json<any>();
      expect(data.error).toBe('Missing workflow data');
    });

    it('creates a gist and returns ID on success', async () => {
      const request = new Request('http://localhost/share', {
        method: 'POST',
        body: JSON.stringify({ workflow: { nodes: [] } }),
      });

      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'gist-123' }),
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(201);
      const data = await response.json<any>();
      expect(data.id).toBe('gist-123');

      expect(globalFetch).toHaveBeenCalledWith('https://api.github.com/gists', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      }));
    });
  });

  describe('GET /get/:id', () => {
    it('returns 200 and workflow content on success', async () => {
      const request = new Request('http://localhost/get/gist-123', {
        method: 'GET',
      });

      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: {
            'workflow.json': { content: '{"nodes":[]}', truncated: false }
          }
        }),
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(200);
      const data = await response.json<any>();
      expect(data.nodes).toEqual([]);
    });

    it('returns 404 if gist not found', async () => {
      const request = new Request('http://localhost/get/unknown', {
        method: 'GET',
      });

      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(404);
    });
  });
});
