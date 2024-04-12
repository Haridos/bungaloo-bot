const { DataTypes } = require('sequelize');
const { sequelize } = require('./sqlite-storage.js'); 

const AuditTrailRecord = sequelize.define('AuditTrailRecord', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    changedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, 
  {
      indexes: [
          {
              fields: ['userId', 'serverId'],
          }
      ]
  });

AuditTrailRecord.sync({ force: false });
module.exports = AuditTrailRecord;