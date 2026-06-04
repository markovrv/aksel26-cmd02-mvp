const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LlmConfig = sequelize.define('LlmConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  baseUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  apiToken: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  modelName: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  systemPrompt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'llm_configs',
  timestamps: true,
});

module.exports = LlmConfig;