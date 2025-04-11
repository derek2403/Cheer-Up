import { Pinecone } from '@pinecone-database/pinecone';
import fetch from 'node-fetch';
import OpenAI from 'openai';

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

    // 2. Query Pinecone for similar documents with higher topK for better context
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index(process.env.PINECONE_INDEX_NAME);
    
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 10, // Increased from 5 to 10 for better context
      includeMetadata: true
    });

    // 3. Process and organize the retrieved chunks
    const contextChunks = queryResult.matches
      .filter(match => match.score > 0.7) // Only use high-quality matches
      .map(match => match.metadata.text);

    // Group related chunks together
    const tableSummaries = contextChunks.filter(chunk => chunk.startsWith('This table compares'));
    const tableRows = contextChunks.filter(chunk => chunk.includes(': '));
    
    // Combine chunks in a meaningful way
    const context = [
      ...tableSummaries,
      ...tableRows
    ].join('\n\n');

    if (!context.trim()) {
      return res.status(200).json({ 
        answer: "I don't have enough relevant information to answer that question accurately. Please try rephrasing your question or ask about a different topic."
      });
    }

    // 4. Prepare a more detailed prompt
    const prompt = `You are a knowledgeable assistant helping to explain concepts about data types and databases. Please provide a clear and accurate answer based on the following context. If the answer cannot be fully derived from the context, only use what is explicitly stated in the context and do not make assumptions or add external information.

Context:
${context}

Question: ${query}

Instructions:
1. If answering a comparison question, structure your response with clear categories (e.g., Format, Storage, Benefits, etc.)
2. If answering about a specific type of data, focus on its unique characteristics
3. Use bullet points when listing multiple attributes
4. Keep your answer concise but complete
5. Only use information explicitly stated in the context`;

    // 5. Send to OpenAI GPT-4o-mini
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: 'You are a data expert helping users understand different types of data and databases. Be precise and only use information from the provided context.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const answer = completion.choices[0].message.content;

    // 6. Return the answer
    return res.status(200).json({ answer });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process chat request' 
    });
  }
} 