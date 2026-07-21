import { encodeAbiParameters, parseAbiParameters, type Hex } from "viem";

export interface RitualTensorPreview {
  dtype: number;
  shape: readonly [number, number];
  values: readonly number[];
  encoded: Hex;
}

export interface RiskResult {
  scoreBits: number;
  score: number;
  riskCode: number;
  label: "Low Risk" | "Medium Risk" | "High Risk";
  rawTensor: Hex;
  outputArithmetic: number;
  outputScale: number;
  rounding: number;
  transactionHash?: `0x${string}`;
}

export type RiskInputBits = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const floatView = new DataView(new ArrayBuffer(4));

export function floatToFloat32Bits(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error("Inputs must be finite numbers.");
  }

  floatView.setFloat32(0, value, false);
  return floatView.getInt32(0, false);
}

export function float32BitsToNumber(bits: number | bigint) {
  floatView.setInt32(0, Number(bits), false);
  return floatView.getFloat32(0, false);
}

export function toFloat32Bits(values: readonly number[]): RiskInputBits {
  if (values.length !== 10) {
    throw new Error("Ritual Risk Engine requires exactly ten FLOAT32 inputs.");
  }

  return values.map(floatToFloat32Bits) as unknown as RiskInputBits;
}

export function encodeRitualTensorPreview(values: readonly number[]): RitualTensorPreview {
  const encodedValues = toFloat32Bits(values);
  const shape = [1, 10] as const;

  return {
    dtype: 5,
    shape,
    values: encodedValues,
    encoded: encodeAbiParameters(parseAbiParameters("uint8, uint16[], int32[]"), [
      5,
      shape,
      encodedValues,
    ]),
  };
}

export function riskLabelFromCode(code: number): RiskResult["label"] {
  if (code === 0) return "Low Risk";
  if (code === 1) return "Medium Risk";
  return "High Risk";
}

export function describeRisk(score: number) {
  if (score < 0.5) {
    return "The model output is below the low-risk threshold used by this testnet demo.";
  }

  if (score < 1.5) {
    return "The model output sits in the middle band for this testnet demo.";
  }

  return "The model output is in the high band for this testnet demo.";
}
