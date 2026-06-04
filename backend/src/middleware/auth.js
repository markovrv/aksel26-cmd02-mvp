const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, env.jwt.secret);
      req.user = decoded;
    }
    next();
  } catch (_error) {
    next();
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

const requireEnterpriseRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.user.role !== 'enterprise_user') {
    return res.status(403).json({ error: 'Enterprise role required' });
  }
  if (!req.user.enterpriseId) {
    return res.status(403).json({ error: 'Enterprise ID missing in token. Please re-login.' });
  }
  next();
};

const checkEnterpriseOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const enterpriseId = req.params?.enterpriseId || req.body?.enterpriseId || req.query?.enterpriseId;
  if (enterpriseId && enterpriseId !== req.user.enterpriseId) {
    return res.status(403).json({ error: 'Access denied: wrong enterprise' });
  }
  next();
};

module.exports = { authMiddleware, optionalAuth, requireEnterpriseRole, checkEnterpriseOwnership, roleCheck };
