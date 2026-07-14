# Ritual Testnet Deployment Record

This file is the onchain deployment record for Ritual Nexus. The website UI must not display contract addresses, ABIs, transaction hashes, wallet connection, chain status, or transaction details.

## Network

- Network: Ritual testnet
- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`
- Required transaction type: EIP-1559 / type-2

## Deployment Component

- Contract: `RitualNexusRegistry`
- Source: `contracts/src/RitualNexusRegistry.sol`
- Deploy script: `contracts/script/Deploy.s.sol`
- Purpose: minimal immutable public registry marker for the educational shortcut dApp

## Deployment Status

- Status: Blocked by missing local deployment prerequisites
- Deployment preflight date: July 14, 2026
- Contract address: Pending
- Deployment transaction hash: Pending
- Explorer link: Pending
- Blocker: `forge` is not installed in this environment, and `PRIVATE_KEY`, `RITUAL_RPC_URL`, and `RITUAL_VERIFIER_URL` are not set.

## Required Local Environment

Never commit these values.

```text
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
RITUAL_VERIFIER_URL=https://rpc.ritualfoundation.org/api/verify
PRIVATE_KEY=<local deployer private key>
```

## Ritual Skills Workflow

The deployment path follows `.codex/skills/ritual-dapp-skills/skills/ritual-dapp-deploy/SKILL.md`:

```bash
cd contracts
forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url %RITUAL_RPC_URL% --broadcast -vvvv
```

Optional verification after deployment:

```bash
forge verify-contract --chain 1979 --watch --verifier custom --verifier-url "%RITUAL_VERIFIER_URL%" --verifier-api-key unused <CONTRACT_ADDRESS> src/RitualNexusRegistry.sol:RitualNexusRegistry
```

Do not deploy this contract to Ethereum, Sepolia, or any non-Ritual chain.
