import { deviceControllerClientFactory } from "@ledgerhq/speculos-device-controller";

const TOUCH_MODELS = new Set(["flex", "stax"]);

export type SpeculosAutomation = {
  confirmOpenApp: () => Promise<void>;
  web3ChecksOptIn: () => Promise<void>;
  signClear: () => Promise<void>;
  signBlind: () => Promise<void>;
};

export function createSpeculosAutomation(
  baseUrl: string,
  model: string,
): SpeculosAutomation {
  const client = deviceControllerClientFactory(baseUrl);

  if (TOUCH_MODELS.has(model)) {
    const tap = client.tapFactory(model);
    return {
      confirmOpenApp: () => tap.mainButton(),
      web3ChecksOptIn: () => tap.mainButton(),
      signClear: () => tap.sign(),
      signBlind: async () => {
        await tap.enableBlindSigningSettings();
        await tap.continueToBlindSigning();
        await tap.acceptBlindSigning();
      },
    };
  }

  const buttons = client.buttonFactory();
  const approve = () => buttons.both();
  const navigateAndApprove = () =>
    buttons.pressSequence(["right", "right", "both"], 250);

  return {
    confirmOpenApp: approve,
    web3ChecksOptIn: approve,
    signClear: navigateAndApprove,
    signBlind: async () => {
      await buttons.pressSequence(
        ["right", "right", "right", "both", "both"],
        300,
      );
    },
  };
}
