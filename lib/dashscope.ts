/**
 * DashScope (Aliyun) Embedding Utility
 * Matches OpenAI 1536-dimension format
 */

export async function generateDashScopeEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        throw new Error('DASHSCOPE_API_KEY is not defined in environment variables');
    }

    const response = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-embedding/text-embedding',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-v1',
                input: {
                    texts: [text.replace(/\n/g, ' ')],
                },
                parameters: {
                    text_type: 'query'
                }
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`DashScope API error: ${data.message || response.statusText}`);
    }

    return data.output.embeddings[0].embedding;
}

export async function generateDashScopeEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        throw new Error('DASHSCOPE_API_KEY is not defined in environment variables');
    }

    // DashScope supports batching up to 25 texts per request
    const response = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-embedding/text-embedding',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-v1',
                input: {
                    texts: texts.map(t => t.replace(/\n/g, ' ')),
                },
                parameters: {
                    text_type: 'document'
                }
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`DashScope API error: ${data.message || response.statusText}`);
    }

    return data.output.embeddings.map((e: any) => e.embedding);
}
