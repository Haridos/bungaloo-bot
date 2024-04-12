const { DataTypes } = require('sequelize');
const { sequelize } = require('./sqlite-storage.js'); 

const NameChangeRecord = sequelize.define('NameChangeRecord', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lastChangedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  changedTo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  changedAt: {
    type: DataTypes.DATE
  },
  expiresAt: {
    type: DataTypes.DATE
  }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'serverId'],
        }
    ]
});

NameChangeRecord.sync({ force: false });
module.exports = NameChangeRecord;
