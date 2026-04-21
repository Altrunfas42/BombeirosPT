const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token não fornecido.'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({
      message: 'Formato do token inválido.'
    });
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer') {
    return res.status(401).json({
      message: 'Formato do token inválido.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.'
    });
  }
}

module.exports = auth;