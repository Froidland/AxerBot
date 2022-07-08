/**
 * ?description: This function is used to check for each user if a reminder date matches the current date, and sends a message if true.
 */

import moment from "moment";
import { Client, TextChannel } from "discord.js";
import * as database from "../../database";
import { consoleCheck } from "../../helpers/core/logger";
import { findIndex } from "lodash";

export interface IReminder {
	time: moment.MomentInput;
	guild: string;
	channel: string;
	message: any;
}

const queue: string[] = [];
export default async (bot: Client) => {
	let users = await database.users.find();

	for (const user of users) {
		if (user.reminders.length > 0 && !queue.includes(user._id)) {
			const validReminders = user.reminders.filter(
				(r: IReminder) => moment().diff(moment(r.time), "seconds") >= 0
			);

			for (const reminder of validReminders) {
				queue.push(user._id);
				let guild = bot.guilds.cache.get(reminder.guild);

				if (guild) {
					let channel = (await bot.channels.fetch(
						reminder.channel
					)) as TextChannel;

					if (channel) {
						const reminderIndex = user.reminders.indexOf(reminder);

						await channel.send(
							`<@${user._id}> ${reminder.message}`
						);

						await guild.members.fetch(user._id).then((member) => {
							consoleCheck(
								"remindersChecker.ts",
								`Reminder sent to ${member.user.tag} in ${
									guild ? guild.name : "unknown guild"
								}`
							);
						});

						user.reminders.splice(reminderIndex, 1);
						await database.users.findByIdAndUpdate(user._id, user);
						const queue_index = queue.indexOf(user._id);
						queue.splice(queue_index, 1);
					}
				}
			}
		}
	}
};
