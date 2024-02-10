/**
 * * ======================== start.ts
 * ? cron jobs
 */

import config from "../../config.json";
import { updateKudosuRankings } from "./jobs/updateKudosuRankings";
import { consoleCheck } from "../../helpers/core/logger";

function start() {
	// @ts-expect-error config may not have the automation property.
	if (config.automation) {
		consoleCheck("cron", "Starting cron jobs...");
		updateKudosuRankings.start();
	}
}

start();
