/**
 * Server-Side API Endpoint for LPU Assist AI Chatbot
 * Compatible with Vercel Serverless Functions and local Node/Vite middleware.
 */

import { findKnowledgeMatches } from './knowledgeBase.js';

const SYSTEM_INSTRUCTION = `You are LPU Assist, a student-support assistant for Lovely Professional University.

Your job is to help students understand academic and campus-related information in a clear, concise and friendly way.

You may assist with general questions about academics, examinations, student portals, hostel procedures, campus services and student support.

Never invent LPU rules, policies, fees, deadlines, contact numbers, procedures or statistics.

Only state university-specific information as fact when it is available from the application's verified knowledge base.

If reliable information is unavailable or the information may have changed, say that clearly and advise the student to verify the latest information through official LPU/UMS notifications.

Never ask for or store passwords, OTPs, payment information or other sensitive credentials.`;

/**
 * Universal response helper supporting both Express/Vercel (res.status().json())
 * and native Node.js http.ServerResponse.
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return sendJson(res, 405, {
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    // Parse request body if not already parsed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const { message, history = [] } = body;

    // Validate student message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return sendJson(res, 400, {
        success: false,
        error: 'Message is required and cannot be empty.'
      });
    }

    const userQuery = message.trim();

    // Check knowledge base for matches
    const matchedKnowledge = findKnowledgeMatches(userQuery);
    let knowledgeContext = '';
    const sources = [];

    if (matchedKnowledge.length > 0) {
      knowledgeContext = '\n\nVerified University Knowledge Base References:\n' +
        matchedKnowledge.map(k => {
          sources.push({
            title: k.sourceTitle,
            url: k.sourceUrl,
            lastVerifiedDate: k.lastVerifiedDate
          });
          return `Q: ${k.question}\nA: ${k.answer}\nSource: ${k.sourceTitle} (${k.sourceUrl})`;
        }).join('\n\n');
    }

    const combinedSystemPrompt = SYSTEM_INSTRUCTION + knowledgeContext;

    // Check environment variables for API keys
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // If no API key is configured, return clean setup guidance
    if (!geminiKey && !openaiKey) {
      return sendJson(res, 200, {
        success: false,
        errorType: 'MISSING_API_KEY',
        message: 'The AI backend is operational, but GEMINI_API_KEY is not yet configured in environment variables.',
        setupInstructions: 'To activate live AI responses, add your GEMINI_API_KEY to your .env file locally or under Project Settings > Environment Variables in Vercel.',
        response: `### AI Assistant Setup Notice\n\nThe server-side chatbot endpoint is active, but an AI API key is not configured.\n\n**To enable live AI answers:**\n1. Get a Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).\n2. Add \`GEMINI_API_KEY=your_key_here\` to your \`.env\` file locally or configure it in Vercel.\n3. Restart the server.\n\n*In the meantime, you can explore the FAQs and Quick Help directory.*`,
        sources: []
      });
    }

    // Call Google Gemini API
    if (geminiKey) {
      try {
        const responseText = await callGeminiAPI(geminiKey, combinedSystemPrompt, userQuery, history);
        return sendJson(res, 200, {
          success: true,
          response: responseText,
          sources: sources
        });
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError);
        // If OpenAI key is also present, fallback to OpenAI
        if (openaiKey) {
          const openAiResponse = await callOpenAIAPI(openaiKey, combinedSystemPrompt, userQuery, history);
          return sendJson(res, 200, {
            success: true,
            response: openAiResponse,
            sources: sources
          });
        }
        return sendJson(res, 200, {
          success: false,
          errorType: 'AI_SERVICE_ERROR',
          message: 'Unable to generate an AI response right now.',
          response: `I'm having trouble connecting to the AI service at the moment (${geminiError.message || 'Network/Quota issue'}). Please try asking again in a few moments or verify official circulars on UMS.`,
          sources: []
        });
      }
    }

    // Call OpenAI API fallback
    if (openaiKey) {
      try {
        const responseText = await callOpenAIAPI(openaiKey, combinedSystemPrompt, userQuery, history);
        return sendJson(res, 200, {
          success: true,
          response: responseText,
          sources: sources
        });
      } catch (openAiError) {
        console.error('OpenAI API Error:', openAiError);
        return sendJson(res, 200, {
          success: false,
          errorType: 'AI_SERVICE_ERROR',
          message: 'Unable to generate an AI response right now.',
          response: `The AI service encountered an error (${openAiError.message || 'API error'}). Please try again shortly or consult official UMS notifications.`,
          sources: []
        });
      }
    }

  } catch (error) {
    console.error('Server error in /api/chat:', error);
    return sendJson(res, 500, {
      success: false,
      error: 'An internal server error occurred while processing the chat message.'
    });
  }
}

/**
 * Call Google Gemini REST API using native fetch
 */
async function callGeminiAPI(apiKey, systemPrompt, userQuery, history) {
  // Format conversation contents for Gemini
  const contents = [];

  // Add previous conversation turns if provided
  if (Array.isArray(history)) {
    // Only take the last 8 messages to prevent context overflow
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'bot' && msg.text) {
        // Strip any HTML tags if present in history
        const cleanText = msg.text.replace(/<[^>]*>/g, '').trim();
        if (cleanText) {
          contents.push({
            role: 'model',
            parts: [{ text: cleanText }]
          });
        }
      }
    }
  }

  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800,
      topP: 0.95
    }
  };

  // Try gemini-1.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = response.statusText;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error && parsed.error.message) {
        parsedMessage = parsed.error.message;
      }
    } catch (e) {
      parsedMessage = errorBody;
    }
    throw new Error(`Gemini API returned status ${response.status}: ${parsedMessage}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return text;
}

/**
 * Call OpenAI API using native fetch
 */
async function callOpenAIAPI(apiKey, systemPrompt, userQuery, history) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history)) {
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (msg.sender === 'user') {
        messages.push({ role: 'user', content: msg.text });
      } else if (msg.sender === 'bot' && msg.text) {
        const cleanText = msg.text.replace(/<[^>]*>/g, '').trim();
        if (cleanText) {
          messages.push({ role: 'assistant', content: cleanText });
        }
      }
    }
  }

  messages.push({ role: 'user', content: userQuery });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.4,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API returned status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('OpenAI API returned an empty completion.');
  }

  return text;
}
