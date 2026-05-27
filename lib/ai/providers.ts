import { createOpenAI } from "@ai-sdk/openai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

// Qwen3 models require enable_thinking=false for non-streaming calls.
// For streaming calls without this param, thinking defaults to on.
// We disable it for no-thinking mode.
// This applies to all qwen-prefixed models (qwen3-32b, qwen-plus, qwen-max, etc.)
function qwenNoThinking(url: URL, init?: RequestInit) {
  if (init?.body) {
    try {
      const body = JSON.parse(init.body as string);
      if (typeof body.model === "string" && /^qwen/.test(body.model)) {
        body.enable_thinking = false;
        return new Request(url, { ...init, body: JSON.stringify(body) });
      }
    } catch {
      // not JSON, pass through
    }
  }
  return new Request(url, init);
}

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  fetch: async (url, init) => fetch(qwenNoThinking(url as URL, init)),
});

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return {
        languageModel: (modelId: string) =>
          modelId === "title-model" ? titleModel : chatModel,
      };
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return openai.chat(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return openai.chat(titleModel.id);
}
