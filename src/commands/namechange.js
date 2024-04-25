const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require("luxon");
const NameChangeRecord = require('../db/name-change-record');
const {cache} = require('../utils');
const NAMECHANGE_IMAGE_URL = process.env.NAMECHANGE_URL || 'https://i.imgur.com/AbdlApt.png';

function findNameChangeRecord(serverId, userId)
{
    return NameChangeRecord.findOne({
        where:
        {
            userId, serverId
        }
    });
}

module.exports = {
	data: new SlashCommandBuilder().setName('namechange').setDescription('Starts a namechange'),
	async execute(interaction)
    {    
        const record = await findNameChangeRecord(interaction.guild.id, interaction.user.id);
        if(record)
        {
            const expiresAt = DateTime.fromJSDate(record.expiresAt);
            if(expiresAt > DateTime.utc())
            {
                return await interaction.reply(
                    { 
                        content: `You can request a new name after: <t:${expiresAt.toUnixInteger()}:F> (<t:${expiresAt.toUnixInteger()}:R>)`, 
                        ephemeral: true 
                    }
                );
            }
        }

        const namechangeKey = `namechange:${interaction.channelId}`;
        const pendingNameChange = await cache.get(namechangeKey);
        if(pendingNameChange)
        {
            return await interaction.reply({
                content: `There's already a name change pending in this channel!`, ephemeral: true
            });
        }
        if(!interaction.member.manageable)
        {
            return await interaction.reply({ 
                content: 'I am missing permissions to change your nickname!', ephemeral: true 
            });
        }
        await cache.set(namechangeKey, interaction.member.id);
        try
        {
            await interaction.reply({ content: NAMECHANGE_IMAGE_URL });
        }
        catch(exception)
        {
            await cache.delete(namechangeKey);
            throw exception;
        }
    }
};