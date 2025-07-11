import express from "express";
import {
  PlaylistItem,
  PlaylistSuccessResponse,
  ErrorResponse,
  ErrorDetails,
  validatePlaylistRequest,
} from "../models/responseModels.js";
import geminiService from "../services/geminiService.js";
import youtubeService from "../services/youtubeService.js";
import { generateId } from "../utils/helpers.js";
import {
  playlistLimiter,
  validatePlaylistInput,
} from "../middleware/security.js";
import { appLogger } from "../utils/logger.js";

const router = express.Router();

router.post(
  "/generate",
  playlistLimiter,
  validatePlaylistInput,
  async (req, res) => {
    const startTime = Date.now();

    try {
      const { topic, pointTitle, userPreferences } = validatePlaylistRequest(
        req.body
      );

      appLogger.info("Generating playlists", {
        topic,
        pointTitle,
        userPreferences,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });

      const videoTitles = await geminiService.generateVideoTitles(
        topic,
        pointTitle,
        userPreferences
      );

      const playlists = [];
      let successCount = 0;

      for (let i = 0; i < videoTitles.length; i++) {
        const title = videoTitles[i];
        try {
          const result = await youtubeService.searchVideoByTitle(title);

          if (result) {
            const playlistItem = new PlaylistItem({
              id: generateId("playlist"),
              title: result.title,
              videoUrl: `https://youtube.com/watch?v=${result.videoId}`,
              duration: "N/A",
              description: result.description || "No description available",
            });
            playlists.push(playlistItem);
            successCount++;
          }
        } catch (videoError) {
          appLogger.warn(`Failed to search for video "${title}"`, {
            error: videoError.message,
            topic,
            pointTitle,
            ip: req.ip,
          });
        }
      }

      const processingTime = Date.now() - startTime;

      appLogger.info("Playlists generated successfully", {
        topic,
        pointTitle,
        totalRequested: videoTitles.length,
        successCount,
        processingTime: `${processingTime}ms`,
        ip: req.ip,
      });

      const response = new PlaylistSuccessResponse(playlists);
      res.json(response);
    } catch (error) {
      const processingTime = Date.now() - startTime;

      appLogger.error("Error generating playlists", error, {
        topic: req.body?.topic,
        pointTitle: req.body?.pointTitle,
        userPreferences: req.body?.userPreferences,
        processingTime: `${processingTime}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });

      const errorResponse = new ErrorResponse(
        new ErrorDetails(
          "GENERATION_FAILED",
          "Failed to generate playlists",
          process.env.NODE_ENV === "production"
            ? "Please try again later"
            : error.message
        )
      );

      res.status(500).json(errorResponse);
    }
  }
);

export default router;
