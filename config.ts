/**
 * Central configuration for Gemini API models.
 * This file allows for easy updates to model names, ensuring the app stays
 * in sync with available Gemini API formats and versions.
 * An amateur user can simply modify the values here.
 *
 * The API key is configured in the execution environment as `process.env.API_KEY`.
 */

// Model for general text tasks, chat, and analysis.
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';