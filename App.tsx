import React, { useState, useCallback } from 'react';
import RichTextEditor from './components/RichTextEditor';
import ControlPanel from './components/ControlPanel';
import { generateDraft, refineContent, analyzeContent } from './services/geminiService';
import { AppStatus } from './types';

// Initial placeholder content
const INITIAL_CONTENT = '<h2>Welcome to Gemini Smart Editor</h2><p><strong>Step 1:</strong> Paste your Guidelines / Specification text on the left.<br><strong>Step 2:</strong> Enter a topic and click "Generate Draft".<br><strong>Step 3:</strong> Once generated, you can edit manually or use AI to refine the content.</p>';

const App: React.FC = () => {
  // State
  const [specificationText, setSpecificationText] = useState('');
  const [exampleText, setExampleText] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [editorData, setEditorData] = useState(INITIAL_CONTENT);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  
  // Track if we have active content generated/edited by user (not the welcome message)
  const [hasActiveContent, setHasActiveContent] = useState(false);

  const handleAction = useCallback(async () => {
    if (!specificationText.trim() || !userPrompt.trim()) return;

    setErrorMessage(null);
    setSuggestions(null); // Clear suggestions when generating new content

    try {
      let resultHtml = '';
      
      if (!hasActiveContent) {
        // Mode: Generate Draft
        setStatus(AppStatus.GENERATING);
        resultHtml = await generateDraft(specificationText, userPrompt, exampleText);
        setHasActiveContent(true); // Switch to refinement mode after success
      } else {
        // Mode: Refine / Update
        setStatus(AppStatus.UPDATING);
        resultHtml = await refineContent(specificationText, editorData, userPrompt, exampleText);
      }

      setEditorData(resultHtml);
      setStatus(AppStatus.SUCCESS);
      setUserPrompt(''); // Clear prompt after successful action
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  }, [specificationText, userPrompt, editorData, hasActiveContent, exampleText]);

  const handleAnalyze = useCallback(async () => {
    if (!specificationText.trim() || !editorData) return;

    setErrorMessage(null);
    setSuggestions(null);
    setStatus(AppStatus.ANALYZING);

    try {
      const suggestionText = await analyzeContent(specificationText, editorData);
      setSuggestions(suggestionText);
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "Failed to analyze content.");
    }
  }, [specificationText, editorData]);

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure? This will clear the editor and start a new draft.")) {
      setEditorData(INITIAL_CONTENT);
      setHasActiveContent(false);
      setStatus(AppStatus.IDLE);
      setUserPrompt('');
      setExampleText('');
      setErrorMessage(null);
      setSuggestions(null);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorData);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([editorData], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "generated-content.html";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Gemini Smart Editor
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Google Gemini 3
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 flex flex-col h-auto lg:h-[calc(100vh-8rem)] sticky top-24">
            <ControlPanel 
              specificationText={specificationText}
              setSpecificationText={setSpecificationText}
              exampleText={exampleText}
              setExampleText={setExampleText}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              onGenerate={handleAction}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
              status={status}
              hasContent={hasActiveContent}
              suggestions={suggestions}
              errorMessage={errorMessage}
            />
          </div>

          {/* Right Panel: CKEditor */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-800">Editor Workspace</h2>
                 <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full border border-slate-200">Editable</span>
              </div>
              
              <div className="flex gap-2">
                 <button 
                   onClick={handleCopy}
                   className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                     copySuccess 
                       ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                       : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                   }`}
                 >
                   {copySuccess ? (
                     <>
                       <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Copied!
                     </>
                   ) : (
                     <>
                       <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                       Copy HTML
                     </>
                   )}
                 </button>
                 
                 <button 
                   onClick={handleDownload}
                   className="flex items-center px-3 py-1.5 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                 >
                   <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Download
                 </button>
              </div>
            </div>
            
            <RichTextEditor 
              data={editorData} 
              onChange={setEditorData}
              disabled={status === AppStatus.GENERATING || status === AppStatus.UPDATING || status === AppStatus.ANALYZING}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;