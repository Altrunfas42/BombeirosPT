const express = require('express');
const prisma = require('../prisma');
const auth = require('../middlewares/auth');

const router = express.Router();

// Criar pedido - apenas CITIZEN
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'CITIZEN') {
      return res.status(403).json({
        message: 'Apenas cidadãos podem criar pedidos.',
      });
    }

    const {
      latitude,
      longitude,
      date,
      startTime,
      endTime,
      description,
      priority,
    } = req.body || {};

    if (
      latitude === undefined ||
      longitude === undefined ||
      !date ||
      !startTime ||
      !endTime ||
      !description
    ) {
      return res.status(400).json({
        message:
          'latitude, longitude, date, startTime, endTime e description são obrigatórios.',
      });
    }

    const allowedPriorities = ['MEDIUM', 'HIGH', 'CRITICAL'];
    const safePriority = allowedPriorities.includes(priority)
      ? priority
      : 'MEDIUM';

    const burnRequest = await prisma.burnRequest.create({
      data: {
        userId: req.user.id,
        latitude: Number(latitude),
        longitude: Number(longitude),
        date: new Date(date),
        startTime,
        endTime,
        description,
        priority: safePriority,
        status: 'PENDING',
      },
    });

    return res.status(201).json(burnRequest);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return res.status(500).json({
      message: 'Erro ao criar pedido.',
    });
  }
});

// Listar pedidos
// Bombeiro vê todos; cidadão vê só os seus
router.get('/', auth, async (req, res) => {
  try {
    const isFirefighter = req.user.role === 'FIREFIGHTER';

    const requests = await prisma.burnRequest.findMany({
      where: isFirefighter
        ? {}
        : {
            userId: req.user.id,
          },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.json(requests);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(500).json({
      message: 'Erro ao listar pedidos.',
    });
  }
});

// Aprovar / Rejeitar - apenas bombeiros
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FIREFIGHTER') {
      return res.status(403).json({
        message: 'Sem permissão.',
      });
    }

    const { status } = req.body || {};
    const requestId = parseInt(req.params.id, 10);

    if (isNaN(requestId)) {
      return res.status(400).json({
        message: 'ID inválido.',
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        message: 'Status inválido.',
      });
    }

    const current = await prisma.burnRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!current) {
      return res.status(404).json({
        message: 'Pedido não encontrado.',
      });
    }

    if (current.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Pedido já finalizado.',
      });
    }

    const updated = await prisma.burnRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return res.status(500).json({
      message: 'Erro ao atualizar pedido.',
    });
  }
});

module.exports = router;