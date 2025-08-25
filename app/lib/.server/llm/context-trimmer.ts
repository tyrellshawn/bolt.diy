import type { Messages } from './stream-text';
import { isSmallModel, getModelContextWindow } from './model-utils';
import type { ModelInfo } from '~/utils/types';

/**
 * Estimates the token count of a message (rough approximation)
 */
function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Trims message content to fit within context window for smaller models
 */
function trimMessageContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to preserve important parts of the content
  const lines = content.split('\n');
  let trimmedContent = '';
  let currentLength = 0;

  // Prioritize keeping the beginning and end of content
  const keepStart = Math.floor(maxLength * 0.6);
  const keepEnd = Math.floor(maxLength * 0.3);

  // Add content from the start
  for (const line of lines) {
    if (currentLength + line.length + 1 <= keepStart) {
      trimmedContent += line + '\n';
      currentLength += line.length + 1;
    } else {
      break;
    }
  }

  // Add separator if content was trimmed
  if (currentLength < content.length) {
    const separator = '\n\n[... content trimmed for smaller model ...]\n\n';
    trimmedContent += separator;
    currentLength += separator.length;

    // Add content from the end if there's space
    const remainingSpace = maxLength - currentLength;

    if (remainingSpace > keepEnd && lines.length > 0) {
      const endContent = content.slice(-Math.min(keepEnd, remainingSpace));
      trimmedContent += endContent;
    }
  }

  return trimmedContent;
}

/**
 * Trims messages to fit within the context window of smaller models
 */
export function trimMessagesForSmallModel(messages: Messages, model: string, modelInfo?: ModelInfo): Messages {
  if (!isSmallModel(model, modelInfo)) {
    return messages;
  }

  const contextWindow = getModelContextWindow(model, modelInfo);
  const maxTokensPerMessage = Math.floor((contextWindow * 0.8) / messages.length); // Reserve 20% for system prompt
  const maxCharsPerMessage = maxTokensPerMessage * 4; // Rough token-to-char conversion

  return messages.map((message) => {
    if (typeof message.content === 'string') {
      const estimatedTokens = estimateTokenCount(message.content);

      if (estimatedTokens > maxTokensPerMessage) {
        return {
          ...message,
          content: trimMessageContent(message.content, maxCharsPerMessage),
        };
      }
    }

    return message;
  });
}

/**
 * Summarizes diff content for smaller models to reduce context usage
 */
export function summarizeDiffForSmallModel(diffContent: string): string {
  const lines = diffContent.split('\n');
  const addedLines = lines.filter((line) => line.startsWith('+')).length;
  const removedLines = lines.filter((line) => line.startsWith('-')).length;
  const modifiedFiles = new Set();

  // Extract file paths from diff headers
  for (const line of lines) {
    if (line.startsWith('--- ') || line.startsWith('+++ ')) {
      const match = line.match(/[ab]\/(.+)$/);

      if (match) {
        modifiedFiles.add(match[1]);
      }
    }
  }

  const summary = [
    `Modified ${modifiedFiles.size} file(s):`,
    ...Array.from(modifiedFiles).map((file) => `  - ${file}`),
    `Changes: +${addedLines} additions, -${removedLines} deletions`,
  ].join('\n');

  // If the original diff is much longer than the summary, use the summary
  if (diffContent.length > summary.length * 3) {
    return `[Diff Summary for smaller model]\n${summary}\n\n[Original diff content trimmed to reduce context usage]`;
  }

  return diffContent;
}
