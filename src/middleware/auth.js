const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Verificando autenticação...');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Token não fornecido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    console.log('Token recebido:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    console.log('Usuário autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    console.log('Verificando se usuário é admin...');
    if (req.user.tipo !== 'admin') {
      console.log('Usuário não é admin');
      return res.status(403).json({ error: 'Acesso negado' });
    }
    console.log('Usuário é admin');
    next();
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

module.exports = { auth, isAdmin }; 