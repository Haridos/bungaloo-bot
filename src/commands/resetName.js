const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { DateTime, Duration } = require("luxon");
const NameChangeRecord = require('../db/name-change-record');

function resetName(serverId, userId, admin)
{
    return NameChangeRecord.upsert({
        userId, serverId, 
        lastChangedBy: admin, 
        changedTo: '',
        changedAt: DateTime.utc(),
        expiresAt: DateTime.utc().minus(Duration.fromObject( { hours: 24 }))
    });
}

module.exports = {
	data: new SlashCommandBuilder()
        .setName('resetname')
        .setDescription('Resets a users name change')
        .addUserOption(option => option.setName('target').setDescription('The member to name change reset').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    ,
	async execute(interaction)
    {
        if(!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        {
            return await interaction.reply(
                { 
                    content: `Only moderators can use this!`, 
                    ephemeral: true 
                }
            );
        }
        const target = interaction.options.getUser('target');
        await resetName(interaction.guild.id, target.id, interaction.user.id);
        await interaction.guild.members.edit(target.id, {
            nick: '',
            reason: `Reset by ${interaction.user.username}`
        });
        return await interaction.reply(
            { 
                content: `Reset name change for ${target}`, 
                ephemeral: true 
            }
        );
    }
};