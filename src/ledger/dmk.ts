import {
  ConsoleLogger,
  DeviceActionStatus,
  DeviceManagementKitBuilder,
  type DeviceManagementKit,
  type DeviceSessionId,
} from "@ledgerhq/device-management-kit";
import { nodeHidTransportFactory } from "@ledgerhq/device-transport-kit-node-hid";
import { speculosTransportFactory } from "@ledgerhq/device-transport-kit-speculos";
import { firstValueFrom, timeout } from "rxjs";
import { config } from "../config";

export function createDmk(): DeviceManagementKit {
  const builder = new DeviceManagementKitBuilder().addLogger(new ConsoleLogger());

  if (config.transport === "hid") {
    builder.addTransport(nodeHidTransportFactory);
  } else {
    builder.addTransport(speculosTransportFactory(config.speculosUrl));
  }

  return builder.build();
}

export async function connectFirstDevice(
  dmk: DeviceManagementKit,
): Promise<DeviceSessionId> {
  try {
    const device = await firstValueFrom(
      dmk.startDiscovering({}).pipe(timeout(15_000)),
    );
    return await dmk.connect({ device });
  } catch {
    throw new Error(
      `No Ledger device found via ${config.transport}. ` +
        (config.transport === "speculos"
          ? "Start Speculos: npm run speculos:up (see docs/SPECULOS.md)."
          : "Connect a Nano and open the Ethereum app."),
    );
  }
}

export async function disconnectDevice(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
): Promise<void> {
  await dmk.disconnect({ sessionId });
}

export { DeviceActionStatus };
