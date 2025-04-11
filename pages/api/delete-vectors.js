import { Pinecone } from '@pinecone-database/pinecone';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Pinecone
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index(process.env.PINECONE_INDEX_NAME);
    
    // Delete all vectors
    await index.deleteAll();
    
    // Wait briefly for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get index stats to confirm deletion
    const stats = await index.describeIndexStats();
    
    return res.status(200).json({
      success: true,
      message: 'All vectors deleted successfully',
      indexStats: stats
    });
  } catch (error) {
    console.error('Error deleting vectors:', error);
    return res.status(500).json({
      error: error.message || 'Failed to delete vectors'
    });
  }
} 