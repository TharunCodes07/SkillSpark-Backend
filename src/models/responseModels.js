// Response models for type safety and consistency

export class PointResponse {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.level = data.level;
    this.order = data.order;
    this.playlists = data.playlists || null;
    this.isCompleted = data.isCompleted || false;
  }
}

export class ProgressResponse {
  constructor(data) {
    this.completedPoints = data.completedPoints || 0;
    this.totalPoints = data.totalPoints || 0;
    this.percentage = data.percentage || 0;
  }
}

export class RoadmapDataResponse {
  constructor(data) {
    this.id = data.id;
    this.topic = data.topic;
    this.title = data.title;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.points = data.points || [];
    this.progress = data.progress;
  }
}

export class SuccessResponse {
  constructor(data) {
    this.success = true;
    this.data = data;
  }
}

export class ErrorDetails {
  constructor(code, message, details) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}

export class ErrorResponse {
  constructor(errorDetails) {
    this.success = false;
    this.error = errorDetails;
  }
}

export class PlaylistItem {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.videoUrl = data.videoUrl;
    this.duration = data.duration || "N/A";
    this.description = data.description;
  }
}

export class PlaylistSuccessResponse {
  constructor(data) {
    this.success = true;
    this.data = data;
  }
}

// Request validation helpers
export const validateRoadmapRequest = (body) => {
  if (
    !body.topic ||
    typeof body.topic !== "string" ||
    body.topic.trim() === ""
  ) {
    throw new Error("Topic is required and must be a non-empty string");
  }

  // Validate userPreferences if provided
  let userPreferences = null;
  if (body.userPreferences) {
    const prefs = body.userPreferences;
    if (
      prefs.depth &&
      !["Fast", "Balanced", "Detailed"].includes(prefs.depth)
    ) {
      throw new Error(
        "Invalid depth preference. Must be 'Fast', 'Balanced', or 'Detailed'"
      );
    }
    if (
      prefs.videoLength &&
      !["Short", "Medium", "Long"].includes(prefs.videoLength)
    ) {
      throw new Error(
        "Invalid videoLength preference. Must be 'Short', 'Medium', or 'Long'"
      );
    }
    userPreferences = {
      depth: prefs.depth || "Balanced",
      videoLength: prefs.videoLength || "Medium",
    };
  }

  return {
    topic: body.topic.trim(),
    userPreferences: userPreferences || {
      depth: "Balanced",
      videoLength: "Medium",
    },
  };
};

export const validatePlaylistRequest = (body) => {
  if (
    !body.topic ||
    typeof body.topic !== "string" ||
    body.topic.trim() === ""
  ) {
    throw new Error("Topic is required and must be a non-empty string");
  }
  if (
    !body.pointTitle ||
    typeof body.pointTitle !== "string" ||
    body.pointTitle.trim() === ""
  ) {
    throw new Error("Point title is required and must be a non-empty string");
  }

  // Validate userPreferences if provided
  let userPreferences = null;
  if (body.userPreferences) {
    const prefs = body.userPreferences;
    if (
      prefs.depth &&
      !["Fast", "Balanced", "Detailed"].includes(prefs.depth)
    ) {
      throw new Error(
        "Invalid depth preference. Must be 'Fast', 'Balanced', or 'Detailed'"
      );
    }
    if (
      prefs.videoLength &&
      !["Short", "Medium", "Long"].includes(prefs.videoLength)
    ) {
      throw new Error(
        "Invalid videoLength preference. Must be 'Short', 'Medium', or 'Long'"
      );
    }
    userPreferences = {
      depth: prefs.depth || "Balanced",
      videoLength: prefs.videoLength || "Medium",
    };
  }

  return {
    topic: body.topic.trim(),
    pointTitle: body.pointTitle.trim(),
    userPreferences: userPreferences || {
      depth: "Balanced",
      videoLength: "Medium",
    },
  };
};
