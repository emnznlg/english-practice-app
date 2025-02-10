const express = require("express");
const router = express.Router();
const { validateServices } = require("../middleware/auth");
const { logInfo, logError } = require("../config/logger");
const { AppError } = require("../middleware/error");
const chatService = require("../services/chat");

// Chat oturumu başlat
router.post("/start", validateServices, async (req, res, next) => {
  try {
    const { topic, level } = req.body;

    if (!topic) {
      throw new AppError("Topic is required", 400);
    }

    if (!level) {
      throw new AppError("Level is required", 400);
    }

    // Seviye kontrolü
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(level)) {
      throw new AppError(
        "Invalid level. Must be one of: beginner, intermediate, advanced",
        400
      );
    }

    logInfo("Starting chat session", { topic, level });

    // WebSocket üzerinden chat oturumu başlatılacak
    // Bu endpoint sadece başlangıç validasyonu için
    res.json({
      status: "success",
      message: "Chat session started",
      sessionId: Date.now().toString(),
    });
  } catch (error) {
    next(error);
  }
});

// Chat oturumu sonlandır ve analiz et
router.post("/end", validateServices, async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new AppError("Session ID is required", 400);
    }

    logInfo("Ending chat session", { sessionId });

    // TODO: Chat analizi yapılacak
    res.json({
      status: "success",
      message: "Chat session ended",
      analysis: {
        duration: 0,
        messageCount: 0,
        accuracy: 0,
        grammarScore: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
