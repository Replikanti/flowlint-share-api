/**
 * FlowLint Share API - Cloudflare Worker
 * Proxy for GitHub Gist API to store and retrieve workflows.
 */

export interface Env {
	GITHUB_TOKEN: string;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

async function handleShare(request: Request, env: Env): Promise<Response> {
	const body = await request.json<any>(); 
	if (!body.workflow) {
		return new Response(JSON.stringify({ error: 'Missing workflow data' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const response = await fetch('https://api.github.com/gists', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
			'User-Agent': 'FlowLint-Share-API',
		},
		body: JSON.stringify({
			description: 'FlowLint Shared Workflow',
			public: false,
			files: {
				'workflow.json': {
					content: JSON.stringify(body.workflow, null, 2),
				},
			},
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		return new Response(JSON.stringify({ error: 'GitHub API error', details: error }), {
			status: response.status,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const result = await response.json<any>();
	return new Response(JSON.stringify({ id: result.id }), {
		status: 201,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

async function handleGet(id: string, env: Env): Promise<Response> {
	if (!id) {
		return new Response(JSON.stringify({ error: 'Missing Gist ID' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const response = await fetch(`https://api.github.com/gists/${id}`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
			'User-Agent': 'FlowLint-Share-API',
		},
	});

	if (!response.ok) {
		return new Response(JSON.stringify({ error: 'Workflow not found' }), {
			status: response.status,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const gist = await response.json<any>();
	const file = gist.files['workflow.json'];

	if (!file) {
		return new Response(JSON.stringify({ error: 'Invalid gist content' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	let content = file.content;
	if (file.truncated) {
		const rawResponse = await fetch(file.raw_url);
		content = await rawResponse.text();
	}

	return new Response(content, {
		status: 200,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		try {
			if (path === '/share' && request.method === 'POST') {
				return handleShare(request, env);
			}

			if (path.startsWith('/get/') && request.method === 'GET') {
				const id = path.split('/')[2];
				return handleGet(id, env);
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