import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html', 'clover', 'cobertura'],
			include: ['src/**'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
