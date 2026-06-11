import { config } from "../config";

const DEFAULT_RETRIES = 30;
const RETRY_MS = 2000;

export async function waitForSpeculos(
  url = config.speculosUrl,
  retries = DEFAULT_RETRIES,
): Promise<void> {
  const healthUrl = url.replace(/\/$/, "");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(healthUrl, { method: "GET" });
      if (response.ok || response.status === 404) {
        console.log(`Speculos API reachable at ${healthUrl}`);
        return;
      }
    } catch {
      // retry
    }

    if (attempt === retries) {
      throw new Error(
        `Speculos not reachable at ${healthUrl} after ${retries} attempts.\n` +
          "Start it: npm run speculos:up (see docs/SPECULOS.md)",
      );
    }

    console.log(
      `Waiting for Speculos (${attempt}/${retries}) at ${healthUrl}…`,
    );
    await sleep(RETRY_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  await waitForSpeculos();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export { waitForSpeculos as default };
