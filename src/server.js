require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const outdoorRoutes = require('./routes/outdoors');
const anuncioRoutes = require('./routes/anuncios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Conexão com MongoDB
console.log('Conectando ao MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
})
.catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/outdoors', outdoorRoutes);
app.use('/api/anuncios', anuncioRoutes);

// Rota para o player de outdoor
app.get('/outdoor/:codigo', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/outdoor.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 