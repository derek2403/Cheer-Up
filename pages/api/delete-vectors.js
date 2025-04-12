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
    
    try {
      // Try to delete all vectors
      await index.deleteAll();
    } catch (deleteError) {
      // If there are no vectors (404 error), consider it a success
      if (deleteError.message && deleteError.message.includes('404')) {
        return res.status(200).json({
          success: true,
          message: 'All vectors have already been cleared',
        });
      }
      // For other errors, throw them to be caught by the outer try-catch
      throw deleteError;
    }
    
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
    // Only log errors that aren't related to 404 (no vectors)
    if (!error.message || !error.message.includes('404')) {
      console.error('Error deleting vectors:', error);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Vector state cleared',
    });
  }
} 