const OutputBox = ({ title, content, isRawHtml }) => {
  const baseStyle = {
    border: '1px solid #444',
    padding: '15px',
    borderRadius: '4px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: '#1e1e1e',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#d4d4d4'
  };

  if (isRawHtml) {
    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
        <pre 
          style={baseStyle}
          dangerouslySetInnerHTML={{
            __html: content
              ?.replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/(&lt;\/?[a-zA-Z0-9]+)(\s|&gt;)/g, '<span style="color: #569cd6">$1</span>$2')
              .replace(/(id|style|class)='([^']*)'/g, '<span style="color: #9cdcfe">$1</span>=<span style="color: #ce9178">\'$2\'</span>')
              .replace(/(&lt;\/[a-zA-Z0-9]+&gt;)/g, '<span style="color: #569cd6">$1</span>')
              || 'No content'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
      {title === 'HTML Output' ? (
        <div style={baseStyle}>
          <div dangerouslySetInnerHTML={{ __html: content || 'No content' }} />
        </div>
      ) : (
        <pre style={baseStyle}>
          {content || 'No content'}
        </pre>
      )}
    </div>
  );
};

export const OutputSection = ({ parsedData }) => {
  if (!parsedData) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Parsed Results</h2>
      
      <OutputBox 
        title="HTML Output"
        content={parsedData.content?.html}
      />

      <OutputBox 
        title="Raw HTML"
        content={parsedData.content?.html}
        isRawHtml={true}
      />
      
      <OutputBox 
        title="Text Output"
        content={parsedData.content?.text}
      />
    </div>
  );
}; 