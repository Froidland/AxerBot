import {
    ButtonInteraction,
    EmbedBuilder,
    Guild,
    GuildMember,
} from "discord.js";
import { User } from "../../types/user";
import getEmoji from "../../helpers/text/getEmoji";
import { guilds } from "../../database";

export async function sendVerifiedEmbed(
    user: User,
    guild: Guild,
    member: GuildMember,
    guild_db?: any,
    button?: ButtonInteraction
) {
    if (!guild_db) guild_db = await guilds.findById(guild.id);

    if (!guild_db) return;

    const usergroups = user.groups
        ?.map((group) => {
            return (
                `- ${group.short_name} ` +
                (group.playmodes || [])
                    .map((mode: string) => {
                        return `${getEmoji(mode as keyof typeof getEmoji)} `;
                    })
                    .join("")
                    .trim()
            );
        })
        .join("\n");

    const totalMapsets =
        Number(user.ranked_and_approved_beatmapset_count) +
        Number(user.loved_beatmapset_count) +
        Number(user.pending_beatmapset_count) +
        Number(user.graveyard_beatmapset_count);

    const embed = new EmbedBuilder()
        .setTitle(`✅ You are verified, ${user.username}!`)
        .setDescription(`Welcome to **${guild.name}**!`)
        .addFields(
            {
                name: "osu! profile",
                value: `[${user.username}](https://osu.ppy.sh/users/${user.id})`,
            },
            {
                name: "Ranks",
                value: `${getEmoji(
                    user.playmode.toString() as keyof typeof getEmoji
                )} 🌎 #${
                    user.statistics?.global_rank
                        ? user.statistics?.global_rank.toLocaleString("en-US")
                        : "-"
                } (${
                    user.statistics?.pp
                        ? Math.round(user.statistics?.pp).toLocaleString(
                              "en-US"
                          ) + "pp"
                        : "-"
                })\n${getEmoji(
                    user.playmode.toString() as keyof typeof getEmoji
                )} :flag_${user.country_code.toLowerCase()}: #${
                    user.statistics?.country_rank
                        ? user.statistics?.country_rank.toLocaleString("en-US")
                        : "-"
                }`,
            },
            {
                name: "Beatmap statistics",
                value: `🗺️ ${totalMapsets} ✅ ${
                    user.ranked_and_approved_beatmapset_count
                } 👥 ${user.guest_beatmapset_count}\n❤ ${
                    user.loved_beatmapset_count
                } ❓ ${
                    Number(user.pending_beatmapset_count) +
                    Number(user.graveyard_beatmapset_count)
                } 💭 ${user.nominated_beatmapset_count}
            `,
            }
        )
        .setThumbnail(user.avatar_url)
        .setColor("#07f472");

    usergroups
        ? embed.addFields({ name: "User group(s)", value: usergroups })
        : null;

    if (!button) {
        const verificationChannel: any = await guild.client.channels.fetch(
            guild_db.verification.channel
        );

        verificationChannel
            .send({
                content: `<@${member.id}>`,
                embeds: [embed],
            })
            .catch(console.error);
    } else {
        button.followUp({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
