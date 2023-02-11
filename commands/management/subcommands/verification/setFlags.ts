import { Message, ChatInputCommandInteraction } from "discord.js";
import CommandOptionInvalid from "../../../../responses/embeds/CommandOptionInvalid";
import MissingPermissions from "../../../../responses/embeds/MissingPermissions";
import { guilds } from "../../../../database";
import { ownerId } from "./../../../../config.json";
import generateSuccessEmbed from "../../../../helpers/text/embeds/generateSuccessEmbed";
import generateErrorEmbed from "../../../../helpers/text/embeds/generateErrorEmbed";

export default {
	name: "flag",
	group: "set",
	help: {
		description:
			"Set which data that will be replaced with the osu! user data.",
		syntax: "/verification `set flags` `flag:<flag>` `status:<enable|disable>`",
		example: "/verification `set flags` `flag:username` `status:enable`",
		"avaliable flags": [
			"`username, <enable|disable>`: Set the user's discord nickname to match their osu! username",
		],
	},
	run: async (command: ChatInputCommandInteraction, args: string[]) => {
		if (!command.member) return;

		if (typeof command.member?.permissions == "string") return;

		await command.deferReply();

		if (
			!command.member.permissions.has("MANAGE_GUILD", true) &&
			command.user.id !== ownerId
		)
			return command.editReply({ embeds: [MissingPermissions] });

		const flag = command.options.getString("flag", true);
		const status =
			command.options.getString("status", true) == "true" ? true : false;

		let guild = await guilds.findById(command.guildId);
		if (!guild)
			return command.editReply(
				"This guild isn't validated, try again after some seconds.."
			);

		guild.verification.targets[flag] = status;

		await guilds.findByIdAndUpdate(command.guildId, guild);

		command.editReply({
			embeds: [generateSuccessEmbed("✅ Flag updated!")],
		});

		// if (!message.member) return;

		// if (
		// 	!message.member.permissions.has("MANAGE_GUILD", true) &&
		// 	message.author.id !== ownerId
		// )
		// 	return message.channel.send({ embeds: [MissingPermissions] });

		// if (args.length < 1)
		// 	return message.channel.send({ embeds: [CommandOptionInvalid] });

		// let guild = await guilds.findById(message.guildId);
		// if (!guild) return;

		// const validFlags = ["username"];

		// const flagsValues: any = {
		// 	username: "boolean",
		// };
		// const flagsToUpdate: { target: string; value: any }[] = [];

		// args.forEach((a) => {
		// 	const flag = a.split(",");

		// 	if (flag.length != 2) return;

		// 	if (validFlags.includes(flag[0].toLowerCase())) {
		// 		flagsToUpdate.push({
		// 			target: flag[0].toLowerCase(),
		// 			value: flag[1].toLowerCase(),
		// 		});
		// 	}
		// });

		// const clearFlags: any[] = [];

		// flagsToUpdate.forEach((flag) => {
		// 	switch (flagsValues[flag.target]) {
		// 		case "boolean": {
		// 			const booleans = ["true", "false"];
		// 			if (!booleans.includes(flag.value)) return;

		// 			clearFlags.push({
		// 				target: flag.target,
		// 				value: Boolean(flag.value),
		// 			});

		// 			break;
		// 		}
		// 	}
		// });

		// clearFlags.forEach((flag) => {
		// 	if (!guild) return;

		// 	guild.verification.targets[flag.target] = flag.value;
		// });

		// if (clearFlags.length < 1)
		// 	return message.channel.send({
		// 		embeds: [
		// 			generateErrorEmbed(
		// 				`❌ Invalid tags! Check if you're using the correct syntax using \`${guild.prefix}help verification flags\``
		// 			),
		// 		],
		// 	});

		// await guilds.findByIdAndUpdate(message.guildId, guild);

		// message.channel.send({
		// 	embeds: [generateSuccessEmbed("✅ Updated verification flags.")],
		// });
	},
};
