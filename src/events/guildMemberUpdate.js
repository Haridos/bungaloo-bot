const { Events } = require('discord.js');
const { DateTime } = require("luxon");
const NameChangeRecord = require('../db/name-change-record');

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
	name: Events.GuildMemberUpdate,
	async execute(oldMember, newMember) 
    {
        const record = await findNameChangeRecord(newMember.guild.id, newMember.user.id);
        if(!record)
        {
            return;
        }
        const expiresAt = DateTime.fromJSDate(record.expiresAt);
        if(expiresAt > DateTime.utc())
        {
            if(newMember.nickname === record.changedTo)
            {
                return;
            }
            await newMember.guild.members.edit(newMember.user.id, {
                nick: record.changedTo,
                reason: `[FORCED] Tried to Change name before 24hr`
            });
        }
    }
};