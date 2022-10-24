require('dotenv').config()
const BOT_TOKEN = process.env['BOT_TOKEN'];

const fs = require('node:fs');
const path = require('node:path');

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(BOT_TOKEN);

// Load all commands from the commands folder
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Receive Interactions from user
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    console.log(interaction);

    command = interaction.client.commands.get(interaction.commandName);

    try {
        command.execute(interaction);
    } catch (error){
        console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

});