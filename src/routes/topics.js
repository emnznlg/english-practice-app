const express = require('express');
const router = express.Router();
const { validateServices } = require('../middleware/auth');
const { logInfo } = require('../config/logger');

// Konuları listele
router.get('/', validateServices, async (req, res, next) => {
  try {
    // Temel konular
    const topics = [
      {
        id: 'daily-life',
        title: 'Daily Life',
        description: 'Practice conversations about daily activities, routines, and casual situations.',
        difficulty: 'beginner'
      },
      {
        id: 'travel',
        title: 'Travel',
        description: 'Learn how to communicate while traveling, booking accommodations, and exploring new places.',
        difficulty: 'intermediate'
      },
      {
        id: 'business',
        title: 'Business',
        description: 'Practice professional conversations, meetings, and business negotiations.',
        difficulty: 'advanced'
      },
      {
        id: 'hobbies',
        title: 'Hobbies & Interests',
        description: 'Talk about your favorite activities, sports, music, movies, and other interests.',
        difficulty: 'beginner'
      },
      {
        id: 'culture',
        title: 'Culture & Society',
        description: 'Discuss cultural differences, traditions, current events, and social issues.',
        difficulty: 'advanced'
      }
    ];

    logInfo('Topics listed');

    res.json({
      status: 'success',
      data: topics
    });
  } catch (error) {
    next(error);
  }
});

// Konu detayı
router.get('/:id', validateServices, async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Konu detayı ve örnek konuşma başlangıçları eklenecek
    const topic = {
      id,
      title: 'Sample Topic',
      description: 'Sample description',
      difficulty: 'beginner',
      samplePrompts: [
        'Tell me about your day.',
        'What are your plans for the weekend?',
        'How do you usually spend your free time?'
      ]
    };

    logInfo('Topic details retrieved', { topicId: id });

    res.json({
      status: 'success',
      data: topic
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 