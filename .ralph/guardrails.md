# Guardrails - FlowLint Share API

## Rules

### G1: Never commit to main
- **Trigger:** `git commit` on main branch
- **Instruction:** Create feature branch
- **Discovered:** Iteration 0

### G2: Test with wrangler dev
- **Trigger:** API changes
- **Instruction:** Test with `npx wrangler dev`
- **Discovered:** Iteration 0

### G3: Rate limiting
- **Trigger:** Endpoint changes
- **Instruction:** Ensure rate limiting is active
- **Discovered:** Iteration 0
