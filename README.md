# Document Parser and RAG Chatbot Demo

A Next.js application that demonstrates document parsing and RAG (Retrieval-Augmented Generation) capabilities using Upstage APIs and Pinecone vector database. This project allows users to upload documents, parse them, store their embeddings, and interact with the content through a semantic search-powered chatbot.

## Features

### Document Parser
- Upload and parse documents (PDF, PNG, JPG)
- View parsed results in three formats:
  - Rendered HTML output
  - Raw HTML with syntax highlighting
  - Plain text output
- Automatic embedding generation using Upstage API
- Vector storage in Pinecone for semantic search
- Dark theme UI for better readability

### RAG Chatbot
- Interactive chat interface for querying document content
- Semantic search using Pinecone vector database
- Context-aware responses using Upstage LLM
- Clear vector storage functionality
- Real-time chat history
- Loading states and error handling

## Project Structure

```
├── components/
│   └── DocumentParser/
│       ├── DocumentParserComponent.js  # Main parser component
│       ├── FileUpload.js              # File input handling
│       ├── OutputSection.js           # Results display
│       └── LoadingIndicator.js        # Loading states
├── pages/
│   ├── api/
│   │   ├── parse.js        # Document parsing endpoint
│   │   ├── ingest.js       # Vector embedding storage
│   │   ├── chat.js         # RAG chatbot endpoint
│   │   └── delete-vectors.js # Vector cleanup
│   ├── document-parser.js  # Parser interface
│   ├── chatbot.js         # Chatbot interface
│   └── index.js           # Landing page
├── .env.example           # Environment template
└── .env.local            # Local environment vars
```

## How It Works

### Document Processing Pipeline

1. **Document Upload & Parsing**
   - User uploads a document through the interface
   - Document is sent to Upstage Document Parsing API
   - API returns parsed HTML content

2. **Content Embedding**
   - Parsed HTML is split into meaningful chunks
   - Special handling for different content types (tables, paragraphs, etc.)
   - Each chunk is embedded using Upstage Embedding API
   - Embeddings are stored in Pinecone with metadata

### RAG Chatbot Pipeline

1. **Query Processing**
   - User submits a question
   - Question is embedded using Upstage Embedding API
   - Embedding is used to search Pinecone for relevant chunks

2. **Context Retrieval**
   - Top 10 most similar chunks are retrieved
   - High-quality matches (similarity > 0.7) are selected
   - Chunks are organized by type and combined

3. **Answer Generation**
   - Context and question are sent to Upstage LLM
   - LLM generates answer based solely on provided context
   - Response is formatted based on query type
   - System indicates if information isn't found

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file:
   ```
   UPSTAGE_API_KEY=your_upstage_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name
   ```

4. Create a Pinecone index:
   - Sign up for Pinecone
   - Create index with:
     - Dimension: 4096 (matches Upstage embedding model)
     - Metric: Cosine
     - Type: Dense

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage Guide

1. **Document Parser** (`/document-parser`)
   - Upload supported documents (PDF, PNG, JPG)
   - View parsed content in multiple formats
   - Content is automatically embedded and stored
   - Navigate to chatbot using the "Go to Chatbot" button

2. **RAG Chatbot** (`/chatbot`)
   - Ask questions about uploaded documents
   - View chat history with user and assistant messages
   - Clear vector storage if needed
   - Navigate back to parser using "Go to Parser" button

## API Integration

1. **Document Parsing API**
   - Endpoint: `https://api.upstage.ai/v1/document-digitization`
   - Supported files: PDF, PNG, JPG
   - Max file size: 50MB

2. **Embedding API**
   - Endpoint: `https://api.upstage.ai/v1/embeddings`
   - Model: embedding-passage
   - Dimension: 4096

3. **Chat Completions API**
   - Endpoint: `https://api.upstage.ai/v1/chat/completions`
   - Model: solar-1-mini-chat
   - Temperature: 0.3 (optimized for consistency)

4. **Pinecone Vector Database**
   - Dense vector storage
   - Dimension: 4096
   - Distance: Cosine similarity
   - Metadata storage for context

## UI Components

### Document Parser
- Dark theme interface
- File upload button with validation
- Multi-format output display
- Loading indicators
- Error messages

### Chatbot
- Clean, minimal chat interface
- Message history with user/assistant styling
- Real-time loading states
- Input form with validation
- Vector clearing functionality
- Confirmation modal for destructive actions

## Error Handling

- File type validation
- API error handling
- Loading states
- User feedback
- Graceful fallbacks

## Performance Considerations

- Batch processing for embeddings
- Efficient chunk storage
- Semantic search optimization
- Response caching
- Minimal UI re-renders

## Security

- Environment variable protection
- API key security
- Input validation
- Error message sanitization

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Upstage APIs](https://api.upstage.ai)
- [Pinecone Documentation](https://docs.pinecone.io)
- [RAG Architecture](https://www.pinecone.io/learn/retrieval-augmented-generation)

## Deploy on Vercel

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

Remember to:
1. Set environment variables in Vercel
2. Configure build settings
3. Set up proper CORS headers
4. Monitor API usage
