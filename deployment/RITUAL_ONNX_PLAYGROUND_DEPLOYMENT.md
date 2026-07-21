# Ritual ONNX Playground Deployment Record

This file records the Ritual Risk Engine contract used by the ONNX AI Playground. The website UI must not display private keys, seed phrases, deployment secrets, ABI internals, or verifier credentials.

## Network

- Network: Ritual testnet
- Chain ID: `1979`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`
- Required transaction type: EIP-1559 / type-2

## ONNX Precompile

- Address: `0x0000000000000000000000000000000000000800`
- Call pattern: synchronous `staticcall`
- Request fields:
  - `mlModelId`
  - `tensorData`
  - `inputArithmetic`
  - `inputFixedPointScale`
  - `outputArithmetic`
  - `outputFixedPointScale`
  - `rounding`

## Model

- Model ID: `hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef`
- Source: official Ritual ONNX sample model
- Input tensor: RitualTensor `(uint8 dtype, uint16[] shape, int32[] values)`
- Input dtype: `FLOAT32`, Ritual dtype `5`
- Input shape: `[1, 10]`
- Output dtype: `FLOAT32`, Ritual dtype `5`
- Output shape accepted by contract: `[1]` or `[1, 1]`
- Output mapping:
  - `< 0.5`: Low Risk
  - `>= 0.5` and `< 1.5`: Medium Risk
  - `>= 1.5`: High Risk

## Deployment Component

- Contract: `RitualRiskEngine`
- Source: `contracts/src/RitualRiskEngine.sol`
- Deploy script: `contracts/script/DeployRiskEngine.s.sol`
- Frontend config: `src/config/ritualOnnx.ts`
- Frontend env value after deployment: `NEXT_PUBLIC_RITUAL_RISK_ENGINE_ADDRESS`

## Deployment Status

- Status: Not deployed from this session yet
- Deployment date: Pending
- Contract address: Pending
- Deployment transaction hash: Pending
- Explorer link: Pending
- Verification status: Pending

## Required Local Environment

Never commit real values.

```text
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
RITUAL_VERIFIER_URL=https://rpc.ritualfoundation.org/api/verify
PRIVATE_KEY=<local deployer private key>
NEXT_PUBLIC_RITUAL_RISK_ENGINE_ADDRESS=<deployed RitualRiskEngine address>
```

## Ritual Skills Workflow

The deployment path follows `.codex/skills/ritual-dapp-skills/skills/ritual-dapp-onnx/SKILL.md` and `.codex/skills/ritual-dapp-skills/skills/ritual-dapp-deploy/SKILL.md`.

```bash
cd contracts
forge build
forge test -vvv
forge script script/DeployRiskEngine.s.sol:DeployRiskEngineScript --rpc-url "$RITUAL_RPC_URL" --broadcast -vvvv
```

Optional source verification after deployment:

```bash
forge verify-contract --chain 1979 --watch --verifier custom --verifier-url "$RITUAL_VERIFIER_URL" --verifier-api-key unused <CONTRACT_ADDRESS> src/RitualRiskEngine.sol:RitualRiskEngine
```

Do not deploy this contract to Ethereum, Sepolia, or any non-Ritual chain.
