# Therapeutic Assistant - RAG-Powered Mental Health Support

A Next.js application that provides compassionate, evidence-based mental health support through a therapeutic conversation interface. This project combines advanced document parsing, RAG (Retrieval-Augmented Generation) capabilities, and psychological expertise to create a supportive therapeutic experience.

## Features

### Document Parser
- Upload and parse therapeutic content (PDF, PNG, JPG)
- Support for psychological research papers, therapeutic techniques, clinical guidelines
- Automatic embedding generation using Upstage API
- Vector storage in Pinecone for semantic search
- Dark theme UI for better readability

### Therapeutic Conversation
- Professional-grade psychological support interface
- Evidence-based therapeutic responses informed by uploaded documents
- Conversation memory that builds therapeutic rapport over time
- Warm, empathetic tone with clear, structured formatting
- Support for various therapeutic modalities (CBT, DBT, ACT, psychodynamic, etc.)
- Crisis-aware responses with appropriate stabilization strategies
- Reset vectors functionality for data management

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
│   │   ├── chat.js         # Therapeutic conversation endpoint
│   │   └── delete-vectors.js # Vector cleanup
│   ├── document-chat.js    # Therapeutic conversation interface
│   └── index.js           # Landing page
├── .env.example           # Environment template
└── .env.local            # Local environment vars
```

## How It Works

### Document Processing Pipeline

1. **Therapeutic Content Upload & Parsing**
   - User uploads psychological resources through the interface
   - Document is sent to Upstage Document Parsing API
   - API returns parsed HTML content optimized for therapeutic knowledge

2. **Content Embedding**
   - Parsed HTML is split into meaningful chunks
   - Special handling for different content types (therapeutic techniques, research findings, etc.)
   - Each chunk is embedded using Upstage Embedding API
   - Embeddings are stored in Pinecone with metadata

### Therapeutic Conversation Pipeline

1. **Query Understanding**
   - User expresses thoughts, feelings or concerns
   - Input is embedded using Upstage Embedding API
   - Embedding is used to search Pinecone for relevant psychological insights

2. **Context Integration**
   - Top 15 most similar chunks are retrieved
   - High-quality matches (similarity > 0.7) are selected
   - Previous conversation history is maintained for therapeutic continuity
   - Contexts are organized by relevance and therapeutic value

3. **Therapeutic Response Generation**
   - Combined context (RAG + conversation history) is sent to the language model
   - Response generated with warm, empathetic, professional tone
   - Structured formatting for improved readability
   - Evidence-based insights from uploaded therapeutic resources
   - Maintains ongoing therapeutic relationship
   - Provides practical coping strategies and exercises when appropriate

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
   OPENAI_API_KEY=your_openai_api_key
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

1. **Document Parser** (Accessible through the main interface)
   - Upload therapeutic resources (PDF, PNG, JPG)
   - Content is automatically embedded and stored
   - Focus on psychological research, therapeutic techniques, and mental health resources

2. **Therapeutic Assistant** (Main interface)
   - Express thoughts, feelings, and concerns in a safe, confidential space
   - Receive warm, empathetic, evidence-based responses
   - Benefit from conversation memory that builds rapport over time
   - Reset vectors if needed for data management

## API Integration

1. **Document Parsing API**
   - Endpoint: `https://api.upstage.ai/v1/document-digitization`
   - Supported files: PDF, PNG, JPG
   - Max file size: 50MB

2. **Embedding API**
   - Endpoint: `https://api.upstage.ai/v1/embeddings`
   - Model: embedding-passage
   - Dimension: 4096

3. **OpenAI API**
   - Model: gpt-4o-mini
   - Temperature: 0.4 (balanced for empathy and accuracy)
   - Optimized for therapeutic conversation

4. **Pinecone Vector Database**
   - Dense vector storage
   - Dimension: 4096
   - Distance: Cosine similarity
   - Metadata storage for therapeutic context

## UI Components

### Document Parser
- Dark theme interface
- File upload button with validation
- Multi-format output display
- Loading indicators
- Error messages

### Therapeutic Conversation
- Soothing, professional design with therapeutic color scheme
- Well-formatted message display with proper spacing and hierarchy
- Structured responses with clear sections and emphasis
- Real-time loading states with therapeutic language ("Listening..." vs "Loading...")
- Modal feedback for operations
- Reset vectors functionality
- Conversation memory that maintains therapeutic context

## Error Handling

- File type validation
- API error handling
- User-friendly modal feedback
- Graceful fallbacks with therapeutic tone
- Silent success for technical operations

## Security and Ethics

- Environment variable protection
- API key security
- Input validation
- Error message sanitization
- Ethical guidelines for therapeutic interactions
- Clear limitations about AI assistance vs. professional care
- Crisis-aware response protocols

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Upstage APIs](https://api.upstage.ai)
- [Pinecone Documentation](https://docs.pinecone.io)
- [RAG Architecture](https://www.pinecone.io/learn/retrieval-augmented-generation)
- [Therapeutic Modalities](https://www.apa.org/topics/psychotherapy/approaches)

## Deploy on Vercel

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

Remember to:
1. Set environment variables in Vercel
2. Configure build settings
3. Set up proper CORS headers
4. Monitor API usage

## UI Framework Setup

### Tech Stack Additions

- HeroUI (React UI Library)
- Tailwind CSS 3.3.0
- Framer Motion 11.9.0

### Additional Dependencies

The project includes these UI-related dependencies:

```bash
@heroui/react
framer-motion@^11.9.0
tailwindcss@3.3.0
postcss@8.4.31
autoprefixer@10.4.14
```

### Configuration Files

#### PostCSS Configuration (postcss.config.js)
```javascript
module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### Tailwind CSS Configuration (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### HeroUI Setup

The project uses HeroUI for its component library. HeroUI is configured in `pages/_app.js`:

```javascript
import "../styles/globals.css";
import { HeroUIProvider } from "@heroui/react";

export default function App({ Component, pageProps }) {
  return (
    <HeroUIProvider>
      <Component {...pageProps} />
    </HeroUIProvider>
  );
}
```

### Global Styles

Global styles are configured in `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset and base styles */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: #ffffff;
}
```
