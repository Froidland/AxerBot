import { PrivateMessage } from "bancho.js";
import statuses from "statuses";

import osuApi from "../../../helpers/osu/fetcher/osuApi";
import {
    BeatmapCalculationResult,
    calculateBeatmap,
} from "../../../helpers/osu/performance/calculateBeatmap";
import { parseOsuBeatmapURL } from "../../../helpers/text/parseOsuBeatmapURL";
import { StandardDifficultyAttributes } from "osu-standard-stable";

export async function calculateBeatmapFromAction(pm: PrivateMessage) {
    const action = pm.getAction();

    if (!action) return;

    const split =
        /[A-Za-z0-9]+:\/\/([A-Za-z]+(\.[A-Za-z]+)+)\/[A-Za-z0-9]+\/[0-9]+.*\/[0-9]+/i;
    const args = split.exec(action);

    if (!args) return;

    const beatmapURL = parseOsuBeatmapURL(args[0]);

    if (beatmapURL.error || !beatmapURL.data) return;
    if (!beatmapURL.data.beatmap_id) return;

    const beatmapData = await osuApi.fetch.beatmap(beatmapURL.data.beatmap_id);

    if (!beatmapData.data || beatmapData.status != 200)
        return pm.user.sendMessage(
            `Error during beatmap fetch: ${statuses(beatmapData.status)}`
        );

    const osuFile = await osuApi.fetch.osuFile(beatmapURL.data.beatmap_id);

    if (osuFile.status != 200 || !osuFile.data)
        return pm.user.sendMessage(
            `Error during beatmap file fetch: ${statuses(osuFile.status)}`
        );

    const mods = getMods(pm.message.replace(//g, "")); // Remove weird unicode that bancho returns if the message is an action

    const convertMode = getMode(pm.message.replace(//g, ""));
    const convertModeName = [null, "osu!taiko", "osu!catch", "osu!mania"]; // First is null to ignore std

    const difficulty = calculateBeatmap(
        osuFile.data,
        convertMode || beatmapData.data.mode_int,
        mods
    );

    const { data: beatmap } = beatmapData;

    return pm.user.sendMessage(
        `[${args[0]} ${beatmap.beatmapset?.artist} - ${
            beatmap.beatmapset?.title
        } [${beatmap.version}]]${
            mods
                ? ` | +${mods} (${Math.round(difficulty.beatmap.bpm)}BPM) `
                : " "
        }|${
            convertMode
                ? ` ${convertModeName[difficulty.beatmap.mode]} | `
                : " "
        }${difficulty.performance
            .map((d) => `${d.acc}% ${Math.round(d.pp)}pp`)
            .join(" ▶ ")}`
    );
}

function getMods(message: string) {
    const mods: string[] = [];

    message.split(" ").forEach((arg) => {
        if (arg.startsWith("+")) mods.push(arg.slice(1));
    });

    return mods
        .map((mod) =>
            mod
                .split(/[a-z]+/g)
                .filter((a) => a != "")
                .join("")
        )
        .join("");
}

function getMode(message: string) {
    const modes: { [key: string]: number | undefined } = {
        "<Taiko>": 1,
        "<CatchTheBeat>": 2,
        "<osu!mania>": 3,
    };

    let mode = null;

    message.split(" ").forEach((arg) => {
        if (modes[arg]) mode = modes[arg];
    });

    return mode;
}