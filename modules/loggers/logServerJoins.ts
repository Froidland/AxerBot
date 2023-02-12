import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import moment from "moment";
import * as database from "../../database";
import colors from "../../constants/colors";

export default async function logServerJoins(
    member: GuildMember | PartialGuildMember
) {
    try {
        const guild = await database.guilds.findOne({
            _id: member.guild.id,
        });

        if (!guild) return;

        if (guild.logging.enabled === false) return;

        if (!member.guild.channels.cache.get(guild.logging.channel)) return;

        const embed = new EmbedBuilder()
            .setColor(colors.yellowBright)
            .setAuthor({
                name: member.nickname
                    ? `${member.nickname} (${member.user.tag})`
                    : member.user.tag,
                iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(`🔰 ${member.user} has joined the server!`)
            .addFields(
                { name: "User id", value: member.id, inline: false },
                { name: "User tag", value: member.user.tag, inline: false },
                {
                    name: "Account created",
                    value: `<t:${moment(member.user.createdAt).format("X")}:f>`,
                    inline: false,
                }
            )
            .setTimestamp();

        const channel: any = member.guild.channels.cache.get(
            guild.logging.channel
        );
        if (!channel) return;

        channel.send({ embeds: [embed] }).catch((e: any) => console.error(e));
    } catch (e) {
        console.error(e);
    }
}
