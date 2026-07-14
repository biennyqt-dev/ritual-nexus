# Ritual Skills Usage

The official Ritual skills were installed at:

```bash
git clone https://github.com/ritual-foundation/ritual-dapp-skills.git .codex/skills/ritual-dapp-skills
```

For this rebuild, the skills directory is kept in the repository as a submodule-style checkout so future reviewers can see the exact official Ritual skills source used during development.

Current skills checkout:

```text
57045a3d643a36baada87bb37108509d8521183b
```

## Skills Read and Applied

| Skill | How it was used |
| --- | --- |
| `skills/ritual/SKILL.md` | Classified the user request as a complete build spec and maintained `.ritual-build/progress.json`. |
| `agents/ritual-dapp-builder.md` | Used the phased build approach and anti-slop UI checks. The app was scoped as a frontend-only educational shortcut dApp. |
| `skills/ritual-dapp-design/SKILL.md` | Applied the black-first Ritual visual language, restrained glow behavior, accessible focus states, and reduced-motion handling. |
| `skills/ritual-dapp-frontend/SKILL.md` | Kept the Next.js/TypeScript implementation modular and avoided unnecessary wallet or async transaction UI because the user explicitly excluded it. |
| `skills/ritual-dapp-deploy/SKILL.md` | Documented and configured the Ritual testnet-only deployment boundary: chain ID `1979`, RPC `https://rpc.ritualfoundation.org`, EIP-1559 transactions, Foundry deployment commands, and custom verifier URL. |
| `skills/ritual-dapp-testing/SKILL.md` | Drove the local verification sequence: lint, TypeScript check, production build, and browser preview. |

## Ritual-Specific Decisions

- No wallet connection was added.
- No contract panel, ABI display, address display, chain status, or transaction status appears in the UI.
- The approved deployment package adds the smallest appropriate contract component, `contracts/src/RitualNexusRegistry.sol`, strictly as an onchain deployment marker.
- Deployment details are recorded in `deployment/RITUAL_TESTNET_DEPLOYMENT.md`, not displayed in the website UI.
- The exact uploaded logo and starfield assets are served directly from `public/` without image editing.

## Ritual Deployment Evidence

- Network: Ritual testnet
- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Contract source: `contracts/src/RitualNexusRegistry.sol`
- Deploy script: `contracts/script/Deploy.s.sol`
- Deployment record: `deployment/RITUAL_TESTNET_DEPLOYMENT.md`
- Required secret values remain local only: `PRIVATE_KEY`, `RITUAL_RPC_URL`, and `RITUAL_VERIFIER_URL`

## Verification Plan

Before handoff, the project should pass:

```bash
npm run lint
npm run typecheck
npm run build
```

Then the local preview should be opened and checked for:

- Full-screen starfield background.
- Centered Ritual logo.
- No restored dashboard elements.
- Invisible default hotspots.
- Subtle sequential intro reveal.
- Keyboard-focus labels and direct new-tab links.
