import {
  DeviceActionStatus,
  UserInteractionRequired,
} from "@ledgerhq/device-management-kit";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import { SignTransactionDAStep } from "@ledgerhq/device-signer-kit-ethereum";
import type { DeviceManagementKit, DeviceSessionId } from "@ledgerhq/device-management-kit";
import { config } from "../config";
import { createSpeculosAutomation } from "./speculosAutomation";

export type SignOutcome = {
  signature?: { r: string; s: string; v: number };
  blindSigningDetected: boolean;
  steps: string[];
  error?: string;
};

export function createSignerEth(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
) {
  const builder = new SignerEthBuilder({
    dmk,
    sessionId,
    ...(config.originToken ? { originToken: config.originToken } : {}),
  });

  return builder.build();
}

export async function signTransactionOnDevice(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  serializedTx: Uint8Array,
  options: { autoApprove?: boolean; allowBlindSign?: boolean } = {},
): Promise<SignOutcome> {
  const signer = createSignerEth(dmk, sessionId);
  const steps: string[] = [];
  let blindSigningDetected = false;

  const automation =
    config.transport === "speculos" && options.autoApprove
      ? createSpeculosAutomation(
          config.speculosControllerUrl,
          config.speculosModel,
        )
      : null;

  return new Promise((resolve) => {
    const { observable } = signer.signTransaction(
      config.derivationPath,
      serializedTx,
    );

    const sub = observable.subscribe({
      next: async (state) => {
        if (state.status === DeviceActionStatus.Pending) {
          const { intermediateValue } = state;
          const step = "step" in intermediateValue ? intermediateValue.step : undefined;
          if (step) {
            steps.push(String(step));
            if (
              step === SignTransactionDAStep.BLIND_SIGN_TRANSACTION_FALLBACK ||
              step === SignTransactionDAStep.DETECT_BLIND_SIGNING
            ) {
              blindSigningDetected = true;
            }
          }

          if (!automation) {
            return;
          }

          const interaction = intermediateValue.requiredUserInteraction;

          if (interaction === UserInteractionRequired.ConfirmOpenApp) {
            await automation.confirmOpenApp();
          }

          if (interaction === UserInteractionRequired.SignTransaction) {
            if (blindSigningDetected && !options.allowBlindSign) {
              return;
            }

            if (blindSigningDetected && options.allowBlindSign) {
              await automation.signBlind();
            } else {
              await automation.signClear();
            }
          }

          if (interaction === UserInteractionRequired.Web3ChecksOptIn) {
            await automation.web3ChecksOptIn();
          }
        }

        if (state.status === DeviceActionStatus.Completed) {
          sub.unsubscribe();
          resolve({
            signature: state.output,
            blindSigningDetected,
            steps,
          });
        }

        if (state.status === DeviceActionStatus.Error) {
          sub.unsubscribe();
          resolve({
            blindSigningDetected,
            steps,
            error: String(state.error),
          });
        }

        if (state.status === DeviceActionStatus.Stopped) {
          sub.unsubscribe();
          resolve({
            blindSigningDetected,
            steps,
            error: "Signing stopped on device",
          });
        }
      },
      error: (error) => {
        sub.unsubscribe();
        resolve({
          blindSigningDetected,
          steps,
          error: String(error),
        });
      },
    });
  });
}
