/**
 * Cost calculation utilities for OpenAI API calls
 * Based on OpenAI pricing as of 2025
 */

interface TokenUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
}

interface ModelPricing {
    inputCostPer1k: number; // USD per 1000 input tokens
    outputCostPer1k: number; // USD per 1000 output tokens
}

// OpenAI model pricing (as of 2025) - in USD per 1K tokens
const MODEL_PRICING: Record<string, ModelPricing> = {
    // GPT-4o models
    "gpt-4o": { inputCostPer1k: 0.0025, outputCostPer1k: 0.01 },
    "gpt-4o-2024-08-06": { inputCostPer1k: 0.0025, outputCostPer1k: 0.01 },
    "gpt-4o-2024-11-20": { inputCostPer1k: 0.0025, outputCostPer1k: 0.01 },
    "gpt-4o-mini": { inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },
    "gpt-4o-mini-2024-07-18": { inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },

    // GPT-4 Turbo models
    "gpt-4-turbo": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
    "gpt-4-turbo-2024-04-09": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
    "gpt-4-0125-preview": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
    "gpt-4-1106-preview": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },

    // GPT-4.1 models
    "gpt-4.1": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
    "gpt-4_1-2025-04-14": { inputCostPer1k: 0.01, outputCostPer1k: 0.03 },
    "gpt-4_1-mini-2025-04-14": { inputCostPer1k: 0.00015, outputCostPer1k: 0.0006 },

    // GPT-3.5 Turbo models
    "gpt-3.5-turbo": { inputCostPer1k: 0.0005, outputCostPer1k: 0.0015 },
    "gpt-3.5-turbo-0125": { inputCostPer1k: 0.0005, outputCostPer1k: 0.0015 },
    "gpt-3.5-turbo-1106": { inputCostPer1k: 0.001, outputCostPer1k: 0.002 },

    // O1 models
    "o1-preview": { inputCostPer1k: 0.015, outputCostPer1k: 0.06 },
    "o1-mini": { inputCostPer1k: 0.003, outputCostPer1k: 0.012 },

    // O3 models
    "o3": { inputCostPer1k: 0.025, outputCostPer1k: 0.1 },
    "o3-mini": { inputCostPer1k: 0.005, outputCostPer1k: 0.02 },

    // O4 models
    "o4": { inputCostPer1k: 0.025, outputCostPer1k: 0.1 },
    "o4-mini": { inputCostPer1k: 0.005, outputCostPer1k: 0.02 },
};

/**
 * Get pricing for a model (with fallback to default)
 */
export const getModelPricing = (modelId: string): ModelPricing => {
    // Try exact match first
    if (MODEL_PRICING[modelId]) {
        return MODEL_PRICING[modelId];
    }

    // Try partial matches for model variants
    const modelLower = modelId.toLowerCase();

    if (modelLower.includes("gpt-4o-mini")) {
        return MODEL_PRICING["gpt-4o-mini"];
    }
    if (modelLower.includes("gpt-4o")) {
        return MODEL_PRICING["gpt-4o"];
    }
    if (modelLower.includes("gpt-4-turbo")) {
        return MODEL_PRICING["gpt-4-turbo"];
    }
    if (modelLower.includes("gpt-4.1") || modelLower.includes("gpt-4_1")) {
        if (modelLower.includes("mini")) {
            return MODEL_PRICING["gpt-4_1-mini-2025-04-14"];
        }
        return MODEL_PRICING["gpt-4_1-2025-04-14"];
    }
    if (modelLower.includes("gpt-4")) {
        return MODEL_PRICING["gpt-4-turbo"];
    }
    if (modelLower.includes("gpt-3.5-turbo") || modelLower.includes("gpt-3_5-turbo")) {
        return MODEL_PRICING["gpt-3.5-turbo"];
    }
    if (modelLower.includes("o1-mini")) {
        return MODEL_PRICING["o1-mini"];
    }
    if (modelLower.includes("o1")) {
        return MODEL_PRICING["o1-preview"];
    }
    if (modelLower.includes("o3-mini") || modelLower.includes("o4-mini")) {
        return MODEL_PRICING["o3-mini"];
    }
    if (modelLower.includes("o3") || modelLower.includes("o4")) {
        return MODEL_PRICING["o3"];
    }

    // Default fallback (GPT-3.5 Turbo pricing)
    console.warn(`⚠️ Unknown model pricing for "${modelId}", using GPT-3.5 Turbo pricing as fallback`);
    return MODEL_PRICING["gpt-3.5-turbo"];
};

/**
 * Calculate cost from token usage
 */
export const calculateCost = (
    modelId: string,
    usage: TokenUsage
): { inputCost: number; outputCost: number; totalCost: number } => {
    const pricing = getModelPricing(modelId);

    const inputTokens = usage.prompt_tokens || usage.total_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;

    const inputCost = (inputTokens / 1000) * pricing.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * pricing.outputCostPer1k;
    const totalCost = inputCost + outputCost;

    return {
        inputCost: Math.round(inputCost * 1000000) / 1000000, // Round to 6 decimals
        outputCost: Math.round(outputCost * 1000000) / 1000000,
        totalCost: Math.round(totalCost * 1000000) / 1000000,
    };
};

/**
 * Format cost for display
 */
export const formatCost = (cost: number): string => {
    if (cost < 0.001) {
        return `$${(cost * 1000).toFixed(3)}¢`;
    }
    return `$${cost.toFixed(4)}`;
};

/**
 * Log cost information for debugging
 */
export const logCost = (
    modelId: string,
    usage: TokenUsage,
    section?: string
): void => {
    const cost = calculateCost(modelId, usage);
    const pricing = getModelPricing(modelId);

    const inputTokens = usage.prompt_tokens || usage.total_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;

    const logPrefix = section ? `💰 [${section}]` : "💰";

    console.log(`${logPrefix} Model: ${modelId}`);
    console.log(`${logPrefix} Input tokens: ${inputTokens.toLocaleString()} (${formatCost(cost.inputCost)})`);
    console.log(`${logPrefix} Output tokens: ${outputTokens.toLocaleString()} (${formatCost(cost.outputCost)})`);
    console.log(`${logPrefix} Total cost: ${formatCost(cost.totalCost)}`);
    console.log(`${logPrefix} Pricing: $${pricing.inputCostPer1k}/1K input, $${pricing.outputCostPer1k}/1K output`);
};

/**
 * Accumulate costs across multiple API calls
 */
export class CostTracker {
    private costs: Array<{ model: string; cost: number; tokens: TokenUsage; section?: string }> = [];

    addCall(modelId: string, usage: TokenUsage, section?: string): void {
        const cost = calculateCost(modelId, usage);
        this.costs.push({
            model: modelId,
            cost: cost.totalCost,
            tokens: usage,
            section,
        });
    }

    getTotalCost(): number {
        return this.costs.reduce((sum, item) => sum + item.cost, 0);
    }

    getCostByModel(): Record<string, number> {
        const byModel: Record<string, number> = {};
        this.costs.forEach((item) => {
            byModel[item.model] = (byModel[item.model] || 0) + item.cost;
        });
        return byModel;
    }

    getCostBySection(): Record<string, number> {
        const bySection: Record<string, number> = {};
        this.costs.forEach((item) => {
            const section = item.section || "Unknown";
            bySection[section] = (bySection[section] || 0) + item.cost;
        });
        return bySection;
    }

    getSummary(): string {
        const total = this.getTotalCost();
        const byModel = this.getCostByModel();
        const bySection = this.getCostBySection();

        let summary = `\n💰 COST SUMMARY\n`;
        summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        summary += `Total Cost: ${formatCost(total)}\n\n`;

        summary += `By Model:\n`;
        Object.entries(byModel)
            .sort((a, b) => b[1] - a[1])
            .forEach(([model, cost]) => {
                summary += `  ${model}: ${formatCost(cost)}\n`;
            });

        summary += `\nBy Section:\n`;
        Object.entries(bySection)
            .sort((a, b) => b[1] - a[1])
            .forEach(([section, cost]) => {
                summary += `  ${section}: ${formatCost(cost)}\n`;
            });

        summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        return summary;
    }

    logSummary(): void {
        console.log(this.getSummary());
    }

    reset(): void {
        this.costs = [];
    }
}

