import { Message } from "discord.js";
import * as database from "../../../../database";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "quotes block",
	trigger: ["block"],
	help: {
		description: "Set channels that quotes can't run.",
		syntax: "/quotes `block` `<#channels>`",
	},
	run: async (message: Message, args: string[]) => {
		if (!message.member) return;

		if (
			!message.member.permissions.has("MANAGE_GUILD", true) &&
			message.author.id !== ownerId
		)
			return message.channel.send({ embeds: [MissingPermissions] });

		let guild = await database.guilds.findById(message.guildId);

		if (!message.guild) return;
		if (!guild) return;

		args.shift();

		const channels = message.mentions.channels;

		if (!message.member?.permissions.has("MANAGE_CHANNELS", true))
			return message.channel.send({ embeds: [MissingPermissions] });

		if (channels.size < 1)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ Provide at least one channel to allow."
					),
				],
			});

		const blacklist = guild.fun.blacklist.channels;

		const added_channels: string[] = [];
		channels.forEach((channel) => {
			if (!message.guild?.channels.cache.find((c) => c.id == channel.id))
				return;

			if (
				!blacklist.includes(channel.id) &&
				channel.type == "GUILD_TEXT"
			) {
				blacklist.push(channel.id);
				added_channels.push(channel.id);
			}
		});

		guild.fun.blacklist.channels = blacklist;

		if (added_channels.length < 1)
			return message.channel.send({
				embeds: [
					generateErrorEmbed(
						"❗ No channels were added to the blacklist."
					),
				],
			});

		await database.guilds.findOneAndUpdate({ _id: message.guildId }, guild);

		message.channel.send({
			embeds: [
				generateSuccessEmbed(
					`✅ Done! Use \`${guild.prefix}quotes status\` to check`
				),
			],
		});
	},
};
