import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { analyzeTrades } from '../services/geminiService';
import { Trade } from '../types';
import ReactMarkdown from 'react-markdown'; // Note: Ideally we use a library, but here I'll do simple rendering or basic replacement if lib not available. 
// Since I can't easily import react-markdown in this restriction without complex setup, I'll render the text safely with basic line breaks.

interface AIAnalystProps {
  trades: Trade[];
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ trades }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeTrades(trades);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
             <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">AI Portfolio Analysis</h3>
            <p className="text-zinc-400 text-xs">Powered by Gemini 2.5</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
          {loading ? 'Analyzing...' : 'Analyze Journal'}
        </button>
      </div>

      <div className="flex-grow bg-zinc-900 rounded-lg p-5 overflow-y-auto border border-zinc-700 min-h-[300px]">
        {!analysis && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <Sparkles size={48} className="mb-4 opacity-20" />
            <p className="text-center max-w-xs">
              Click "Analyze Journal" to get AI-driven insights on your trading performance, patterns, and psychology.
            </p>
          </div>
        )}
        
        {loading && !analysis && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <Loader2 size={40} className="animate-spin text-amber-500" />
            <p className="animate-pulse">Reading your tape...</p>
          </div>
        )}

        {analysis && (
           <div className="prose prose-invert prose-sm max-w-none">
             {/* Simple renderer for the markdown response */}
             {analysis.split('\n').map((line, i) => {
                if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-amber-300 mt-4 mb-2">{line.replace('###', '')}</h3>;
                if (line.startsWith('**') || line.startsWith('##')) return <h4 key={i} className="font-bold text-zinc-200 mt-3 mb-1">{line.replace(/\*\*/g, '').replace('##', '')}</h4>;
                if (line.startsWith('- ')) return <li key={i} className="text-zinc-300 ml-4 mb-1 list-disc">{line.replace('- ', '')}</li>;
                if (line.startsWith('1. ')) return <div key={i} className="text-zinc-300 mt-2 mb-1">{line}</div>;
                return <p key={i} className="text-zinc-400 mb-2 leading-relaxed">{line}</p>;
             })}
           </div>
        )}
      </div>
    </div>
  );
};