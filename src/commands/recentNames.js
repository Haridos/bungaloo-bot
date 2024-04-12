const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AuditTrailRecord = require('../db/audit-trail-record');

function findRecentNames(userId, serverId)
{
    return AuditTrailRecord.findAll({
        where: {
            userId, serverId
        },
        limit: 10,
        order: [['changedAt', 'DESC']]
    })
}

module.exports = {
	data: new SlashCommandBuilder()
        .setName('recentnames')
        .setDescription('Shows the most recent 10 name changes in this server for a user')
        .addUserOption(option => option.setName('target').setDescription('The member to view name changes for').setRequired(false)),
	async execute(interaction)
    {
        const target = interaction.options.getUser('target') || interaction.user;
        const recentNameChanges = await findRecentNames(target.id, interaction.guild.id);
        if(!recentNameChanges || recentNameChanges.length === 0)
        {
            return await interaction.reply(
                { 
                    content: `You don't have any recent name changes in this server.`, 
                    ephemeral: true 
                }
            );
        }
        let counter = 1;
        const lines = recentNameChanges.map((namechange) => `${counter++}) ${namechange.name}`).join('\n');
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`Recent Names for ${target.username}`)
                .addFields({
                    name: '\u200B', value: `\`\`\`${lines}\`\`\``
                })
                .setTimestamp()
            ]
        })
    }
};