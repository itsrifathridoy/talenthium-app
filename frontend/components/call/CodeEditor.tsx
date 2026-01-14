'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Lang, languages, sampleCode } from './types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-white text-emerald-600">
      Loading editor...
    </div>
  )
});

export default function CodeEditor({lang, code,setLang,setCode, theme}:{
  lang: Lang;
  code: string;
  setLang: (lang: Lang) => void;
  setCode: (code: string) => void;
  theme: "light" | "dark";
}) {



  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'edit' | 'output'>('edit');


  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const l = e.target.value as Lang;
    setLang(l);
    setCode(sampleCode(l));
  };

  const beforeMount = (monaco: any) => {
    monaco.editor.defineTheme('talenthium-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#06110f',
        'editorLineNumber.foreground': '#3e6b5d',
        'editorGutter.background': '#071511',
        'editorCursor.foreground': '#56fbd4',
        'editor.selectionBackground': '#19fb9b33',
        'editor.lineHighlightBackground': '#0c201b',
      }
    });

    monaco.editor.defineTheme('talenthium-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f0fdf4',
        'editorLineNumber.foreground': '#047857',
        'editorGutter.background': '#e6fffa',
        'editorCursor.foreground': '#065f46',
        'editor.selectionBackground': '#10b98144',
        'editor.lineHighlightBackground': '#d1fae5',
      }
    });
  };

  const runCode = () => {
    setRunning(true);
    const logs: string[] = [];
    if (lang !== 'javascript') {
      logs.push(`Run supported only for JavaScript. Current: ${lang}.`);
      setOutput(logs);
      setRunning(false);
      setMode('output');
      return;
    }
    const originalLog = console.log;
    try {
      console.log = (...args: unknown[]) => {
        const text = args
          .map((a) => {
            try {
              if (typeof a === 'object') return JSON.stringify(a);
              return String(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');
        logs.push(text);
        // @ts-ignore
        originalLog.apply(console, args);
      };
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      const result = fn();
      if (typeof result !== 'undefined') logs.push(String(result));
    } catch (e) {
      logs.push(`Error: ${(e as Error).message}`);
    } finally {
      console.log = originalLog;
      setOutput(logs);
      setRunning(false);
      setMode('output');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className={`z-10 flex items-center gap-3 border-b px-3 py-2 ${
        theme === "light"
          ? "border-emerald-300/40 bg-gradient-to-r from-emerald-100 to-emerald-50"
          : "border-emerald-300/15 bg-emerald-900/20"
      }`}>
        <label className={`text-xs ${
          theme === "light" ? "text-emerald-800" : "text-emerald-200/80"
        }`}>Language</label>
        <select
          value={lang}
          onChange={handleLangChange}
          className={`rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 ${
            theme === "light"
              ? "border-emerald-300/60 bg-white text-emerald-900 focus:ring-emerald-500/50 shadow-sm"
              : "border-emerald-300/20 bg-emerald-900/40 text-emerald-100 focus:ring-emerald-400/40"
          }`}
        >
          {languages.map((l) => (
            <option key={l} value={l} className={theme === "light" ? "bg-white" : "bg-[#06110f]"}>
              {l}
            </option>
          ))}
        </select>
        <div className="ml-auto" />
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={runCode}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white shadow focus:outline-none focus:ring-2 disabled:opacity-60 ${
              theme === "light"
                ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400/50"
                : "bg-emerald-600/80 hover:bg-emerald-600 focus:ring-emerald-400/50"
            }`}
            disabled={running}
            title="Run (JavaScript only)"
          >
            <span className="text-xs">▶</span>
            {running ? 'Running...' : 'Run'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white shadow focus:outline-none focus:ring-2 ${
              theme === "light"
                ? "bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-400/50"
                : "bg-emerald-700/70 hover:bg-emerald-700 focus:ring-emerald-400/50"
            }`}
            title="Back to Code"
          >
            <span className="text-xs">←</span>
            Back to Code
          </button>
        )}
      </div>
      {mode === 'edit' ? (
        <div className="relative h-full w-full min-h-0 flex-1">
          <MonacoEditor
            height="100%"
            language={lang}
            value={code}
            onChange={(v: string | undefined) => setCode(v ?? '')}
            theme={theme === "light" ? "talenthium-light" : "talenthium-dark"}
            beforeMount={beforeMount}
            options={{
              fontLigatures: true,
              fontFamily:
                "'Fira Code','JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono','Courier New',monospace",
              minimap: { enabled: false },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              renderWhitespace: 'none',
            }}
          />
        </div>
      ) : (
        <div className={`relative h-full w-full min-h-0 flex-1 border-t ${
          theme === "light" ? "border-emerald-300/40" : "border-emerald-300/10"
        }`}>
          <div className={`absolute inset-0 overflow-auto p-4 ${
            theme === "light" ? "bg-gradient-to-br from-emerald-100/80 to-emerald-50" : "bg-[#06110f]"
          }`}>
            <div className={`mb-2 text-xs uppercase tracking-wide ${
              theme === "light" ? "text-emerald-800" : "text-emerald-300/80"
            }`}>Output</div>
            <pre className={`whitespace-pre-wrap text-[13px] leading-6 ${
              theme === "light" ? "text-emerald-900" : "text-emerald-100/90"
            }`}>{output.length ? output.join('\n') : 'No output'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}





