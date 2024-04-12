const fs = require('node:fs');
const path = require('node:path');
const Keyv = require('keyv');
const log4js = require('log4js');

const cache = new Keyv(`sqlite://${process.env.DB_PATH || 'database.db'}`);
const Logger = log4js.getLogger('DiscordBot');
Logger.level = process.env.LOG_LEVEL || "info";

function safeExecute(event, ...args)
{
    try
    {
        event.execute(...args);
    }
    catch(exception)
    {
        Logger.error(`Exception in event executor`, exception);
    }
}

module.exports = {

    cache,
    Logger,
    loadCommands: function() 
    {
        const commands = [];
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolder = fs.readdirSync(foldersPath);
        
        for (const file of commandFolder) 
        {
            const commandPath = path.join(foldersPath, file);
            const command = require(commandPath);
            try 
            {
                if (command.data && command.execute)
                {
                    commands.push(command);
                } 
                else
                {
                    Logger.warn(`[WARNING] The command at ${commandPath} is missing a required "data" or "execute" property.`);
                }
            } 
            catch(exception) 
            {
                Logger.error(`Failed to parse ${file}`, exception);
            }
        }
        return commands;
    },

    setupEvents: function(client) 
    {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        let handlers = 0;
        for (const file of eventFiles)
        {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once)
            {
                client.once(event.name, (...args) => safeExecute(event, ...args));
            } 
            else 
            {
                client.on(event.name, (...args) => safeExecute(event, ...args));
            }
            handlers++;
        }
        return handlers;
    }

}