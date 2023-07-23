import { QatUser } from "../../../../types/qat";
import getRequestStatus from "./getRequestStatus";

let parseUsergroupFromQatUser = (user: QatUser): string => {
    let usergroup;
    if (user.groups.includes("nat")) {
        usergroup = "🟠";
        // usergroup = "<:1n:992500805527674940>";
    } else if (user.groups.includes("bn") && user.probationModes.length === 0) {
        usergroup = "🟣";
        // usergroup = "<:2b:992500782274457702>";
    } else usergroup = "⚪";
    // usergroup = "<:3p:992500821591867442>";
    return usergroup;
};

export default function getOpenBNsPerMode(
    openBNs: QatUser[],
    mode: string,
    type: "link" | "status",
    count?: boolean
): string {
    let bns = [];
    for (let openBN of openBNs) {
        if (openBN.modesInfo.find((m) => m.mode === mode)) {
            switch (type) {
                case "link":
                    bns.push(
                        `${parseUsergroupFromQatUser(openBN)} [${
                            openBN.username
                        }](https://osu.ppy.sh/users/${openBN.osuId})`
                    );
                    break;
                case "status":
                    bns.push(
                        `**${parseUsergroupFromQatUser(openBN)} [${
                            openBN.username
                        }](https://osu.ppy.sh/users/${openBN.osuId})** (${getRequestStatus(
                            openBN
                        )})`
                    );
                    break;
                default:
                    break;
            }
        }
    }
    // ? return count if requested
    if (count) return bns.length.toString();

    // ? sort with default icons
    bns.sort((a, b) => {
        if (a.includes("🟠")) return -1;
        if (b.includes("🟠")) return 1;
        if (a.includes("🟣")) return -1;
        if (b.includes("🟣")) return 1;
        return 0;
    });

    // ? show only 20 bns, with a truncation message mentioning how many are left
    if (bns.length > 20 && type === "link") {
        return bns.slice(0, 20).join("\n") + `\n... and \`${bns.length - 20}\` more`;
    } else {
        return bns.join("\n");
    }
}
