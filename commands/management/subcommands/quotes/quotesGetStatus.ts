import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import colors from "../../../../constants/colors";

export default {
	name: "quotes status",
	trigger: ["status"],
	help: {
		description: "Check quotes system configuration",
		syntax: "{prefix}quotes `status`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);
		if (!guild) return;

		if (!message.guild) return;

		if (!guild.fun.word) guild.fun.word = "axer";

		message.channel.send({
			embeds: [
				{
					title: "Current quotes system configuration",
					color: guild.fun.enable ? colors.green : colors.red,
					fields: [
						{
							name: "Status",
							value: guild.fun.enable
								? "`Enabled`"
								: "`Disabled`",
						},
						{
							name: "List mode",
							value: `\`${guild.fun.mode
								.charAt(0)
								.toUpperCase()
								.concat(guild.fun.mode.slice(1))}\``, // Captalize the first character
						},
						{
							name: "Trigger word",
							value: `\`${guild.fun.word.toLowerCase()}\``,
						},
						{
							name: "Reply chance",
							value: `\`${
								guild.fun.chance
									? `${guild.fun.chance}%`
									: "100%"
							}\``,
						},
						{
							name: "Blocked channels",
							value:
								guild.fun.blacklist.channels.length > 0
									? `${guild.fun.blacklist.channels.map(
											(c: any) => {
												return `<#${c}>`;
											}
									  )}`
									: "None.",
						},
					],
				},
			],
		});
	},
};
