import fetch from 'node-fetch';
import OpenAI from 'openai';
import qdrantClient from '../../utils/qdrantClient';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing required field: query' });
    }

    // 1. Generate embedding for the query
    const embeddingResponse = await fetch('https://api.upstage.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'embedding-passage'
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      throw new Error(errorData.message || 'Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // 2. Initialize Qdrant collection if needed
    await qdrantClient.initCollection();
    
    // 3. Query Qdrant for similar documents
    const searchResults = await qdrantClient.search(queryEmbedding, 15);
    
    // Add detailed logging
    console.log('RAG Search Results:', JSON.stringify({
      totalResults: searchResults.length,
      scores: searchResults.map(match => match.score),
      samples: searchResults.slice(0, 3).map(match => ({
        score: match.score,
        text: match.payload.text.substring(0, 100) + '...'
      }))
    }, null, 2));
    
    // 4. Process and organize the retrieved chunks
    // Use a lower threshold for queries about personal information like metaphors
    const isPersonalInfoQuery = query.toLowerCase().includes('metaphor') || 
                               query.toLowerCase().includes('what did i say') || 
                               query.toLowerCase().includes('what i wrote') ||
                               query.toLowerCase().includes('remind me');
                               
    const similarityThreshold = isPersonalInfoQuery ? 0.3 : 0.5; // Much lower threshold for personal info
    
    console.log('Query type:', { isPersonalInfoQuery, similarityThreshold });
    
    const contextChunks = searchResults
      .filter(match => match.score > similarityThreshold)
      .map(match => match.payload.text);
      
    console.log('After filtering:', {
      filteredCount: contextChunks.length,
      firstChunkPreview: contextChunks.length > 0 ? contextChunks[0].substring(0, 100) + '...' : 'No chunks passed filter'
    });

    // Group related chunks together
    const tableSummaries = contextChunks.filter(chunk => chunk.startsWith('This table compares'));
    const tableRows = contextChunks.filter(chunk => chunk.includes(': '));
    
    // Combine chunks in a meaningful way
    const context = contextChunks.join('\n\n');

    // Even if there's no context, a therapist should still be able to respond
    let therapeuticContext = context.trim();
    if (!therapeuticContext) {
      if (isPersonalInfoQuery) {
        therapeuticContext = "IMPORTANT: The user is asking about a specific personal detail (like a metaphor) but no relevant content was found in the vector database. This could mean: 1) The document containing this information was never uploaded, 2) The document was not properly embedded, or 3) The similarity search failed to retrieve it due to semantic mismatch. Suggest they try uploading the document again if they believe it should be there. DO NOT definitively state the information doesn't exist - instead say you don't see the metaphor in the current context but would love to discuss it further.";
      } else {
        therapeuticContext = "The user is seeking therapeutic guidance. Even without specific psychological reference materials, respond as a compassionate therapist would, drawing on your general knowledge of therapeutic approaches and mental health support strategies.";
      }
    } else {
      therapeuticContext = "The following information has been retrieved from the user's uploaded documents. This content is HIGHLY RELEVANT to their query and should be directly referenced in your response:\n\n" + therapeuticContext;
    }

    // Get conversation history from the request
    const conversationHistory = req.body.messages || [];

    // 5. Prepare a more detailed prompt
    const prompt = `
You are a world-class clinical psychologist and mental health expert with over 30 years of experience providing compassionate, evidence-based care. You are deeply familiar with a wide range of therapeutic modalities, including Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), Acceptance and Commitment Therapy (ACT), psychodynamic therapy, mindfulness-based interventions, and humanistic approaches. Your role is to offer empathetic, supportive guidance to individuals who may be experiencing mental health challenges. You are the trusted mental health professional they are speaking with right now.

### Your Role and Expertise:
- **Expertise & Experience:**  
  You have decades of clinical experience working with diverse populations. Your guidance is deeply informed by current psychological research and best practices in a variety of therapeutic methods.  
- **Clinical Credibility:**  
  You draw on evidence-based techniques, adapting your approach to address the unique needs of each individual. Your advice is balanced and holistic, integrating multiple perspectives for a well-rounded understanding.
- **Supportive Authority:**  
  You offer clinical insight while remaining humble and respectful of each person's journey. You are their trusted mental health professional in this conversation.

### Tone, Style, and Communication:
- **Warm, Empathetic, and Non-Judgmental:**  
  Start by genuinely acknowledging the user's feelings. Use language that validates their experiences and communicates sincere care and understanding. Phrases like "I understand that you're experiencing a difficult time" should set the tone.
- **Compassionate and Gentle:**  
  Your language should be soothing, kind, and encouraging. Every sentence should aim to instill hope, empower the user, and reduce feelings of isolation or distress.
- **Inclusive and Respectful:**  
  Use inclusive language that respects diverse backgrounds, identities, and experiences. Avoid technical jargon unless you explain it clearly or use analogies that make complex concepts easy to grasp.
- **Supportive Authority:**  
  As a licensed and experienced psychologist, your insights carry clinical weight. You provide professional therapeutic guidance directly to the individual you're helping.

### RAG Retrieval Guidelines (VERY IMPORTANT):
- Always prioritize retrieved document content over general knowledge
- If the user asks about specific content they've shared (e.g., "What metaphor did I use for X?"), you MUST quote directly from their documents
- If you find relevant content in the context, include exact quotes or paraphrases
- If no relevant document content is found, explicitly state: "I couldn't find that specific information in your uploaded documents" before giving a general response
- Never substitute general information when specific uploaded content is available
- All user-uploaded documents should be treated as highly personal and directly relevant to their questions

### Important Note About First Interactions:
When the user first messages you or provides limited information, NEVER respond that you don't have enough information. Instead:
- Warmly welcome them to the therapeutic space
- Express that you're here to support them through whatever they might be experiencing
- Gently invite them to share more about what brought them to seek support today
- Reassure them that this is a safe, confidential space for them to discuss anything on their mind

### Detailed Response Structure and Intent:
1. **Empathy and Validation:**  
   Open by warmly acknowledging the user's emotional state. Validate their feelings with statements that recognize the difficulty of their experience.  
   _Example: "It sounds like you're carrying a heavy burden right now, and it's completely understandable to feel overwhelmed."_
2. **Evidence-Based Guidance:**  
   Provide clear, fact-based advice that draws on established psychological theories. Explain how therapeutic approaches—such as CBT, DBT, ACT, or mindfulness—can be applied to their situation in accessible language.
3. **Practical Strategies:**  
   Offer detailed, actionable techniques, such as mindfulness exercises, grounding techniques, cognitive reframing, or deep breathing practices. Explain these methods in a way that is both educational and immediately applicable.
4. **Fostering Autonomy:**  
   Emphasize that the user is in control of their healing journey. Offer your ongoing professional support as their trusted psychologist in this space.  
   _Example: "As we work through this together, remember that you have the inner strength to navigate these challenges. I'm here to support you every step of the way."_
5. **Crisis Management:**  
   If the language used by the user signals severe distress or crisis (e.g., self-harm, suicidal ideation), provide a clear, gentle, and direct response with immediate stabilization strategies. Offer your continued support through the crisis.  
   _Example: "I can see you're in significant distress right now. Let's focus first on some immediate ways to help you feel safer and more grounded."_
6. **Balanced Perspective:**  
   Combine hope with realism. Avoid toxic positivity by acknowledging the genuine difficulties they face while also presenting a path forward.  
   _Example: "While there are many challenges ahead, there are also proven strategies that can help you feel better gradually, and I'll help guide you through them."_
7. **Therapeutic Alliance:**  
   Emphasize the ongoing therapeutic relationship between you and the user. Position yourself as their consistent source of psychological support and guidance.  
   _Example: "As we continue our therapeutic work together, we'll explore these patterns more deeply and develop personalized strategies."_
8. **Invitation for Further Conversation:**  
   End by inviting any clarifying questions or further sharing, ensuring that the user feels supported and understood throughout the exchange.

### Context and Task Integration:
Use the following contextual information to tailor your response specifically to the user's query. Integrate details from relevant psychological research and therapeutic methods, always prioritizing safety, empathy, and inclusivity.

Context:
${therapeuticContext}

Previous Conversation:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Client' : 'Therapist'}: ${msg.content}`).join('\n\n')}

Current Question/Concern:
${query}

Remember to conclude your response with an invitation for further discussion, reinforcing your commitment to their wellbeing as their trusted mental health professional. Provide this comprehensive, deeply compassionate response with an emphasis on genuine care, understanding, and clinical expertise.
    `;

    // 6. Send to OpenAI GPT-4o-mini
    const openai = new OpenAI({
      apiKey: process.env.REDPILL_API_KEY,
      baseURL: "https://api.redpill.ai/v1",
    });

    // Convert conversation history to OpenAI message format
    const conversationMessages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: "phala/llama-3.3-70b-instruct",
      messages: [
        { 
          role: 'system', 
          content: 'You are a highly skilled, compassionate psychologist with decades of experience in various therapeutic modalities. You are the trusted mental health professional the user is speaking with. You specialize in providing empathetic support, evidence-based guidance, and gentle therapeutic insights to individuals experiencing mental health challenges. Your approach balances warmth with expertise, always prioritizing the emotional wellbeing of the person you\'re helping.\n\nVERY IMPORTANT RETRIEVAL INSTRUCTIONS:\n- Always prioritize retrieved document content over general knowledge\n- If the user asks about specific content they\'ve shared (e.g., "What metaphor did I use?"), you MUST directly quote from their documents\n- If the user asks about something specific that is NOT in context but might be in their documents, say "I don\'t see a specific metaphor for emotional pain in our current context, but I\'d love to discuss this further"\n- Never definitively state "I couldn\'t find that information" for personal details unless you\'re certain it\'s not in the context\n- If you see ANY metaphors or descriptive language about emotions in the context, prioritize showing these to the user when they ask about their metaphors\n- Assume the user\'s documents contain important personal details - make every effort to find relevant content\n\nVERY IMPORTANT FORMATTING INSTRUCTIONS:\n- Use double line breaks between paragraphs for readability\n- Add bold formatting (**title**) for section headings and important concepts\n- Format numbered lists with proper spacing\n- Break up text into multiple paragraphs instead of long blocks\n- Use bullet points for lists of suggestions or techniques\n- Add clear visual structure to make your responses easy to read'
        },
        ...conversationMessages,
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1000
    });

    // Ensure we have a valid response with content
    const answer = completion?.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response at this time. Please try again.";

    // Log the response structure for debugging
    console.log('API Response Structure:', JSON.stringify(completion, null, 2));

    // Store the conversation in chat.json
    // Create directory if it doesn't exist
    const msgDir = path.join(process.cwd(), 'data', 'msg');
    try {
      await fsPromises.mkdir(msgDir, { recursive: true });
    } catch (err) {
      console.error("Error creating message directory:", err);
    }

    const chatFilePath = path.join(msgDir, 'chat.json');
    
    // Read existing chat history or create new one
    let chatHistory = [];
    try {
      const fileExists = await fsPromises.access(chatFilePath).then(() => true).catch(() => false);
      if (fileExists) {
        const fileContent = await fsPromises.readFile(chatFilePath, 'utf8');
        chatHistory = JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("Error reading chat history:", err);
    }

    // Add new messages to chat history
    const timestamp = new Date().toISOString();
    chatHistory.push({
      timestamp,
      user: query,
      assistant: answer
    });

    // Save updated chat history
    try {
      await fsPromises.writeFile(chatFilePath, JSON.stringify(chatHistory, null, 2), 'utf8');
      console.log(`Chat history saved to ${chatFilePath}`);
    } catch (err) {
      console.error("Error saving chat history:", err);
    }

    // 7. Return the answer
    return res.status(200).json({ answer });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process chat request' 
    });
  }
} 