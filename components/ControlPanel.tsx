import React, { useState } from 'react';
import { AppStatus } from '../types';

interface ControlPanelProps {
  specificationText: string;
  setSpecificationText: (text: string) => void;
  exampleText: string;
  setExampleText: (text: string) => void;
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onAnalyze: () => void;
  onReset: () => void;
  status: AppStatus;
  hasContent: boolean;
  suggestions: string | null;
  errorMessage: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  specificationText,
  setSpecificationText,
  exampleText,
  setExampleText,
  userPrompt,
  setUserPrompt,
  onGenerate,
  onAnalyze,
  onReset,
  status,
  hasContent,
  suggestions,
  errorMessage
}) => {
  const isProcessing = status === AppStatus.GENERATING || status === AppStatus.UPDATING || status === AppStatus.ANALYZING;
  const isRefinementMode = hasContent;
  const [showExample, setShowExample] = useState(false);

  // Show reset button if there is any content to clear (inputs or generated content)
  const canReset = hasContent || userPrompt.trim().length > 0 || exampleText.trim().length > 0 || specificationText.trim().length > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            {isRefinementMode ? 'Refine & Edit' : 'Drafting Control'}
          </h2>
          <p className="text-sm text-slate-500">
            {isRefinementMode 
              ? 'Modify the content while keeping it compliant.' 
              : 'Define rules and topic to start.'}
          </p>
        </div>
        {canReset && (
          <button 
            onClick={onReset}
            disabled={isProcessing}
            title="Reset All"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Specification Input (Knowledge Base) */}
      <div className="space-y-2 flex-grow flex flex-col min-h-[120px]">
        <label htmlFor="spec-input" className="block text-sm font-medium text-slate-700">
          Specification / Guidelines
        </label>
        <textarea
          id="spec-input"
          className="flex-grow w-full p-3 border border-slate-300 rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out resize-none font-mono text-xs"
          placeholder="Paste your formatting rules, style guide, or required templates here..."
          value={specificationText}
          onChange={(e) => setSpecificationText(e.target.value)}
          disabled={isProcessing}
        />
      </div>

      {/* Optional Example Toggle */}
      <div className="border-t border-b border-slate-100 py-2">
        <button 
          onClick={() => setShowExample(!showExample)}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none w-full justify-between"
        >
          <span>
            {showExample ? 'Hide Reference Example' : 'Add Reference Example (Optional)'}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showExample ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Example Input - Keep visible if toggle is on OR if there is text inside */}
        {(showExample || exampleText.length > 0) && (
          <div className="mt-3 animate-fade-in-down">
             <textarea
              id="example-input"
              className="w-full h-32 p-3 border border-slate-300 rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out resize-none font-mono text-xs"
              placeholder="Paste a previous article, template, or 'Gold Standard' content here. Gemini will use this to match structure and tone."
              value={exampleText}
              onChange={(e) => setExampleText(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-xs text-slate-500 mt-1">
              The AI will mimic the structure of this text but apply the new topic.
            </p>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700">
          {isRefinementMode ? 'Modification Instructions' : 'Content Topic / Data'}
        </label>
        <textarea
          id="prompt-input"
          className="w-full h-24 p-3 border border-slate-300 rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out resize-none"
          placeholder={isRefinementMode 
            ? "e.g., Change the tone to be more persuasive, add a conclusion section..." 
            : "e.g., Generate a Q1 Report based on revenue $1M..."}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          disabled={isProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              onGenerate();
            }
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onGenerate}
          disabled={isProcessing || !specificationText.trim() || !userPrompt.trim()}
          className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md
            ${isProcessing || !specificationText.trim() || !userPrompt.trim()
              ? 'bg-indigo-300 cursor-not-allowed' 
              : isRefinementMode
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
            }`}
        >
          {status === AppStatus.GENERATING || status === AppStatus.UPDATING ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              {isRefinementMode ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Content
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Draft
                </>
              )}
            </>
          )}
        </button>

        {isRefinementMode && (
           <button
             onClick={onAnalyze}
             disabled={isProcessing || !specificationText.trim()}
             className={`w-full flex justify-center items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
             `}
           >
            {status === AppStatus.ANALYZING ? (
              <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check Compliance & Get Suggestions
              </>
            )}
           </button>
        )}
      </div>

      {/* Suggestions Panel */}
      {suggestions && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-slate-700 animate-fade-in-up">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            AI Suggestions
          </h3>
          <div className="prose prose-sm prose-amber max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{suggestions}</pre>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === AppStatus.ERROR && errorMessage && (
        <div className="mt-auto p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {status === AppStatus.SUCCESS && !suggestions && (
        <div className="mt-auto p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-fade-in-up">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {hasContent ? "Content updated successfully!" : "Draft created successfully!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;