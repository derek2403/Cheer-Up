export const FileUpload = ({ file, fileError, isLoading, onFileChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="document" style={{ display: 'block', marginBottom: '15px' }}>
          Upload document (.pdf, .png, .jpg)
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label 
            style={{
              padding: '8px 16px',
              backgroundColor: '#2d2d2d',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-block'
            }}
          >
            Choose File
            <input
              type="file"
              id="document"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {file && <span style={{ color: '#888' }}>{file.name}</span>}
        </div>
        {fileError && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{fileError}</p>}
      </div>
      
      <button 
        type="submit" 
        disabled={!file || isLoading}
        style={{
          padding: '8px 16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: !file || isLoading ? 'not-allowed' : 'pointer',
          opacity: !file || isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Parsing...' : 'Parse Document'}
      </button>
    </form>
  );
}; 