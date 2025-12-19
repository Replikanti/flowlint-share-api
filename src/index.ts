/**
 * FlowLint Share API - Cloudflare Worker
 */

export interface Env {
	// GITHUB_TOKEN: string; // Set via wrangler secret put GITHUB_TOKEN
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			if (path === '/share' && request.method === 'POST') {
				return new Response(JSON.stringify({ message: "Share endpoint ready" }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			if (path.startsWith('/get/') && request.method === 'GET') {
				const id = path.split('/')[2];
				return new Response(JSON.stringify({ message: `Load endpoint ready for ID: ${id}` }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			return new Response('FlowLint Share API', { 
				status: 200,
				headers: corsHeaders 
			});
		} catch (err) {
			return new Response(JSON.stringify({ error: (err as Error).message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};