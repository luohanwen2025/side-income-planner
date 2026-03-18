// Enhanced test endpoint to diagnose Replicate API issues
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

        const testResults = [];
        const models = [
            'meta/llama-3-8b',
            'meta/llama-3-70b',
            'meta/meta-llama-3-8b',
            'meta/meta-llama-3-70b-instruct'
        ];

        // Test each model
        for (const model of models) {
            try {
                console.log(`Testing model: ${model}`);

                const testResponse = await fetch(REPLICATE_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        version: model,
                        input: {
                            prompt: 'Hello',
                            max_tokens: 5
                        }
                    })
                });

                const result = await testResponse.json();

                testResults.push({
                    model: model,
                    status: testResponse.status,
                    ok: testResponse.ok,
                    result: result
                });

                if (testResponse.ok) {
                    // If this one works, no need to test more
                    break;
                }

            } catch (error) {
                testResults.push({
                    model: model,
                    error: error.message
                });
            }
        }

        return response.status(200).json({
            success: true,
            message: 'Test complete',
            results: testResults
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message
        });
    }
}
