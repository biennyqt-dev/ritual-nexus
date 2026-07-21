import type { Metadata } from "next";
import { OnnxPlayground } from "@/components/OnnxPlayground";

export const metadata: Metadata = {
  title: "Ritual Risk Engine | Ritual Nexus",
  description: "Run a pinned ONNX model through Ritual Testnet.",
};

export default function RitualOnnxPage() {
  return <OnnxPlayground />;
}
