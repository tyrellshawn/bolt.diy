import type { ModelInfo } from '~/utils/types';

/**
 * Determines if a model is considered "small" based on parameter count or model name patterns
 * Small models typically have limited context windows and benefit from shorter, more focused prompts
 */
export function isSmallModel(model: string, modelInfo?: ModelInfo): boolean {
  const modelLower = model.toLowerCase();

  // Check for explicit parameter size indicators in model name
  const parameterPatterns = [
    /\b([1-9]|1[0-3])b\b/i, // 1B-13B parameters
    /\b[1-9]\.?[0-9]*b\b/i, // Decimal parameter counts like 7.5B
    /\bsmall\b/i, // Models explicitly labeled as "small"
    /\bmini\b/i, // Models labeled as "mini"
    /\btiny\b/i, // Models labeled as "tiny"
    /\blight\b/i, // Models labeled as "light"
  ];

  // Check for known small model patterns
  const smallModelPatterns = [
    /llama.*[1-9]\.?[0-9]*b/i, // Llama models with small parameter counts
    /mistral.*7b/i, // Mistral 7B
    /codellama.*7b/i, // CodeLlama 7B
    /phi-[1-3]/i, // Phi models (typically small)
    /gemma.*[1-9]b/i, // Gemma small models
    /qwen.*[1-9]\.?[0-9]*b/i, // Qwen small models
    /yi.*[1-9]\.?[0-9]*b/i, // Yi small models
  ];

  // Check parameter patterns
  for (const pattern of parameterPatterns) {
    if (pattern.test(modelLower)) {
      return true;
    }
  }

  // Check small model patterns
  for (const pattern of smallModelPatterns) {
    if (pattern.test(modelLower)) {
      return true;
    }
  }

  // Check if model info indicates small context window (less than 8k tokens)
  if (modelInfo?.maxTokenAllowed && modelInfo.maxTokenAllowed < 8000) {
    return true;
  }

  // Default to false for unknown models
  return false;
}

/**
 * Gets the appropriate context window size for a model
 */
export function getModelContextWindow(model: string, modelInfo?: ModelInfo): number {
  if (modelInfo?.maxTokenAllowed) {
    return modelInfo.maxTokenAllowed;
  }

  // Default context windows based on model patterns
  const modelLower = model.toLowerCase();

  if (isSmallModel(model, modelInfo)) {
    return 4096; // Conservative context for small models
  }

  // Larger models typically have larger context windows
  if (modelLower.includes('claude') || modelLower.includes('gpt-4')) {
    return 8000;
  }

  return 8000; // Default
}

/**
 * Determines if a model should use the simplified prompt template
 */
export function shouldUseSimplifiedPrompt(model: string, modelInfo?: ModelInfo): boolean {
  return isSmallModel(model, modelInfo);
}
