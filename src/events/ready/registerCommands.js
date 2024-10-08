require("colors");

const commandComparing = require("../../utils/commandComparing");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const { testServerId } = require("../../config.json");

module.exports = async (client) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(
			client,
			// testServerId
		);

		for (const localCommand of localCommands) {
			const { data } = localCommand;

			const commandName = data.name;
			const commandDescription = data.description;
			const commandOptions = data.options;

			const existingCommand = await applicationCommands.cache.find(
				(cmd) => cmd.name === commandName
			);

			if (existingCommand) {
				if (localCommand.deleted) {
					await applicationCommands.delete(existingCommand.id);
					console.log(
						`La commande d'application ${commandName} a été supprimée.`.red
					);
					continue;
				}

				if (commandComparing(existingCommand, localCommand)) {
					await applicationCommands.edit(existingCommand.id, {
						name: commandName,
						description: commandDescription,
						options: commandOptions,
					});
					console.log(
						`La commande d'application ${commandName} a été modifiée.`.yellow
					);
				}
			} else {
				if (localCommand.deleted) {
					console.log(
						`La commande d'application ${commandName} a été ignorée, car la propriété "deleted" est définie sur "true".`
							.grey
					);
					continue;
				}

				await applicationCommands.create({
					name: commandName,
					description: commandDescription,
					options: commandOptions,
				});
				console.log(
					`La commande d'application ${commandName} a été enregistrée.`.green
				);
			}
		}
	} catch (err) {
		console.log(`Une erreur s'est produite lors de l'enregistrement des commandes ! ${err}`.red);
		// console.log(err);
	}
};
