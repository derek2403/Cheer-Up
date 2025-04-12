import qdrantClient from '../../utils/qdrantClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Qdrant collection
    await qdrantClient.initCollection();
    
    try {
      // Try to delete all vectors by recreating the collection
      const client = qdrantClient.client;
      const collectionName = qdrantClient.collectionName;
      
      // First check if the collection exists
      const collections = await client.getCollections();
      const collectionExists = collections.collections.some(
        collection => collection.name === collectionName
      );
      
      if (collectionExists) {
        // Delete the existing collection
        await client.deleteCollection(collectionName);
        
        // Recreate the collection with the same settings
        await client.createCollection(collectionName, {
          vectors: { 
            size: qdrantClient.vectorDimension, 
            distance: "Cosine" 
          },
          optimizers_config: {
            indexing_threshold: 0,
          },
        });
        
        return res.status(200).json({
          success: true,
          message: 'All vectors deleted successfully by recreating collection',
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Collection does not exist, nothing to delete',
        });
      }
    } catch (deleteError) {
      console.error('Error deleting collection:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting vectors:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete vectors',
      error: error.message
    });
  }
} 