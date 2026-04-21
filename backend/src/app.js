const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const auth = require('./middlewares/auth');
const burnRoutes = require('./routes/burnRequests');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API FireWatch OK' });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nome, email e password são obrigatórios.'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Já existe um utilizador com esse email.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'CITIZEN'
      }
    });

    return res.status(201).json({
      message: 'Utilizador registado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no registo:', error);
    return res.status(500).json({
      message: 'Erro interno no servidor.'
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e password são obrigatórios.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login efetuado com sucesso.',
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      message: 'Erro interno no servidor.'
    });
  }
});

app.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Utilizador não encontrado.'
      });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Erro ao obter utilizador:', error);
    return res.status(500).json({
      message: 'Erro interno no servidor.'
    });
  }
});

app.use('/burn-requests', burnRoutes);
app.use('/reports', reportRoutes);

module.exports = app;