const { Events } = require('discord.js');
const { DateTime, Duration } = require("luxon");

const {cache, Logger} = require('../utils');
const NameChangeRecord = require('../db/name-change-record');
const AuditTrailRecord = require('../db/audit-trail-record.js');

//NOTE: I really do hate this but idc

function logNameChange(userId, serverId, name, changer)
{
    const leaderboardKey = `leaderboard:${serverId}:${changer}`;
    return Promise.allSettled([
        NameChangeRecord.upsert({
            userId, serverId, 
            lastChangedBy: changer, 
            changedTo: name,
            changedAt: DateTime.utc(),
            expiresAt: DateTime.utc().plus(Duration.fromObject( { hours: 24 }))
        }),
        AuditTrailRecord.create({
            userId, serverId, name
        }),
        //NOTE: Would probably be better to use redis backend for this
        cache.get(leaderboardKey).then((result) => cache.set(leaderboardKey, (result || 0) + 1))
    ]);
}

module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {
        if(msg.author.id === msg.client.user.id || msg.interaction)
        {
            return;
        }
        const namechangeKey = `namechange:${msg.channelId}`;
        const pendingNameChange = await cache.get(namechangeKey);
        if(!pendingNameChange)
        {
            return;
        }
        if(pendingNameChange === msg.author.id)
        {
            return;
        }
        //TODO: Trim if too long? Maybe check for slurs
        
        const newNickName = msg.content.trim();
        Logger.info(`Changing name to ${newNickName}!`);
        try
        {
            await msg.guild.members.edit(pendingNameChange, {
                nick: newNickName, 
                reason: `Namechanged by ${msg.author.username} Msg: ${msg.id}`
            });
        } 
        finally
        {
            await Promise.allSettled([
                cache.delete(namechangeKey),
                logNameChange(pendingNameChange, msg.guild.id, newNickName, msg.author.id)
            ]);
        }
    }
};