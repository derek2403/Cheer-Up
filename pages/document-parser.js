import Head from 'next/head';
import Link from 'next/link';
import { DocumentParserComponent } from '../components/DocumentParser/DocumentParserComponent';

export default function DocumentParserPage() {
  return (
    <>
      <Head>
        <title>Document Parser Demo</title>
        <meta name="description" content="Document parsing demo using Upstage API" />
      </Head>

      <div style={{ position: 'fixed', top: '20px', right: '20px' }}>
        <Link href="/chatbot">
          <button
            style={{
              padding: '8px 16px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to Chatbot
          </button>
        </Link>
      </div>

      <DocumentParserComponent />
    </>
  );
} 