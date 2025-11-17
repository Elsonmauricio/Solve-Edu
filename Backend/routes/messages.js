const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Enviar mensagem
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, challenge, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      receiver,
      challenge,
      content
    });

    await message.save();

    await message.populate('sender', 'name avatar userType');
    await message.populate('receiver', 'name avatar userType');
    await message.populate('challenge', 'title');

    res.status(201).json(message);

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
});

// Obter conversas do utilizador
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Encontrar todas as conversas únicas
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$receiver",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiver", userId] },
                  { $eq: ["$isRead", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.__v': 0
        }
      }
    ]);

    res.json(conversations);

  } catch (error) {
    console.error('Erro ao obter conversas:', error);
    res.status(500).json({ message: 'Erro ao carregar conversas' });
  }
});

// Obter mensagens de uma conversa
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .populate('sender', 'name avatar userType')
    .populate('receiver', 'name avatar userType')
    .populate('challenge', 'title')
    .sort({ createdAt: 1 });

    // Marcar mensagens como lidas
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    res.json(messages);

  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ message: 'Erro ao carregar mensagens' });
  }
});

// Marcar mensagens como lidas
router.put('/read', auth, async (req, res) => {
  try {
    const { senderId } = req.body;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    res.json({ message: 'Mensagens marcadas como lidas' });

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({ message: 'Erro ao atualizar mensagens' });
  }
});

// Obter contagem de mensagens não lidas
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ count });

  } catch (error) {
    console.error('Erro ao obter contagem de mensagens:', error);
    res.status(500).json({ message: 'Erro ao carregar contagem' });
  }
});

module.exports = router;