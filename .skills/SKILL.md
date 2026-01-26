# FlowLint Share API Development Skill

## Metadata
- **Name:** flowlint-share-api-dev
- **License:** MIT
- **Compatibility:** Claude Code, Cloudflare Workers

## Description

Cloudflare Worker API for sharing workflow analysis results. Stores results in KV storage and returns shareable URLs.

## Capabilities

- **endpoint:** Add/modify API endpoints
- **storage:** KV storage operations
- **security:** CORS and rate limiting
- **fix-bug:** Fix API bugs

## Project Structure

```
flowlint-share-api/
├── src/
│   └── index.ts         # Worker entry point
├── wrangler.jsonc       # Worker config
└── tests/               # Tests
```

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm test` | Run tests |
| `npx wrangler dev` | Local dev server |
| `npx wrangler deploy` | Deploy to Cloudflare |

## API Endpoints

- POST /share - Create shareable result
- GET /:id - Retrieve shared result

## Related Files

- `README.md` - Documentation
- `wrangler.jsonc` - Configuration
