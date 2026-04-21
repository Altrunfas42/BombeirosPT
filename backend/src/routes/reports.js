const express = require('express');
const prisma = require('../prisma');
const auth = require('../middlewares/auth');

const router = express.Router();

// Criar relatório (apenas cidadãos)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'CITIZEN') {
      return res.status(403).json({
        message: 'Apenas cidadãos podem criar relatórios.'
      });
    }

    const { type, description, latitude, longitude, imageUrl } = req.body || {};

    if (!type || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: 'type, description, latitude e longitude são obrigatórios.'
      });
    }

    const report = await prisma.report.create({
      data: {
        userId: req.user.id,
        type,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
        imageUrl: imageUrl || null
      }
    });

    return res.status(201).json({
      message: 'Relatório criado com sucesso.',
      report
    });
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    return res.status(500).json({
      message: 'Erro ao criar relatório.'
    });
  }
});

// Listar relatórios
router.get('/', auth, async (req, res) => {
  try {
    let reports;

    if (req.user.role === 'FIREFIGHTER') {
      reports = await prisma.report.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      reports = await prisma.report.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return res.json(reports);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    return res.status(500).json({
      message: 'Erro ao buscar relatórios.'
    });
  }
});

// Atualizar estado do relatório (apenas bombeiros)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FIREFIGHTER') {
      return res.status(403).json({
        message: 'Apenas bombeiros podem atualizar relatórios.'
      });
    }

    const reportId = parseInt(req.params.id);
    const { status } = req.body || {};

    if (isNaN(reportId)) {
      return res.status(400).json({
        message: 'ID inválido.'
      });
    }

    if (!['NEW', 'IN_REVIEW', 'RESOLVED'].includes(status)) {
      return res.status(400).json({
        message: 'Status inválido. Use NEW, IN_REVIEW ou RESOLVED.'
      });
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!existingReport) {
      return res.status(404).json({
        message: 'Relatório não encontrado.'
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status }
    });

    return res.json({
      message: 'Relatório atualizado com sucesso.',
      report: updatedReport
    });
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    return res.status(500).json({
      message: 'Erro ao atualizar relatório.'
    });
  }
});

module.exports = router;