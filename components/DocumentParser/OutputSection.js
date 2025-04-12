import { useState } from 'react';

const OutputBox = ({ title, content, isRawHtml }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    color: '#d4d4d4',
    display: isExpanded ? 'block' : 'none'
  };

  const headerStyle = {
    fontSize: '16px',
    marginBottom: isExpanded ? '10px' : '0',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };

  const arrowStyle = {
    display: 'inline-block',
    marginRight: '10px',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    fontSize: '12px'
  };

  if (isRawHtml) {
    return (
      <div style={{ marginBottom: '15px' }}>
        <div 
          style={headerStyle} 
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
        >
          <span style={arrowStyle}>▶</span>
          {title}
        </div>
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
    <div style={{ marginBottom: '15px' }}>
      <div 
        style={headerStyle} 
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
      >
        <span style={arrowStyle}>▶</span>
        {title}
      </div>
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
      <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Parsed Results
        <span style={{ fontSize: '14px', color: '#888' }}>(click sections to expand)</span>
      </h2>
      
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