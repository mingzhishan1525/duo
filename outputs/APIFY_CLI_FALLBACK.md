# Apify CLI Fallback

Use this only if connecting GitHub tag `v0.1.1` in Apify Console is blocked.

The preferred release path remains:

- Connect GitHub repository: https://github.com/mingzhishan1525/duo
- Build from tag: `v0.1.1`
- Actor config: `.actor/actor.json`

## CLI Deploy

Official Apify CLI deployment flow:

```bash
apify login
apify push
```

Run these commands from the project root.

`apify push` deploys the Actor using `.actor/actor.json`. The project already excludes local dependencies, local storage, batch output folders, and generated archives through `.gitignore`, `.apifyignore`, `.dockerignore`, and `.npmignore`.

## CLI Smoke Run

After deployment, run:

```bash
apify call --input-file outputs/apify-smoke-input-v0.1.1.json
```

## Notes

- CLI deployment is useful for development and private testing.
- For public Store readiness, prefer GitHub source control with fixed tag `v0.1.1`.
- Do not publish publicly until smoke run and 100-site validation pass.

## Sources

- Apify CLI command reference: https://docs.apify.com/cli/docs/reference
- Apify deployment docs: https://docs.apify.com/actors/development/deployment
