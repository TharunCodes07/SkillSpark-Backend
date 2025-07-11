import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

class YouTubeService {
  constructor() {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY environment variable is required");
    }

    this.youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  async searchVideoByTitle(title) {
    try {
      const response = await this.youtube.search.list({
        part: "snippet",
        q: title,
        type: "video",
        maxResults: 1,
      });

      if (response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        return {
          title: item.snippet.title,
          videoId: item.id.videoId,
          description: item.snippet.description,
        };
      }

      return null;
    } catch (error) {
      console.error("Error searching YouTube video:", error);
      throw new Error(`Failed to search YouTube video: ${error.message}`);
    }
  }

  async searchMultipleVideos(titles) {
    try {
      const videoPromises = titles.map((title) =>
        this.searchVideoByTitle(title)
      );
      const results = await Promise.allSettled(videoPromises);

      return results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);
    } catch (error) {
      console.error("Error searching multiple YouTube videos:", error);
      throw new Error(
        `Failed to search multiple YouTube videos: ${error.message}`
      );
    }
  }
}

export default new YouTubeService();
