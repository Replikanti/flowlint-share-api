# FlowLint Share API

![Coverage](https://img.shields.io/badge/coverage-97.22%25-brightgreen)

Cloudflare Worker API for sharing workflow analysis results.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test:coverage
```

## API Endpoints

- `POST /share` - Share a workflow
- `GET /get/:id` - Retrieve a workflow
