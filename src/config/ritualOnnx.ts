import { defineChain, parseAbi, zeroAddress, type Address } from "viem";

export const ritualTestnet = defineChain({
  id: 1979,
  name: "Ritual Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ritual",
    symbol: "RITUAL",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL ?? "https://rpc.ritualfoundation.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: "https://explorer.ritualfoundation.org",
    },
  },
  testnet: true,
});

export const ritualOnnxPrecompileAddress =
  "0x0000000000000000000000000000000000000800" as const;

export const ritualRiskModel = {
  id: "hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef",
  source: "Ritual official ONNX sample linear-regression model",
  inputName: "input",
  inputDtype: "FLOAT32",
  inputShape: [1, 10] as const,
  outputName: "output",
  outputDtype: "FLOAT32",
  outputShape: [1] as const,
  arithmetic: "FLOAT",
  fixedPointScale: 0,
  rounding: "NEAREST",
};

export const riskSignalDefaults = [
  0.5,
  -0.14,
  0.65,
  1.52,
  -0.23,
  -0.23,
  1.58,
  0.77,
  -0.47,
  0.54,
] as const;

export const riskSignalFields = [
  "Signal 01",
  "Signal 02",
  "Signal 03",
  "Signal 04",
  "Signal 05",
  "Signal 06",
  "Signal 07",
  "Signal 08",
  "Signal 09",
  "Signal 10",
] as const;

export const ritualRiskEngineAddress = (
  process.env.NEXT_PUBLIC_RITUAL_RISK_ENGINE_ADDRESS || zeroAddress
) as Address;

export const ritualRiskEngineAbi = parseAbi([
  "function MODEL_ID() view returns (string)",
  "function ONNX_PRECOMPILE() view returns (address)",
  "function runRisk(int32[10] float32Inputs) view returns (int32 score, uint8 riskLabel, bytes rawTensor, uint8 outputArithmetic, uint8 outputScale, uint8 rounding)",
  "function recordRisk(int32[10] float32Inputs) returns (int32 score, uint8 riskLabel, bytes rawTensor, uint8 outputArithmetic, uint8 outputScale, uint8 rounding)",
  "function encodeTensor(int32[10] float32Inputs) pure returns (bytes)",
  "event RiskInference(address indexed user, int32 score, uint8 riskLabel, bytes rawTensor)",
]);

export function ritualExplorerAddressUrl(address: Address) {
  return `${ritualTestnet.blockExplorers.default.url}/address/${address}`;
}

export function ritualExplorerTxUrl(hash: `0x${string}`) {
  return `${ritualTestnet.blockExplorers.default.url}/tx/${hash}`;
}
