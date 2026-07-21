"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ritualExplorerAddressUrl,
  ritualOnnxPrecompileAddress,
  ritualRiskModel,
  ritualTestnet,
  riskSignalDefaults,
  riskSignalFields,
} from "@/config/ritualOnnx";
import { useRitualRiskEngine } from "@/hooks/useRitualRiskEngine";
import {
  describeRisk,
  encodeRitualTensorPreview,
  type RiskResult,
} from "@/services/ritualTensor";

function shortHex(value: string, left = 6, right = 4) {
  if (value.length <= left + right + 3) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
}

function formatScore(value: number) {
  if (!Number.isFinite(value)) return "Unknown";
  return value.toFixed(4);
}

function resultTone(result: RiskResult | null) {
  if (!result) return "idle";
  if (result.riskCode === 0) return "low";
  if (result.riskCode === 1) return "medium";
  return "high";
}

export function OnnxPlayground() {
  const reduceMotion = useReducedMotion();
  const [inputs, setInputs] = useState<number[]>([...riskSignalDefaults]);
  const tensorPreview = useMemo(() => encodeRitualTensorPreview(inputs), [inputs]);
  const {
    account,
    connect,
    contractAddress,
    error,
    isConfigured,
    isConnecting,
    isRunning,
    isSending,
    lastTxUrl,
    recordInference,
    result,
    runInference,
  } = useRitualRiskEngine();

  function updateInput(index: number, value: string) {
    const parsed = Number(value);
    setInputs((current) =>
      current.map((input, inputIndex) =>
        inputIndex === index ? (Number.isFinite(parsed) ? parsed : input) : input,
      ),
    );
  }

  function resetInputs() {
    setInputs([...riskSignalDefaults]);
  }

  return (
    <main className="onnx-page" aria-labelledby="onnx-title">
      <Image
        src="/ritual-starfield.jpg"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="select-none object-cover"
      />
      <div className="onnx-scrim" aria-hidden="true" />

      <motion.section
        className="onnx-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
      >
        <header className="onnx-header">
          <div>
            <p className="onnx-kicker">Ritual Nexus</p>
            <h1 id="onnx-title">Ritual Risk Engine</h1>
          </div>
          <div className="onnx-header-actions">
            <Link href="/" className="onnx-ghost-link">
              Back to Nexus
            </Link>
            <button
              type="button"
              className="onnx-connect"
              onClick={connect}
              disabled={isConnecting}
            >
              {account ? shortHex(account) : isConnecting ? "Connecting" : "Connect Ritual"}
            </button>
          </div>
        </header>

        <p className="onnx-intro">
          Run a machine-learning model directly through Ritual. The contract sends your input to the
          native ONNX precompile and receives the prediction in the same transaction.
        </p>

        <div className="onnx-flow" aria-label="Ritual ONNX inference flow">
          <span>Input</span>
          <span>RitualTensor</span>
          <span>Smart contract</span>
          <span>ONNX precompile</span>
          <span>Model result</span>
        </div>

        <div className="onnx-grid">
          <section className="onnx-panel onnx-panel--inputs" aria-labelledby="onnx-inputs-title">
            <div className="onnx-panel-heading">
              <div>
                <h2 id="onnx-inputs-title">Model Inputs</h2>
                <p>
                  Official Ritual sample model: ten FLOAT32 signals with shape [1, 10].
                </p>
              </div>
              <button type="button" className="onnx-text-button" onClick={resetInputs}>
                Reset
              </button>
            </div>

            <div className="onnx-input-list">
              {inputs.map((value, index) => (
                <label key={riskSignalFields[index]} className="onnx-input-row">
                  <span>{riskSignalFields[index]}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="-10"
                    max="10"
                    step="0.01"
                    value={value}
                    onChange={(event) => updateInput(index, event.target.value)}
                    aria-label={`${riskSignalFields[index]} FLOAT32 input`}
                  />
                </label>
              ))}
            </div>

            <div className="onnx-action-row">
              <button
                type="button"
                className="onnx-primary"
                disabled={!isConfigured || isRunning || isSending}
                onClick={() => runInference(inputs)}
              >
                {isRunning ? "Running on Ritual" : "Run Inference"}
              </button>
              <button
                type="button"
                className="onnx-secondary"
                disabled={!isConfigured || isRunning || isSending}
                onClick={() => recordInference(inputs)}
              >
                {isSending ? "Recording" : "Record on Testnet"}
              </button>
            </div>

            {!isConfigured ? (
              <p className="onnx-alert" role="status">
                Contract address is not configured yet. Deploy the RitualRiskEngine contract and set
                NEXT_PUBLIC_RITUAL_RISK_ENGINE_ADDRESS.
              </p>
            ) : null}
            {error ? (
              <p className="onnx-alert onnx-alert--error" role="alert">
                {error}
              </p>
            ) : null}
          </section>

          <section className="onnx-panel onnx-panel--result" aria-labelledby="onnx-result-title">
            <div className="onnx-panel-heading">
              <div>
                <h2 id="onnx-result-title">Ritual Result</h2>
                <p>Returned by the deployed contract and Ritual ONNX precompile.</p>
              </div>
            </div>

            <div className="onnx-result-orb" data-tone={resultTone(result)}>
              <span>{result?.label ?? "Ready"}</span>
              <strong>{result ? formatScore(result.score) : "--"}</strong>
            </div>

            <p className="onnx-result-copy">
              {result
                ? describeRisk(result.score)
                : "Use the sample signals or tune the values, then run the model on Ritual Testnet."}
            </p>

            <dl className="onnx-facts">
              <div>
                <dt>Network</dt>
                <dd>
                  {ritualTestnet.name} ({ritualTestnet.id})
                </dd>
              </div>
              <div>
                <dt>Contract</dt>
                <dd>
                  {isConfigured ? (
                    <a
                      href={ritualExplorerAddressUrl(contractAddress)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortHex(contractAddress)}
                    </a>
                  ) : (
                    "Pending"
                  )}
                </dd>
              </div>
              <div>
                <dt>ONNX precompile</dt>
                <dd>{shortHex(ritualOnnxPrecompileAddress)}</dd>
              </div>
              <div>
                <dt>Tensor dtype</dt>
                <dd>FLOAT32 / Ritual dtype {tensorPreview.dtype}</dd>
              </div>
              <div>
                <dt>Tensor shape</dt>
                <dd>[{tensorPreview.shape.join(", ")}]</dd>
              </div>
              {lastTxUrl ? (
                <div>
                  <dt>Transaction</dt>
                  <dd>
                    <a href={lastTxUrl} target="_blank" rel="noreferrer">
                      View on explorer
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <section className="onnx-panel onnx-panel--details" aria-labelledby="onnx-details-title">
          <div>
            <h2 id="onnx-details-title">Model and Tensor</h2>
            <p>
              This is a Ritual Testnet educational demo, not financial advice. The model ID is pinned
              to a full commit hash and the visible result is decoded from the contract response.
            </p>
          </div>
          <div className="onnx-detail-grid">
            <div>
              <span>Model</span>
              <code>{ritualRiskModel.id}</code>
            </div>
            <div>
              <span>Encoded RitualTensor</span>
              <code>{shortHex(tensorPreview.encoded, 18, 18)}</code>
            </div>
          </div>
        </section>
      </motion.section>
    </main>
  );
}
