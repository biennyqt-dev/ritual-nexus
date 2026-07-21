"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEventLogs,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import {
  ritualExplorerTxUrl,
  ritualRiskEngineAbi,
  ritualRiskEngineAddress,
  ritualTestnet,
} from "@/config/ritualOnnx";
import {
  float32BitsToNumber,
  riskLabelFromCode,
  toFloat32Bits,
  type RiskResult,
} from "@/services/ritualTensor";
import { useCallback, useMemo, useState } from "react";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const ritualChainIdHex = `0x${ritualTestnet.id.toString(16)}`;

function mapContractResult(result: readonly unknown[], transactionHash?: `0x${string}`): RiskResult {
  const scoreBits = Number(result[0]);
  const riskCode = Number(result[1]);

  return {
    scoreBits,
    score: float32BitsToNumber(scoreBits),
    riskCode,
    label: riskLabelFromCode(riskCode),
    rawTensor: result[2] as Hex,
    outputArithmetic: Number(result[3]),
    outputScale: Number(result[4]),
    rounding: Number(result[5]),
    transactionHash,
  };
}

async function switchToRitual(provider: EthereumProvider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ritualChainIdHex }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: ritualChainIdHex,
          chainName: ritualTestnet.name,
          nativeCurrency: ritualTestnet.nativeCurrency,
          rpcUrls: ritualTestnet.rpcUrls.default.http,
          blockExplorerUrls: [ritualTestnet.blockExplorers.default.url],
        },
      ],
    });
  }
}

export function useRitualRiskEngine() {
  const [account, setAccount] = useState<Address | null>(null);
  const [lastTxUrl, setLastTxUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const isConfigured = ritualRiskEngineAddress !== zeroAddress;

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: ritualTestnet,
        transport: http(ritualTestnet.rpcUrls.default.http[0]),
      }),
    [],
  );

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const provider = window.ethereum;
      if (!provider) {
        throw new Error("Open this page in a browser with a wallet that supports Ritual Testnet.");
      }

      await switchToRitual(provider);
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as Address[];
      setAccount(accounts[0] ?? null);
      return accounts[0] ?? null;
    } catch (connectError) {
      const message =
        connectError instanceof Error ? connectError.message : "Could not connect to Ritual Testnet.";
      setError(message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const runInference = useCallback(
    async (values: readonly number[]) => {
      setError(null);
      setIsRunning(true);

      try {
        if (!isConfigured) {
          throw new Error("Ritual Risk Engine contract address is not configured yet.");
        }

        const inputs = toFloat32Bits(values);
        const response = (await publicClient.readContract({
          address: ritualRiskEngineAddress,
          abi: ritualRiskEngineAbi,
          functionName: "runRisk",
          args: [inputs],
        })) as readonly unknown[];

        const nextResult = mapContractResult(response);
        setResult(nextResult);
        return nextResult;
      } catch (runError) {
        const message = runError instanceof Error ? runError.message : "The Ritual ONNX call failed.";
        setError(message);
        return null;
      } finally {
        setIsRunning(false);
      }
    },
    [isConfigured, publicClient],
  );

  const recordInference = useCallback(
    async (values: readonly number[]) => {
      setError(null);
      setIsSending(true);

      try {
        if (!isConfigured) {
          throw new Error("Ritual Risk Engine contract address is not configured yet.");
        }

        const provider = window.ethereum;
        if (!provider) {
          throw new Error("Open this page in a browser with a wallet that supports Ritual Testnet.");
        }

        await switchToRitual(provider);
        const walletClient = createWalletClient({
          chain: ritualTestnet,
          transport: custom(provider),
        });
        const [walletAccount] = await walletClient.getAddresses();
        setAccount(walletAccount ?? null);

        if (!walletAccount) {
          throw new Error("Wallet connection was not approved.");
        }

        const inputs = toFloat32Bits(values);
        const hash = await walletClient.writeContract({
          account: walletAccount,
          address: ritualRiskEngineAddress,
          abi: ritualRiskEngineAbi,
          functionName: "recordRisk",
          args: [inputs],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const parsed = parseEventLogs({
          abi: ritualRiskEngineAbi,
          eventName: "RiskInference",
          logs: receipt.logs,
        });
        const eventArgs = parsed[0]?.args as
          | { score?: number | bigint; riskLabel?: number | bigint; rawTensor?: Hex }
          | undefined;

        if (!eventArgs?.rawTensor) {
          throw new Error("Transaction confirmed, but no RiskInference event was found.");
        }

        const nextResult: RiskResult = {
          scoreBits: Number(eventArgs.score),
          score: float32BitsToNumber(Number(eventArgs.score)),
          riskCode: Number(eventArgs.riskLabel),
          label: riskLabelFromCode(Number(eventArgs.riskLabel)),
          rawTensor: eventArgs.rawTensor,
          outputArithmetic: 2,
          outputScale: 0,
          rounding: 1,
          transactionHash: hash,
        };

        setResult(nextResult);
        setLastTxUrl(ritualExplorerTxUrl(hash));
        return nextResult;
      } catch (sendError) {
        const message =
          sendError instanceof Error ? sendError.message : "Could not submit the Ritual Testnet transaction.";
        setError(message);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [isConfigured, publicClient],
  );

  return {
    account,
    connect,
    contractAddress: ritualRiskEngineAddress,
    error,
    isConfigured,
    isConnecting,
    isRunning,
    isSending,
    lastTxUrl,
    recordInference,
    result,
    runInference,
  };
}
