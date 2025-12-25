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
      const request = new Request('https://localhost/share', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(400);
      const data = await response.json<any>();
      expect(data.error).toBe('Missing workflow data');
    });

    it('creates a gist and returns ID on success', async () => {
      const request = new Request('https://localhost/share', {
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

    it('returns error if GitHub API fails', async () => {
      const request = new Request('https://localhost/share', {
        method: 'POST',
        body: JSON.stringify({ workflow: { nodes: [] } }),
      });

      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'GitHub Internal Error',
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(500);
      const data = await response.json<any>();
      expect(data.error).toBe('GitHub API error');
    });
  });

  describe('GET /get/:id', () => {
    it('returns 200 and workflow content on success', async () => {
      const request = new Request('https://localhost/get/gist-123', {
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

    it('handles truncated content', async () => {
      const request = new Request('https://localhost/get/gist-123', {
        method: 'GET',
      });

      // First fetch returns truncated metadata
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: {
            'workflow.json': { 
              content: '', 
              truncated: true, 
              raw_url: 'https://raw.github/123' 
            }
          }
        }),
      } as Response);

      // Second fetch returns raw content
      globalFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '{"nodes":[{"id":"1"}]}',
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(200);
      const data = await response.json<any>();
      expect(data.nodes[0].id).toBe('1');
      expect(globalFetch).toHaveBeenCalledTimes(2);
    });

    it('returns 404 if workflow.json is missing in gist', async () => {
      const request = new Request('https://localhost/get/gist-123', {
        method: 'GET',
      });

      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: { 'other.txt': { content: '...' } }
        }),
      } as Response);

      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(404);
      const data = await response.json<any>();
      expect(data.error).toBe('Invalid gist content');
    });

    it('returns error if gist not found', async () => {
      const request = new Request('https://localhost/get/unknown', {
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

  describe('Other routes', () => {
    it('returns base info for root path', async () => {
      const request = new Request('https://localhost/', { method: 'GET' });
      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('FlowLint Share API');
    });

    it('handles OPTIONS request for CORS', async () => {
      const request = new Request('https://localhost/share', { method: 'OPTIONS' });
      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('handles internal errors', async () => {
      const request = new Request('https://localhost/share', { 
        method: 'POST',
        body: 'invalid-json' 
      });
      const response = await worker.fetch(request, env, ctx);
      expect(response.status).toBe(500);
      const data = await response.json<any>();
      expect(data.error).toBeDefined();
    });
  });
});
