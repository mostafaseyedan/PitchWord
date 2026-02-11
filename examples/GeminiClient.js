// server/modules/llm/GeminiClient.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');

class GeminiClient {
    constructor(config = {}) {
        this.project = config.project || process.env.VERTEX_GCLOUD_PROJECT || 'core-gearbox-469819-j5';
        this.location = config.location || process.env.VERTEX_SEARCH_LOCATION || 'global';
        this.defaultModel = config.defaultModel || process.env.ANALYSIS_MODEL_DEFAULT || 'gemini-flash-latest';

        this.vertexGenai = new GoogleGenAI({
            vertexai: true,
            project: this.project,
            location: this.location
        });
    }

    async generateContent(options = {}) {
        return this.generate({ ...options, structured: false });
    }

    async generateStructured(options = {}) {
        if (!options.jsonSchema) {
            throw new Error('jsonSchema is required for structured Gemini requests');
        }
        return this.generate({ ...options, structured: true });
    }

    async generate(options = {}) {
        const {
            prompt,
            promptParts,
            referenceImages,
            systemInstruction,
            jsonSchema,
            cachedContent,
            useGoogleSearch = false,
            useVertexGrounding = true,
            useNativeSchema = true,
            model,
            temperature = 1,
            topP = 0.95,
            maxOutputTokens = 32768,
            agentName = 'GeminiClient'
        } = options;

        if (!prompt) {
            throw new Error('Prompt is required for Gemini requests');
        }

        const generationConfig = {
            maxOutputTokens,
            temperature,
            topP,
            thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH
            }
        };

        // NOTE: responseSchema + Vertex AI grounding are incompatible in Gemini
        // Vertex AI Studio shows: "Text formatting does not support grounding"
        // We use prompt-based JSON with parseStructuredResponse() instead
        // Reference: https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/ground-gemini
        //
        if (jsonSchema && useNativeSchema) {
            if (useVertexGrounding) {
                console.warn(`[${agentName}] ⚠️ Vertex Grounding is enabled; ignoring jsonSchema for native structured output (incompatible).`);
            } else {
                generationConfig.responseMimeType = 'application/json';
                generationConfig.responseSchema = jsonSchema;
            }
        }

        let contents = prompt;

        if (promptParts) {
            contents = [{ role: 'user', parts: promptParts }];
        } else if (Array.isArray(prompt)) {
            contents = prompt;
        } else if (referenceImages && referenceImages.length) {
            const parts = await this.buildPromptParts(prompt, referenceImages, agentName);
            contents = [{ role: 'user', parts }];
        }

        const requestConfig = {
            model: model || this.defaultModel,
            contents,
            config: {
                ...generationConfig
            }
        };

        if (cachedContent) {
            requestConfig.cachedContent = cachedContent;
        } else if (systemInstruction) {
            const instructionPreview = systemInstruction.substring(0, 120).replace(/\s+/g, ' ');
            console.log(`[${agentName}] 📋 System instruction: "${instructionPreview}..."`);
            console.log(`[${agentName}] 📏 System instruction length: ${systemInstruction.length} chars`);
            requestConfig.systemInstruction = systemInstruction;
        }

        if (useGoogleSearch) {
            requestConfig.config.tools = [{
                googleSearch: {}
            }];
            console.log(`[${agentName}] Enabling Google Search grounding`);
        }

        if (useVertexGrounding && process.env.VERTEX_GCLOUD_PROJECT && process.env.VERTEX_RAG_CORPUS_ID) {
            const datastorePath = `projects/${process.env.VERTEX_GCLOUD_PROJECT}/locations/${process.env.VERTEX_SEARCH_LOCATION || 'global'}/collections/default_collection/dataStores/${process.env.VERTEX_RAG_CORPUS_ID}`;
            const retrievalTool = {
                retrieval: {
                    vertexAiSearch: {
                        datastore: datastorePath
                    },
                    disableAttribution: true
                }
            };

            if (requestConfig.config.tools) {
                requestConfig.config.tools.push(retrievalTool);
            } else {
                requestConfig.config.tools = [retrievalTool];
            }
            console.log(`[${agentName}] Enabling Vertex AI grounding: ${datastorePath}`);
        }

        const response = await this.vertexGenai.models.generateContent(requestConfig);

        const usageInfo = response?.usageMetadata || null;
        if (usageInfo) {
            const cacheInfo = cachedContent ? ` (💾 cached: ${usageInfo.cachedContentTokenCount ?? 0})` : '';
            console.log(
                `[${agentName}] 🧮 Token usage -> prompt: ${usageInfo.promptTokenCount ?? 'n/a'}, candidates: ${usageInfo.candidatesTokenCount ?? 'n/a'}, total: ${usageInfo.totalTokenCount ?? 'n/a'}${cacheInfo}`
            );
        }

        const aggregatedText = this.aggregateResponse(response, agentName);

        return {
            output: aggregatedText,
            usage: usageInfo ? {
                promptTokens: usageInfo.promptTokenCount ?? 0,
                completionTokens: usageInfo.candidatesTokenCount ?? 0,
                totalTokens: usageInfo.totalTokenCount ?? 0,
                cachedTokens: usageInfo.cachedContentTokenCount ?? 0
            } : null
        };
    }

    async buildPromptParts(prompt, referenceImages, agentName = 'GeminiClient') {
        const parts = [];

        if (prompt) {
            parts.push({ text: prompt });
        }

        for (const ref of referenceImages) {
            const label = typeof ref === 'string' ? '' : (ref.label || ref.name || '');
            const source = typeof ref === 'string' ? ref : (ref.source || ref.path || ref.url);
            if (!source) {
                continue;
            }
            if (label) {
                parts.push({ text: `Reference image: ${label}` });
            }
            const inlineData = await this.loadImageAsInlineData(source);
            if (inlineData) {
                parts.push({ inlineData });
            } else {
                console.warn(`[${agentName}] Failed to load reference image: ${label || source}`);
            }
        }

        return parts;
    }

    async loadImageAsInlineData(reference) {
        if (!reference) {
            return null;
        }

        if (Buffer.isBuffer(reference)) {
            return { data: reference.toString('base64'), mimeType: 'image/png' };
        }

        if (typeof reference !== 'string') {
            return null;
        }

        if (reference.startsWith('data:')) {
            const match = reference.match(/^data:(.+?);base64,(.*)$/);
            if (!match) {
                return null;
            }
            return { data: match[2], mimeType: match[1] };
        }

        if (reference.startsWith('http://') || reference.startsWith('https://')) {
            const response = await axios.get(reference, { responseType: 'arraybuffer' });
            const mimeType = response.headers['content-type'] || 'image/png';
            return {
                data: Buffer.from(response.data).toString('base64'),
                mimeType
            };
        }

        if (fs.existsSync(reference)) {
            const fileBuffer = fs.readFileSync(reference);
            const ext = path.extname(reference).toLowerCase();
            let mimeType = 'image/png';
            if (ext === '.jpg' || ext === '.jpeg') {
                mimeType = 'image/jpeg';
            } else if (ext === '.webp') {
                mimeType = 'image/webp';
            }
            return {
                data: fileBuffer.toString('base64'),
                mimeType
            };
        }

        return null;
    }

    aggregateResponse(response, agentName = 'GeminiClient') {
        const candidate = response?.candidates?.[0] || null;
        const finishReason = candidate?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            console.warn(`[${agentName}] ⚠️ Finish reason: ${finishReason}`);
        }
        const parts = candidate?.content?.parts || [];

        const textSegments = [];
        const objectSegments = [];

        for (const part of parts) {
            if (!part) continue;

            if (typeof part === 'string') {
                const trimmed = part.trim();
                if (trimmed) textSegments.push(trimmed);
                continue;
            }

            if (typeof part.text === 'string') {
                const trimmed = part.text.trim();
                if (trimmed) textSegments.push(trimmed);
            }

            const inlineData = part.inlineData || part.inline_data;
            if (inlineData?.data) {
                // Skip inline binary data (images/audio) to avoid dumping binary into logs/output.
                continue;
            }

            if (part.json && typeof part.json === 'object') {
                objectSegments.push(part.json);
            }
        }

        if (!textSegments.length && objectSegments.length === 1) {
            return objectSegments[0];
        }

        if (!textSegments.length && objectSegments.length > 1) {
            for (const obj of objectSegments) {
                try {
                    textSegments.push(JSON.stringify(obj));
                } catch (error) {
                    console.warn(`[${agentName}] Failed to stringify structured part: ${error.message}`);
                }
            }
        }

        let aggregatedText = textSegments.filter(Boolean).join('\n\n').trim();

        if (!aggregatedText && objectSegments.length === 1) {
            return objectSegments[0];
        }

        if (!aggregatedText && typeof candidate?.text === 'string') {
            aggregatedText = candidate.text.trim();
        }

        if (!aggregatedText && typeof response?.text === 'string') {
            aggregatedText = response.text.trim();
        }

        if (!aggregatedText && parts.length) {
            const fallback = parts
                .map((part) => {
                    if (typeof part === 'string') return part.trim();
                    if (typeof part?.text === 'string') return part.text.trim();
                    return '';
                })
                .filter(Boolean)
                .join('\n\n')
                .trim();
            aggregatedText = fallback;
        }

        if (!aggregatedText) {
            try {
                const partsPreview = JSON.stringify(parts, null, 2).slice(0, 500);
                console.warn(`[${agentName}] Empty response payload. Raw candidate parts preview:`, partsPreview);
            } catch (previewError) {
                console.warn(`[${agentName}] Empty response payload. Unable to stringify parts: ${previewError.message}`);
            }
            throw new Error('No response generated from query');
        }

        return aggregatedText;
    }
}

module.exports = { GeminiClient };
