const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('single', 'multi'),
    allowNull: false,
    defaultValue: 'single',
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
  },
  optionsJson: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'assessment_questions',
  timestamps: true,
});

module.exports = AssessmentQuestion;