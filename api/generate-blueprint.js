// ============================================
// Vercel Serverless Function
// API: /api/generate-blueprint
// ============================================

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// Using Llama 2 70B Chat with specific working version hash
const MODEL_VERSION = 'meta/llama-2-70b-chat:2796ee9483c3fd7f2f4cd59390915ae1c6eb2a739d3892c3dc9487a4bac247e2';

// Rate limiting (in-memory, will reset on redeployment)
const rateLimits = {
    perIP: {}, // { 'ip-address': { count: number, resetTime: timestamp } }
    global: { count: 0, resetTime: 0 }
};

// Configuration from environment variables
const CONFIG = {
    MAX_REQUESTS_PER_IP: parseInt(process.env.RATE_LIMIT_PER_IP || '3'),
    MAX_REQUESTS_GLOBAL: parseInt(process.env.RATE_LIMIT_GLOBAL || '100'),
    IP_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    GLOBAL_WINDOW_MS: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Check and enforce rate limits
 */
function checkRateLimit(ip) {
    const now = Date.now();

    // Check IP-based rate limit
    if (!rateLimits.perIP[ip]) {
        rateLimits.perIP[ip] = { count: 0, resetTime: now + CONFIG.IP_WINDOW_MS };
    }

    const ipLimit = rateLimits.perIP[ip];

    // Reset IP counter if window expired
    if (now > ipLimit.resetTime) {
        ipLimit.count = 0;
        ipLimit.resetTime = now + CONFIG.IP_WINDOW_MS;
    }

    if (ipLimit.count >= CONFIG.MAX_REQUESTS_PER_IP) {
        const resetInMinutes = Math.ceil((ipLimit.resetTime - now) / 60000);
        return {
            allowed: false,
            error: `Rate limit exceeded for your IP. Please try again in ${resetInMinutes} minutes.`,
            retryAfter: resetInMinutes * 60
        };
    }

    // Check global rate limit
    if (now > rateLimits.global.resetTime) {
        rateLimits.global.count = 0;
        rateLimits.global.resetTime = now + CONFIG.GLOBAL_WINDOW_MS;
    }

    if (rateLimits.global.count >= CONFIG.MAX_REQUESTS_GLOBAL) {
        const resetInHours = Math.ceil((rateLimits.global.resetTime - now) / 3600000);
        return {
            allowed: false,
            error: `Daily request limit reached. Please try again in ${resetInHours} hours.`,
            retryAfter: resetInHours * 3600
        };
    }

    // Increment counters
    ipLimit.count++;
    rateLimits.global.count++;

    return { allowed: true };
}

/**
 * Get client IP address from request
 */
function getClientIP(request) {
    // Try various headers for the real IP
    const forwarded = request.headers['x-forwarded-for'];
    const realIP = request.headers['x-real-ip'];
    const cfConnectingIP = request.headers['cf-connecting-ip'];

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return '0.0.0.0'; // Fallback
}

/**
 * Build the prompt for GPT-3.5-turbo
 */
function buildPrompt(answers) {
    const step1 = answers.step1 || {};
    const step2 = answers.step2 || {};
    const step3 = answers.step3 || {};

    return `You are a lean side-income builder who helps users turn skills and interests into real offers, real tests, and real first sales.

CONTEXT
You work with users who want extra income but feel stuck or overwhelmed. Some want online income, others want to monetize skills or hobbies, and many do not know where to start.

USER INFORMATION
Skills: ${step1.skills || 'Not specified'}
Interests: ${step1.interests || 'Not specified'}
Time Available: ${step1.time || 'Not specified'} hours per week
Work Preference: ${step1.workType || 'Not specified'}

Income Target: ${step2.income || 'Not specified'} per month
Timeline: First dollar in ${step2.timeline || 'Not specified'}

Energizing Work: ${step3.enjoy || 'Not specified'}
Draining Work: ${step3.avoid || 'Not specified'}

INSTRUCTIONS
Generate a complete Income Idea Blueprint for this user. Follow this exact structure:

1. User Context
Summarize the user's skills, interests, time availability, constraints, resources, income target, and timeline in 2-3 sentences.

2. Opportunity Map
List 3-5 tailored side-income ideas that match the user's profile. For each idea, provide:
- Title (bold)
- What it involves (1-2 sentences)
- Who it serves (target audience)
- How money comes in (revenue model)
- Why it fits this user (specific connection to their profile)

3. Idea Evaluation
Evaluate each idea from the Opportunity Map across three dimensions:
- Fit: Alignment with strengths, interests, schedule, and comfort level
- Feasibility: Ability to start with low risk and low setup
- Financial Potential: Realistic earning power and scaling paths over time
Also include time to first income, risk level, and the first obstacle the user is likely to hit.

4. Chosen Opportunity
Select the SINGLE best opportunity for this user based on all factors. Explain why it stands out for this user right now (2-3 sentences).

5. Quick Validation Plan
Provide a concrete, low-cost validation plan for 1-2 weeks. Include:
- 3-5 specific actions to take
- What evidence to collect (signs of interest, commitments, etc.)
- Clear pass-fail criteria for whether to proceed

6. Action Plan
Break the plan into three timeframes:
- Week 1-2: specific testing and feedback collection actions
- Month 1: building a simple offer and delivery system that produces first income
- Months 2-3: refining, pricing, and growth steps if validation is positive

7. Sustainability System
Explain how the user manages time, stays consistent, and tracks progress. Include specific suggestions for:
- Time-blocking strategies
- Simple progress tracking methods
- What to do during low-energy weeks
- Accountability structure that fits their situation

8. Reflection Prompts
Provide 3 open-ended questions that help the user judge alignment, motivation, and scalability.

9. Closing Encouragement
End with 2-3 sentences reinforcing clarity, iteration, and action. Emphasize proof of progress over perfection.

IMPORTANT:
- Be specific and actionable
- Keep language simple and practical
- Avoid hype and unrealistic promises
- Every suggestion should be something the user can realistically do given their constraints
- Use clear headings and formatting
- Keep the entire response under 2000 words`;
}

/**
 * Call Replicate API with Llama 2 model
 */
async function callReplicateAPI(prompt) {
    const apiKey = process.env.REPLICATE_API_KEY;

    if (!apiKey) {
        throw new Error('REPLICATE_API_KEY is not configured');
    }

    // Create prediction with messages format for chat models
    const response = await fetch(REPLICATE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: MODEL_VERSION,
            input: {
                prompt: prompt,
                max_tokens: 2500,
                temperature: 0.7
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Failed to call Replicate API');
    }

    const prediction = await response.json();

    // Replicate API is async - we need to poll for results
    if (prediction.status === 'starting' || prediction.status === 'processing') {
        return await pollForResult(prediction.urls.get, apiKey);
    }

    return prediction;
}

/**
 * Poll Replicate for prediction completion
 */
async function pollForResult(getURL, apiKey) {
    const maxAttempts = 120; // 2 minutes timeout
    const pollInterval = 1000; // 1 second

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        const response = await fetch(getURL, {
            headers: {
                'Authorization': `Token ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to poll for results');
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
            return prediction;
        }

        if (prediction.status === 'failed' || prediction.status === 'canceled') {
            throw new Error(prediction.error || 'Prediction failed');
        }
    }

    throw new Error('Request timeout - the model is taking too long to respond. Please try again.');
}

/**
 * Parse the AI response into structured blueprint
 */
function parseBlueprint(output) {
    // The output from Replicate will be in the output field
    const text = output.output || '';

    // Parse the text response into sections
    // This is a simplified parser - you may want to enhance it
    const sections = {
        userContext: extractSection(text, 'User Context', 'Opportunity Map'),
        opportunityMap: extractListItems(text, 'Opportunity Map', 'Idea Evaluation'),
        ideaEvaluation: extractEvaluations(text, 'Idea Evaluation', 'Chosen Opportunity'),
        chosenOpportunity: extractSection(text, 'Chosen Opportunity', 'Quick Validation Plan'),
        quickValidationPlan: extractSection(text, 'Quick Validation Plan', 'Action Plan'),
        actionPlan: extractSection(text, 'Action Plan', 'Sustainability System'),
        sustainabilitySystem: extractSection(text, 'Sustainability System', 'Reflection Prompts'),
        reflectionPrompts: extractNumberedList(text, 'Reflection Prompts', 'Closing Encouragement'),
        closingEncouragement: extractSection(text, 'Closing Encouragement', null)
    };

    return sections;
}

/**
 * Extract a section between two headers
 */
function extractSection(text, startHeader, endHeader) {
    const startIndex = text.indexOf(startHeader);
    if (startIndex === -1) return '';

    let endIndex = endHeader ? text.indexOf(endHeader, startIndex) : text.length;
    if (endIndex === -1) endIndex = text.length;

    const content = text.substring(startIndex + startHeader.length, endIndex).trim();

    // Remove the header line if present
    const lines = content.split('\n').slice(1);
    return lines.join('\n').trim();
}

/**
 * Extract list items from a section
 */
function extractListItems(text, startHeader, endHeader) {
    const section = extractSection(text, startHeader, endHeader);
    const items = [];

    const lines = section.split('\n');
    let currentItem = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Look for numbered or bulleted items
        if (/^[\d\-\*]+\.\s/.test(trimmedLine) || /^\*\s/.test(trimmedLine)) {
            if (currentItem) {
                items.push(currentItem);
            }
            currentItem = { title: trimmedLine, description: '' };
        } else if (currentItem && trimmedLine) {
            currentItem.description += (currentItem.description ? ' ' : '') + trimmedLine;
        }
    }

    if (currentItem) {
        items.push(currentItem);
    }

    return items;
}

/**
 * Extract evaluation sections
 */
function extractEvaluations(text, startHeader, endHeader) {
    const section = extractSection(text, startHeader, endHeader);
    const evaluations = [];

    // Split by idea names (this is a simplified approach)
    // You may need to adjust this based on actual output format
    const lines = section.split('\n');
    let currentEvaluation = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (/^#+\s/.test(trimmedLine)) {
            // Header line - new evaluation
            if (currentEvaluation) {
                evaluations.push(currentEvaluation);
            }
            currentEvaluation = {
                idea: trimmedLine.replace(/^#+\s/, ''),
                fit: '',
                feasibility: '',
                financialPotential: ''
            };
        } else if (currentEvaluation && trimmedLine) {
            // Add to current evaluation
            const lowerLine = trimmedLine.toLowerCase();
            if (lowerLine.includes('fit:')) {
                currentEvaluation.fit = trimmedLine.split(/fit:/i)[1]?.trim() || trimmedLine;
            } else if (lowerLine.includes('feasibility:')) {
                currentEvaluation.feasibility = trimmedLine.split(/feasibility:/i)[1]?.trim() || trimmedLine;
            } else if (lowerLine.includes('financial') || lowerLine.includes('potential')) {
                currentEvaluation.financialPotential += (currentEvaluation.financialPotential ? ' ' : '') + trimmedLine;
            }
        }
    }

    if (currentEvaluation) {
        evaluations.push(currentEvaluation);
    }

    return evaluations;
}

/**
 * Extract numbered list
 */
function extractNumberedList(text, startHeader, endHeader) {
    const section = extractSection(text, startHeader, endHeader);
    const items = [];

    const lines = section.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (/^\d+\./.test(trimmedLine)) {
            items.push(trimmedLine.replace(/^\d+\.\s*/, ''));
        }
    }

    return items;
}

/**
 * Main handler for the API route
 */
export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({
            success: false,
            error: 'Method not allowed. Please use POST.'
        });
    }

    try {
        // Get client IP
        const ip = getClientIP(request);

        // Check rate limits
        const rateLimitCheck = checkRateLimit(ip);
        if (!rateLimitCheck.allowed) {
            return response.status(429).json({
                success: false,
                error: rateLimitCheck.error,
                retryAfter: rateLimitCheck.retryAfter
            });
        }

        // Parse request body
        const { answers } = request.body;

        if (!answers) {
            return response.status(400).json({
                success: false,
                error: 'Missing required field: answers'
            });
        }

        // Build the prompt
        const prompt = buildPrompt(answers);

        // Call Replicate API
        const prediction = await callReplicateAPI(prompt);

        // Parse the response
        const blueprint = parseBlueprint(prediction);

        // Return success
        return response.status(200).json({
            success: true,
            data: blueprint
        });

    } catch (error) {
        console.error('Error in generate-blueprint API:', error);

        return response.status(500).json({
            success: false,
            error: error.message || 'An unexpected error occurred. Please try again.'
        });
    }
}
