const User = require('./User');
const UserProfile = require('./UserProfile');
const Enterprise = require('./Enterprise');
const Vacancy = require('./Vacancy');
const AssessmentSession = require('./AssessmentSession');
const AssessmentAnswer = require('./AssessmentAnswer');
const MatchResult = require('./MatchResult');
const Tour = require('./Tour');
const TourBooking = require('./TourBooking');
const Application = require('./Application');
const Message = require('./Message');
const MessageThread = require('./MessageThread');
const LlmConfig = require('./LlmConfig');
const AssessmentQuestion = require('./AssessmentQuestion');

// Associations
User.hasOne(UserProfile, { foreignKey: 'userId' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AssessmentSession, { foreignKey: 'userId' });
AssessmentSession.belongsTo(User, { foreignKey: 'userId' });

AssessmentSession.hasMany(AssessmentAnswer, { foreignKey: 'sessionId' });
AssessmentAnswer.belongsTo(AssessmentSession, { foreignKey: 'sessionId' });

AssessmentSession.hasMany(MatchResult, { foreignKey: 'sessionId' });
MatchResult.belongsTo(AssessmentSession, { foreignKey: 'sessionId' });

Enterprise.hasMany(Vacancy, { foreignKey: 'enterpriseId' });
Vacancy.belongsTo(Enterprise, { foreignKey: 'enterpriseId' });

Enterprise.hasMany(Tour, { foreignKey: 'enterpriseId' });
Tour.belongsTo(Enterprise, { foreignKey: 'enterpriseId' });

Enterprise.hasMany(MatchResult, { foreignKey: 'enterpriseId' });
MatchResult.belongsTo(Enterprise, { foreignKey: 'enterpriseId' });

Vacancy.hasMany(MatchResult, { foreignKey: 'vacancyId' });
MatchResult.belongsTo(Vacancy, { foreignKey: 'vacancyId' });

Tour.hasMany(TourBooking, { foreignKey: 'tourId' });
TourBooking.belongsTo(Tour, { foreignKey: 'tourId' });

User.hasMany(TourBooking, { foreignKey: 'userId' });
TourBooking.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

Vacancy.hasMany(Application, { foreignKey: 'vacancyId' });
Application.belongsTo(Vacancy, { foreignKey: 'vacancyId' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

MessageThread.hasMany(Message, { foreignKey: 'threadId' });
Message.belongsTo(MessageThread, { foreignKey: 'threadId' });

User.hasMany(MessageThread, { foreignKey: 'userId' });
MessageThread.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Enterprise.hasMany(MessageThread, { foreignKey: 'enterpriseId' });
MessageThread.belongsTo(Enterprise, { foreignKey: 'enterpriseId', as: 'enterprise' });

Vacancy.hasMany(MessageThread, { foreignKey: 'vacancyId' });
MessageThread.belongsTo(Vacancy, { foreignKey: 'vacancyId' });

User.belongsTo(Enterprise, { foreignKey: 'enterpriseId' });
Enterprise.hasMany(User, { foreignKey: 'enterpriseId' });

module.exports = {
  User,
  UserProfile,
  Enterprise,
  Vacancy,
  AssessmentSession,
  AssessmentAnswer,
  MatchResult,
  Tour,
  TourBooking,
  Application,
  Message,
  MessageThread,
  LlmConfig,
  AssessmentQuestion,
};
