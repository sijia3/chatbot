export const DEFAULT_CHAT_MODEL = "qwen3-32b";

export const titleModel = {
  id: "qwen3-32b",
  name: "Qwen3 32B",
  description: "Model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "qwen3-32b",
    name: "Qwen3 32B",
    provider: "alibaba",
    description: "Qwen3 32B flagship model",
  },
  {
    id: "qwen-plus",
    name: "Qwen Plus",
    provider: "alibaba",
    description: "Balanced performance and cost",
  },
  {
    id: "qwen-max",
    name: "Qwen Max",
    provider: "alibaba",
    description: "Maximum capability for complex tasks",
  },
  {
    id: "qwen-turbo",
    name: "Qwen Turbo",
    provider: "alibaba",
    description: "Fast and cost-effective",
  },
  {
    id: "qwen-vl-max",
    name: "Qwen VL Max",
    provider: "alibaba",
    description: "Vision-language model for multimodal tasks",
  },
];

const staticCapabilities: Record<string, ModelCapabilities> = {
  "qwen3-32b": { tools: true, vision: false, reasoning: false },
  "qwen-plus": { tools: true, vision: false, reasoning: false },
  "qwen-max": { tools: true, vision: false, reasoning: false },
  "qwen-turbo": { tools: true, vision: false, reasoning: false },
  "qwen-vl-max": { tools: false, vision: true, reasoning: false },
};

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return staticCapabilities;
}

export const isDemo = process.env.IS_DEMO === "1";

export async function getAllModels(): Promise<ChatModel[]> {
  return chatModels.map((m) => ({
    ...m,
    capabilities: staticCapabilities[m.id] ?? {
      tools: true,
      vision: false,
      reasoning: false,
    },
  })) as any[];
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
