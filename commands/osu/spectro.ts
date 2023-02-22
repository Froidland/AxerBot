import { SlashCommand } from "../../models/commands/SlashCommand";
import { spawn } from "child_process";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { readFileSync, unlinkSync } from "fs";
import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

const spectrum = new SlashCommand(
    "spectro",
    "Generate mp3 frequency spectrum graph",
    "osu!",
    true
);

spectrum.builder.addAttachmentOption((o) =>
    o.setName("audio").setDescription("Audio file").setRequired(true)
);

spectrum.setExecuteFunction(async (command) => {
    const audioFileData = command.options.getAttachment("audio", true);
    const fileId = crypto.randomBytes(10).toString("hex");

    const audioFile = await axios(audioFileData.url, {
        responseType: "stream",
    });

    command.editReply({
        content: "Generating spectro, this can take a while...",
    });

    try {
        const f = ffmpeg(audioFile.data);

        if (process.env.OS == "win32") {
            f.setFfmpegPath(path.resolve("./bin/ffmpeg.exe"));
        }
        f.toFormat("wav")

            .save(`./temp/spectro/audio/${fileId}.wav`)
            .on("error", (err) => {
                console.log("An error occurred: " + err.message);
            })
            .on("end", () => {
                const pythonProcess = spawn("python", [
                    "./helpers/audio/spectrogram.py",
                    `${fileId}.wav`,
                ]);

                pythonProcess.on("exit", async () => {
                    const canvas = createCanvas(580, 440);
                    const ctx = canvas.getContext("2d");
                    const image = readFileSync(
                        path.resolve(`./temp/spectro/images/${fileId}.png`)
                    );
                    const chart = await loadImage(image);
                    ctx.drawImage(chart, 100, 0, 840, 480, -45, -30, 840, 480);

                    const attachment = new AttachmentBuilder(
                        canvas.toBuffer(),
                        {
                            name: "image.jpg",
                        }
                    );

                    command
                        .editReply({
                            content: `${command.user} Spectro for \`${attachment.name}\` generated!`,
                            files: [attachment],
                        })
                        .then(() => {
                            setTimeout(() => {
                                unlinkSync(
                                    path.resolve(
                                        `./temp/spectro/images/${fileId}.png`
                                    )
                                );
                                unlinkSync(
                                    path.resolve(
                                        `./temp/spectro/audio/${fileId}.wav`
                                    )
                                );
                            }, 30000);
                        });
                });
            });
    } catch (e) {
        console.error(e);
        return command.editReply({
            embeds: [generateErrorEmbed("Something went wrong! Sorry.")],
        });
    }
});

export default spectrum;
