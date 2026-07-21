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
| `skills/ritual-dapp-frontend/SKILL.md` | Kept the Next.js/TypeScript implementation modular. The original shortcut UI remains minimal, while the ONNX playground keeps wallet/RPC logic inside a reusable hook. |
| `skills/ritual-dapp-onnx/SKILL.md` | Used the official ONNX precompile address `0x0000000000000000000000000000000000000800`, the seven-field request ABI, RitualTensor encoding, FLOAT32 dtype `5`, pinned Hugging Face model ID format, and documented response envelope. |
| `skills/ritual-dapp-deploy/SKILL.md` | Documented and configured the Ritual testnet-only deployment boundary: chain ID `1979`, RPC `https://rpc.ritualfoundation.org`, EIP-1559 transactions, Foundry deployment commands, and custom verifier URL. |
| `skills/ritual-dapp-testing/SKILL.md` | Drove the local verification sequence: Foundry tests, lint, TypeScript check, production build, and browser preview. |

## Ritual-Specific Decisions

- The original landing page still does not show a wallet connection, contract panel, ABI display, address display, chain status, or transaction status.
- The `/onnx` playground adds wallet interaction only for the Ritual Testnet ONNX contract flow requested in the upgrade.
- The approved deployment package adds the smallest appropriate contract component, `contracts/src/RitualNexusRegistry.sol`, strictly as an onchain deployment marker.
- The ONNX upgrade adds `contracts/src/RitualRiskEngine.sol`, a small testnet contract that calls Ritual's ONNX precompile with `staticcall`.
- Deployment details are recorded in `deployment/RITUAL_TESTNET_DEPLOYMENT.md`, not displayed in the website UI.
- ONNX deployment details are recorded in `deployment/RITUAL_ONNX_PLAYGROUND_DEPLOYMENT.md`.
- The exact uploaded logo and starfield assets are served directly from `public/` without image editing.
- The pinned ONNX model is `hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef`.

## Ritual Deployment Evidence

- Network: Ritual testnet
- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Contract source: `contracts/src/RitualNexusRegistry.sol`
- Deploy script: `contracts/script/Deploy.s.sol`
- Deployment record: `deployment/RITUAL_TESTNET_DEPLOYMENT.md`
- ONNX contract source: `contracts/src/RitualRiskEngine.sol`
- ONNX deploy script: `contracts/script/DeployRiskEngine.s.sol`
- ONNX tests: `contracts/test/RitualRiskEngine.t.sol`
- ONNX deployment record: `deployment/RITUAL_ONNX_PLAYGROUND_DEPLOYMENT.md`
- Required secret values remain local only: `PRIVATE_KEY`, `RITUAL_RPC_URL`, and `RITUAL_VERIFIER_URL`

## Verification Plan

Before handoff, the project should pass:

```bash
npm run lint
npm run typecheck
npm run build
cd contracts && forge test -vvv
```

Then the local preview should be opened and checked for:

- Full-screen starfield background.
- Centered Ritual logo.
- No restored dashboard elements.
- Invisible default hotspots.
- Subtle sequential intro reveal.
- Keyboard-focus labels and direct new-tab links.
