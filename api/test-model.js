// Test endpoint to check Replicate API connection
export default async function handler(request, response) {
    try {
        const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
        const apiKey = process.env.REPLICATE_API_KEY;

        if (!apiKey) {
            return response.status(500).json({
                success: false,
                error: 'REPLICATE_API_KEY not found in environment variables'
            });
        }

        // Test with a simple model that's guaranteed to work
        const testResponse = await fetch(REPLICATE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'meta/llama-2-70b-chat:2796ee9483c3fd7f2f4cd59390915ae1c6eb2a739d3892c3dc9487a4bac247e2',
                input: {
                    prompt: 'Hello, world!',
                    max_tokens: 10
                }
            })
        });

        const result = await testResponse.json();

        return response.status(200).json({
            success: true,
            message: 'API key is valid',
            detail: result
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message
        });
    }
}
