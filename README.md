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
