# Ritual Nexus

Ritual Nexus is a minimal educational shortcut dApp for the Ritual ecosystem. The interface is intentionally reduced to one full-screen starfield, the exact uploaded Ritual logo asset, and eight invisible clickable areas placed over the logo.

## Ritual Skills

The official Ritual dApp skills are included in this repository as a submodule-style checkout at:

```text
.codex/skills/ritual-dapp-skills
```

They were used while rebuilding the project, especially:

- `ritual` for build routing and progress tracking.
- `ritual-dapp-design` for the dark Ritual visual language, reduced-motion handling, and accessibility checks.
- `ritual-dapp-frontend` for Next.js/TypeScript frontend structure and Ritual-specific UI cautions.
- `ritual-dapp-deploy` for the Ritual testnet-only deployment boundary.
- `ritual-dapp-onnx` for the ONNX precompile ABI, RitualTensor encoding, pinned model format, and response decoding.
- `ritual-dapp-testing` for the verification checklist.

See `RITUAL_SKILLS_USAGE.md` for the implementation notes.

## What the page includes

- Full-screen starfield background from `public/ritual-starfield.jpg`.
- Centered uploaded Ritual logo from `public/ritual-logo.png`.
- Eight transparent link hotspots defined in `src/data/ritualLinks.ts`.
- One-time sequential hotspot reveal using subtle glow and labels.
- Subtle pointer tilt/parallax on desktop.
- Keyboard-accessible anchors and screen-reader labels.
- Reduced-motion support.

The website does not show wallet connection, contract addresses, ABI data, chain status, dashboard panels, filters, progress trackers, or transaction details.

## ONNX AI Playground

Ritual Nexus includes a focused ONNX AI Playground at:

```text
/onnx
```

The playground is called **Ritual Risk Engine**. It lets users run a real machine-learning inference through a deployed Solidity contract on Ritual Testnet. The contract sends ten FLOAT32 inputs to Ritual's native ONNX precompile and decodes the returned model result.

The original landing page remains the same immersive logo scene. The ONNX playground is reached through a small `ONNX AI` entry point that does not cover or replace the eight Ritual resource hotspots.

### Model

- Model ID: `hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef`
- Source: official Ritual ONNX sample model
- Input dtype: FLOAT32
- Input shape: `[1, 10]`
- Output dtype: FLOAT32
- Output shape: `[1]` or `[1, 1]`
- Demo labels: Low Risk, Medium Risk, High Risk

This is a Ritual Testnet educational demo, not financial advice.

### Contract Integration

- Contract: `contracts/src/RitualRiskEngine.sol`
- Deploy script: `contracts/script/DeployRiskEngine.s.sol`
- Tests: `contracts/test/RitualRiskEngine.t.sol`
- Frontend config: `src/config/ritualOnnx.ts`
- Tensor helpers: `src/services/ritualTensor.ts`
- Wallet/RPC hook: `src/hooks/useRitualRiskEngine.ts`
- Deployment record: `deployment/RITUAL_ONNX_PLAYGROUND_DEPLOYMENT.md`

All chain configuration, contract addresses, ABI, and model metadata live in config or service files, not inside page components.

## Hotspot Editing

Hotspots are percentage-based so they can be tuned without touching the UI component:

```text
src/data/ritualLinks.ts
```

Each link has:

- `x`
- `y`
- `width`
- `height`

All values are percentages relative to the logo container.

## Ritual Deployment Notes

This version is an educational shortcut dApp. The website itself does not require an onchain backend for user interaction, but the approved deployment package includes a minimal Ritual testnet marker contract for deployment records:

- Contract: `contracts/src/RitualNexusRegistry.sol`
- Deploy script: `contracts/script/Deploy.s.sol`
- Deployment record: `deployment/RITUAL_TESTNET_DEPLOYMENT.md`
- ONNX deployment record: `deployment/RITUAL_ONNX_PLAYGROUND_DEPLOYMENT.md`

Any Ritual onchain deployment must target Ritual testnet only:

- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Currency: testnet `RITUAL`

Do not deploy this project to Ethereum or Sepolia for Ritual-specific onchain work. Contract address, ABI, transaction hash, and explorer details must be documented in `deployment/RITUAL_TESTNET_DEPLOYMENT.md`, not shown inside the website.

Required local deployment variables must stay out of Git:

```text
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
RITUAL_VERIFIER_URL=https://rpc.ritualfoundation.org/api/verify
PRIVATE_KEY=<local deployer private key>
NEXT_PUBLIC_RITUAL_RISK_ENGINE_ADDRESS=<deployed RitualRiskEngine address>
```

## Local Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

The local preview normally runs at:

```text
http://127.0.0.1:3000
```
