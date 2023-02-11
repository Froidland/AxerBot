import { UserResponse } from "../../types/user";
import { UserBeatmapetsResponse } from "../../types/beatmap";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "discord.js";
import parseUsergroup from "../../helpers/osu/player/getHighestUsergroup";
import getMappingAge from "../../helpers/osu/player/getMappingAge";

export default {
    send: (
        user: UserResponse,
        beatmaps: UserBeatmapetsResponse,
        message: Message
    ) => {
        const usergroup = parseUsergroup(user.data); // ? Get the highest usergroup

        const totalMapsets =
            Number(user.data.ranked_and_approved_beatmapset_count) +
            Number(user.data.loved_beatmapset_count) +
            Number(user.data.pending_beatmapset_count) +
            Number(user.data.graveyard_beatmapset_count);

        let e = new EmbedBuilder({
            thumbnail: {
                url: `https://a.ppy.sh/${user.data.id}`,
            },
            description: user.data.title ? `*${user.data.title}*` : undefined,
            fields: [
                {
                    name: "Mapping for",
                    value: getMappingAge(beatmaps),
                },
                {
                    name: "Followers",
                    value: `👤 ${user.data.follower_count} 🔔 ${user.data.mapping_follower_count}`,
                },
                {
                    name: "Mapset Count",
                    inline: true,
                    value: `🗺️ ${totalMapsets} ✅ ${
                        user.data.ranked_and_approved_beatmapset_count
                    } 👥 ${user.data.guest_beatmapset_count}\n❤ ${
                        user.data.loved_beatmapset_count
                    } ❓ ${
                        Number(user.data.pending_beatmapset_count) +
                        Number(user.data.graveyard_beatmapset_count)
                    } 💭 ${user.data.nominated_beatmapset_count}
					`,
                },
                {
                    name: "Playcount & Favorites",
                    inline: true,
                    value: `▶ ${beatmaps.data.sets_playcount.toLocaleString(
                        "en-US"
                    )} 💖 ${beatmaps.data.sets_favourites.toLocaleString(
                        "en-US"
                    )}`,
                },
                {
                    name: "Latest Map",
                    value: `[${beatmaps.data.last.artist} - ${beatmaps.data.last.title}](https://osu.ppy.sh/s/${beatmaps.data.last.id})`,
                },
            ],
            author: {
                name: `${user.data.username} • mapper info`,
                url: `https://osu.ppy.sh/users/${user.data.id}`,
                iconURL: usergroup.icon ? usergroup.icon : undefined,
            },
            image: {
                url: beatmaps.data.last.covers["cover@2x"],
            },
        }).setColor(usergroup.colour);

        message.reply({
            embeds: [e],
        });
    },
    reply: async (
        user: UserResponse,
        beatmaps: UserBeatmapetsResponse,
        interaction: ChatInputCommandInteraction,
        ephemeral?: boolean
    ) => {
        const usergroup = parseUsergroup(user.data); // ? Get the highest usergroup

        const totalMapsets =
            Number(user.data.ranked_and_approved_beatmapset_count) +
            Number(user.data.loved_beatmapset_count) +
            Number(user.data.pending_beatmapset_count) +
            Number(user.data.graveyard_beatmapset_count);

        let e = new EmbedBuilder({
            thumbnail: {
                url: `https://a.ppy.sh/${user.data.id}`,
            },
            description: user.data.title ? `*${user.data.title}*` : undefined,
            fields: [
                {
                    name: "Mapping for",
                    value: getMappingAge(beatmaps),
                },
                {
                    name: "Followers",
                    value: `👤 ${user.data.follower_count} 🔔 ${user.data.mapping_follower_count}`,
                },
                {
                    name: "Mapset Count",
                    inline: true,
                    value: `🗺️ ${totalMapsets} ✅ ${
                        user.data.ranked_and_approved_beatmapset_count
                    } 👥 ${user.data.guest_beatmapset_count}\n❤ ${
                        user.data.loved_beatmapset_count
                    } ❓ ${
                        Number(user.data.pending_beatmapset_count) +
                        Number(user.data.graveyard_beatmapset_count)
                    } 💭 ${user.data.nominated_beatmapset_count}
					`,
                },
                {
                    name: "Playcount & Favorites",
                    inline: true,
                    value: `▶ ${beatmaps.data.sets_playcount.toLocaleString(
                        "en-US"
                    )} 💖 ${beatmaps.data.sets_favourites.toLocaleString(
                        "en-US"
                    )}`,
                },
                {
                    name: "Latest Map",
                    value: `[${beatmaps.data.last.artist} - ${beatmaps.data.last.title}](https://osu.ppy.sh/s/${beatmaps.data.last.id})`,
                },
            ],
            author: {
                name: `${user.data.username} • mapper info`,
                url: `https://osu.ppy.sh/users/${user.data.id}`,
                icon_url: usergroup.icon ? usergroup.icon : "",
            },
            image: {
                url: beatmaps.data.last.covers["cover@2x"],
            },
        }).setColor(usergroup.colour);

        interaction
            .editReply({
                embeds: [e],
            })
            .catch(console.error);
    },
};
