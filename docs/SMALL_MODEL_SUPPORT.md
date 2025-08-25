# Small Model Support in Bolt.diy

This document describes the improvements made to support smaller/local LLMs (7B-13B parameters) in Bolt.diy.

## Problem

Smaller-scale or local LLMs sometimes fail to start the "code window" (development server preview) because:
- Default prompts are too long or complex for limited context windows
- Models omit critical steps like running the `start` command
- Complex prompts cause incomplete outputs

## Solution

### 1. Dynamic Prompt Templates

The system now automatically detects small models and uses simplified prompts:

#### Small Model Detection
Models are considered "small" if they match these patterns:
- Parameter count: 1B-13B (e.g., `llama-7b`, `mistral-7b`)
- Explicit labels: `small`, `mini`, `tiny`, `light`
- Context window < 8000 tokens

#### Simplified Prompt Template
For small models, the system uses a condensed prompt that:
- Removes verbose role descriptions
- Focuses on essential instructions
- Emphasizes the importance of running start commands
- Reduces cognitive load

### 2. Explicit Start Command Reminders

The simplified prompt includes multiple reminders:
```
CRITICAL REMINDERS:
- After making any code changes, ALWAYS use the start action to run the development server
- Never skip the start command - users need the preview to see their application
- Use `npm run dev` or `vite` to start the server after file changes
```

### 3. Context Trimming

For smaller models, the system automatically:
- Trims message content to fit context windows
- Prioritizes keeping the beginning and end of content
- Summarizes diff content when it's too long
- Reserves 20% of context for system prompt

### 4. Server Status Fallback

A fallback mechanism tracks:
- When file actions are performed
- Whether start commands have been executed
- Suggests start commands when missing

## Implementation Files

### Core Files
- `app/lib/.server/llm/model-utils.ts` - Model detection and classification
- `app/lib/.server/llm/prompts.ts` - Dynamic prompt selection
- `app/lib/.server/llm/context-trimmer.ts` - Context window management
- `app/lib/.server/llm/server-fallback.ts` - Server status tracking
- `app/lib/.server/llm/stream-text.ts` - Integration point

### Model Detection Logic
```typescript
// Examples of detected small models
isSmallModel('llama-7b-instruct') // true
isSmallModel('mistral-7b') // true
isSmallModel('claude-3-5-sonnet') // false
isSmallModel('gpt-4') // false
```

### Usage in Code
```typescript
// Automatic prompt selection
const prompt = getSystemPrompt(cwd, modelName, modelInfo);

// Context trimming
const trimmedMessages = trimMessagesForSmallModel(messages, model, modelInfo);
```

## Benefits

1. **Improved Reliability**: Small models are more likely to include start commands
2. **Better Performance**: Reduced context usage improves response quality
3. **Automatic Detection**: No manual configuration required
4. **Fallback Safety**: System detects and suggests missing start commands

## Testing

To test with small models:
1. Use Ollama with models like `llama2:7b` or `mistral:7b`
2. Create a simple web application
3. Verify that the development server starts automatically
4. Check that the preview window shows the application

## Configuration

The system works automatically, but you can customize:
- Model detection patterns in `model-utils.ts`
- Simplified prompt content in `prompts.ts`
- Context trimming thresholds in `context-trimmer.ts`

## Future Improvements

- Dynamic context window detection from model APIs
- User preference for prompt complexity
- Model-specific optimizations
- Performance metrics and monitoring