# FlowLint Share API

![Coverage](https://img.shields.io/badge/coverage-75%25-yellow)

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
