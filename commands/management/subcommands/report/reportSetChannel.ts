import { ChannelType, PermissionFlagsBits } from "discord.js";
import { guilds } from "../../../../database";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommandSubcommand } from "../../../../models/commands/SlashCommandSubcommand";

const reportSetChannel = new SlashCommandSubcommand(
    "channel",
    "Sets the channel for the system",
    {
        syntax: "/report `set channel` `text_channel:<channel>`",
        example: "/report `set channel` `text_channel:#arrival`",
    },
    [PermissionFlagsBits.ManageGuild]
);

reportSetChannel.builder.addChannelOption((o) =>
    o.setName("channel").setDescription("System channel")
);

reportSetChannel.setExecuteFunction(async (command) => {
    const channel = command.options.getChannel("channel", true);

    if (channel.type != ChannelType.GuildText)
        return command.editReply({
            embeds: [
                generateErrorEmbed("You need to provide a **TEXT** channel."),
            ],
        });

    let guild = await guilds.findById(command.guildId);
    if (!guild)
        return command.editReply({
            embeds: [
                generateErrorEmbed(
                    "This guild isn't validated yet, try again after a few seconds.."
                ),
            ],
        });

    guild.reports.enable = true;
    guild.reports.channel = channel.id;

    await guilds.findByIdAndUpdate(command.guildId, guild);

    command.editReply({
        embeds: [generateSuccessEmbed(`Report system is enabled and channel is set to <#${channel.id}>!`)],
    });
});

export default reportSetChannel;
