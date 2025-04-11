import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { OutputSection } from './OutputSection';
import { LoadingIndicator } from './LoadingIndicator';

export const DocumentParserComponent = () => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a PDF, PNG, or JPG file');
      setFile(null);
      return;
    }
    
    setFileError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setParsedData(null);
    setFileError('');
    
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse document');
      }
      
      setParsedData(data);
    } catch (error) {
      console.error('Error:', error);
      setFileError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Document Parser Demo</h1>
        
        <FileUpload
          file={file}
          fileError={fileError}
          isLoading={isLoading}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        {isLoading && <LoadingIndicator />}
        
        <OutputSection parsedData={parsedData} />
      </main>
    </div>
  );
}; 