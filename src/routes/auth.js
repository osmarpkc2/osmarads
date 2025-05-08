const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    console.log('Recebendo requisição de registro:', {
      nome: req.body.nome,
      email: req.body.email,
      password: req.body.password ? '***' : undefined
    });

    const { nome, email, password } = req.body;
    
    if (!nome || !email || !password) {
      console.log('Dados incompletos:', {
        nome: nome ? 'preenchido' : 'vazio',
        email: email ? 'preenchido' : 'vazio',
        password: password ? 'preenchido' : 'vazio'
      });
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Email já cadastrado:', email);
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    console.log('Criando novo usuário...');
    const user = new User({
      nome,
      email,
      senha: password
    });

    console.log('Salvando usuário...');
    await user.save();
    console.log('Usuário salvo com sucesso:', user._id);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      },
      token
    });
  } catch (error) {
    console.error('Erro detalhado ao registrar:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      error: 'Erro ao registrar usuário',
      details: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Recebendo requisição de login:', { email: req.body.email });
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Senha incorreta para o usuário:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('Login bem-sucedido para:', email);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Obter perfil do usuário
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        nome: req.user.nome,
        email: req.user.email,
        tipo: req.user.tipo
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
});

// Rota para recuperação de senha
router.post('/recover-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Por segurança, não informamos se o email existe ou não
            return res.json({ message: 'Se o email existir, você receberá as instruções para recuperar sua senha.' });
        }

        // Gerar token de recuperação
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Em um ambiente de produção, você enviaria um email com o link de recuperação
        // Por enquanto, apenas retornamos o token (em produção, remova isso)
        res.json({
            message: 'Se o email existir, você receberá as instruções para recuperar sua senha.',
            token // Remover em produção
        });
    } catch (error) {
        console.error('Erro ao processar recuperação de senha:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

// Rota para redefinir a senha
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // Atualizar senha
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
});

module.exports = router; 