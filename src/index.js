const { Collection, Client, Events, GatewayIntentBits, Partials, REST, Routes} = require('discord.js');

const {loadCommands, setupEvents, Logger} = require('./utils.js');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 

const client = new Client({ 
	partials: [
		Partials.GuildMember
	],
	intents: [
	 GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, 
	 GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
	] 
});
client.commands = new Collection();

(async() => {
	
	if(!BOT_TOKEN || !CLIENT_ID)
	{
		Logger.error(`Please set env BOT_TOKEN and CLIENT_ID before running!`);
		process.exit(1);
	}

	const commands = loadCommands();
	Logger.info(`Loaded ${commands.length} commands!`);

	const rest = new REST().setToken(BOT_TOKEN);
	try 
	{
        const _commands = commands.map((command) => command.data.toJSON());
		Logger.info(`Started refreshing ${_commands.length} application (/) commands.`);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: _commands });
        Logger.info(`Successfully reloaded ${_commands.length} application (/) commands.`);
	} 
	catch (error)
	{
		Logger.error(error);
        process.exit(0);
	}

	for(let command of commands)
	{
		client.commands.set(command.data.name, command)
	}

	const handlers = setupEvents(client);
	Logger.info(`Configured ${handlers} event handlers!`);

	client.once(Events.ClientReady, readyClient => {
		Logger.info(`Bot Ready as ${readyClient.user.tag}`);
	});
	
	client.login(BOT_TOKEN);
})();

