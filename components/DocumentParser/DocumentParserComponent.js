import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function DocumentParserComponent() {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [sections, setSections] = useState({
    htmlOutput: '',
    rawHtml: '',
    textOutput: ''
  });
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
        setUploadSuccess(false);
      }
    },
    onDropRejected: () => {
      setError('Please upload a supported file type (PDF, JPG, PNG, TXT, DOC, DOCX)');
    },
    disabled: parsing
  });

  const handleParse = async (e) => {
    e.stopPropagation();
    if (!file) return;

    setParsing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      // First parse the document
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse document');
      }

      const parseData = await parseResponse.json();

      // Then ingest the parsed content
      const ingestResponse = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: file.name,
          htmlContent: parseData.content.html
        }),
      });

      if (!ingestResponse.ok) {
        throw new Error('Failed to process document');
      }

      const ingestData = await ingestResponse.json();

      setSections({
        htmlOutput: parseData.content.html,
        rawHtml: parseData.content.html,
        textOutput: parseData.content.text
      });
      
      setUploadSuccess(true);
      setFile(null); // Reset file selection after successful upload
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process document. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="parser-container">
      <div {...getRootProps()} className={`dropzone ${parsing ? 'processing' : ''}`}>
        <input {...getInputProps()} disabled={parsing} />
        <div className="dropzone-content">
          {file ? (
            <>
              <p className="file-name">{file.name}</p>
              <button 
                onClick={handleParse}
                disabled={parsing}
                className="parse-button"
              >
                {parsing ? 'Processing...' : 'Process Document'}
              </button>
            </>
          ) : (
            <>
              <div className="upload-icon">📄</div>
              <p className="upload-text">Drop your document here or click to browse</p>
              <p className="supported-formats">
                Supported formats: PDF, JPG, PNG, TXT, DOC, DOCX
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {uploadSuccess && (
        <div className="success-message">
          ✅ Document processed successfully! I'll use this information to provide more personalized support.
        </div>
      )}

      <style jsx>{`
        .parser-container {
          width: 100%;
        }

        .dropzone {
          border: 2px dashed #4f46e5;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(79, 70, 229, 0.05);
        }

        .dropzone.processing {
          cursor: not-allowed;
          opacity: 0.7;
          pointer-events: none;
        }

        .dropzone-content {
          padding: 20px;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upload-text {
          font-size: 16px;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .supported-formats {
          font-size: 14px;
          color: #64748b;
        }

        .file-name {
          font-size: 16px;
          color: #a5b4fc;
          margin-bottom: 16px;
          word-break: break-all;
        }

        .parse-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .parse-button:hover:not(:disabled) {
          background: #4338ca;
        }

        .parse-button:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #ef4444;
          color: #fca5a5;
          border-radius: 4px;
        }

        .success-message {
          margin-top: 16px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
          color: #86efac;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 