import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generateRoadmap(
    topic,
    userPreferences = { depth: "Balanced", videoLength: "Medium" }
  ) {
    try {
      // Map user preferences to generation parameters
      const depthMapping = {
        Fast: { points: 3, detail: "concise" },
        Balanced: { points: 4, detail: "balanced" },
        Detailed: { points: 5, detail: "comprehensive" },
      };

      const currentDepth =
        depthMapping[userPreferences.depth] || depthMapping["Balanced"];

      const prompt = `
        Create a comprehensive learning roadmap for: "${topic}"
        
        User preferences:
        - Depth: ${userPreferences.depth} (${currentDepth.detail} approach)
        - Video Length Preference: ${userPreferences.videoLength}
        
        First, extract the main technology/topic from the query "${topic}". For example:
        - "help me learning with java" -> "java"
        - "I want to learn React Native" -> "react native"
        - "machine learning tutorial" -> "machine learning"
        
        Then provide a structured roadmap divided into 3 levels:
        1. beginner: ${currentDepth.points} fundamental topics for beginners
        2. intermediate: ${
          currentDepth.points
        } topics for intermediate learners  
        3. advanced: ${currentDepth.points} topics for advanced learners
        
        Each level should contain only the topic names as strings, no descriptions or additional information.
        Make the topics ${
          currentDepth.detail
        } and appropriate for someone who prefers ${userPreferences.videoLength.toLowerCase()} learning sessions.
        
        Format the response as a JSON structure with the following schema:
        {
            "extractedTopic": "main_technology_name",
            "roadmap": {
                "beginner": ["topic1", "topic2", "topic3", ...],
                "intermediate": ["topic1", "topic2", "topic3", ...],
                "advanced": ["topic1", "topic2", "topic3", ...]
            }
        }
        
        Make sure topics are progressive and build upon each other.
        Return only the JSON, no additional text.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text;

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const roadmapData = JSON.parse(jsonMatch[0]);

      if (!roadmapData.extractedTopic || !roadmapData.roadmap) {
        throw new Error("Invalid roadmap structure received");
      }

      return roadmapData;
    } catch (error) {
      console.error("Error generating roadmap:", error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  async generateVideoTitles(
    topic,
    pointTitle,
    userPreferences = { depth: "Balanced", videoLength: "Medium" }
  ) {
    try {
      // Map user preferences to video characteristics
      const videoLengthMapping = {
        Short: { duration: "5-10 minutes", type: "quick tutorials or tips" },
        Medium: { duration: "10-30 minutes", type: "comprehensive tutorials" },
        Long: {
          duration: "30+ minutes",
          type: "in-depth tutorials or courses",
        },
      };

      const depthMapping = {
        Fast: { approach: "quick overview", complexity: "beginner-friendly" },
        Balanced: {
          approach: "balanced coverage",
          complexity: "intermediate level",
        },
        Detailed: {
          approach: "comprehensive deep-dive",
          complexity: "detailed and thorough",
        },
      };

      const videoLength =
        videoLengthMapping[userPreferences.videoLength] ||
        videoLengthMapping["Medium"];
      const depth =
        depthMapping[userPreferences.depth] || depthMapping["Balanced"];

      const prompt = `
        Generate a list of 3 real-sounding YouTube video titles for learning "${pointTitle}" in the context of "${topic}".
        
        User preferences:
        - Depth: ${userPreferences.depth} (${depth.approach}, ${depth.complexity})
        - Video Length: ${userPreferences.videoLength} (${videoLength.duration}, ${videoLength.type})
        
        Make the titles sound like they would be for ${videoLength.type} that provide a ${depth.approach} of the topic.
        The titles should be realistic and appealing for YouTube videos.
        
        Only return the list in this format:
        [
          "Video title 1",
          "Video title 2",
          "Video title 3"
        ]
        Don't include anything else.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text;

      // Extract JSON array from the response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error("No valid JSON array found in response");
      }

      const videoTitles = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(videoTitles) || videoTitles.length === 0) {
        throw new Error("Invalid video titles array received");
      }

      return videoTitles;
    } catch (error) {
      console.error("Error generating video titles:", error);
      throw new Error(`Failed to generate video titles: ${error.message}`);
    }
  }
}

export default new GeminiService();
