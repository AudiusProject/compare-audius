// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
	// Configure edge externals - only node:crypto should be external
	// This ensures @libsql/client is bundled
	edgeExternals: ["node:crypto"],
});
