import React from 'react';
import Editor from '@monaco-editor/react';

const MONACO_LANG_MAP = {
  PYTHON: 'python',
  CPP: 'cpp',
  JAVA: 'java',
};

const CodeEditor = ({
  language = 'PYTHON',
  value = '',
  onChange,
  theme = 'vs-dark',
  readOnly = false,
}) => {
  const monacoLanguage = MONACO_LANG_MAP[language] || 'python';

  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        minHeight: '500px',
        background: '#020617',
        border: '2px solid #334155',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Editor
        height="500px"
        width="100%"
        language={monacoLanguage}
        theme={theme}
        value={value || ''}
        onChange={(newValue) => {
          if (onChange) {
            onChange(newValue ?? '');
          }
        }}
        onMount={() => {
          console.log('MONACO EDITOR MOUNTED');
        }}
        loading={
          <div
            style={{
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              background: '#020617',
              fontSize: '16px',
            }}
          >
            Loading Code Editor...
          </div>
        }
        options={{
          readOnly,
          fontSize: 15,
          lineHeight: 22,
          fontFamily: 'Consolas, monospace',

          minimap: {
            enabled: false,
          },

          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',

          tabSize: 4,
          insertSpaces: true,

          cursorBlinking: 'smooth',
          smoothScrolling: true,

          padding: {
            top: 15,
            bottom: 15,
          },

          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;