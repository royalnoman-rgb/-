import React, { useState } from 'react';
import { SpellCheck, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';

export default function SpellChecker() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `নিচের বাংলা টেক্সটটির বানান পরীক্ষা করে সঠিক বানানসহ টেক্সটটি দাও। যদি কোনো ভুল থাকে তবে সেগুলো ঠিক করে দাও। শুধুমাত্র সঠিক টেক্সটটি রিটার্ন করবে, অন্য কোনো ব্যাখ্যা দেওয়ার প্রয়োজন নেই। টেক্সট: \n\n${text}`,
          systemInstruction: "You are an expert Bengali proofreader and grammar checker. Correct any spelling or grammatical errors in the user's text. Return ONLY the corrected Bengali text. Do not add any introductory or concluding remarks."
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check spelling');
      }

      setResult(data.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('সঠিক টেক্সট কপি করা হয়েছে!');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        <div className="mb-6 border-b border-[#E5E5DF] pb-4">
          <h2 className="text-xl font-bold text-[#2C2C24]">বাংলা বানান পরীক্ষক</h2>
          <p className="text-[#8A8A78] text-sm mt-1">আপনার বাংলা লেখা পেস্ট করুন, কৃত্রিম বুদ্ধিমত্তা (AI) স্বয়ংক্রিয়ভাবে বানান ও ব্যাকরণ ঠিক করে দেবে।</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[400px]">
          {/* Input Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5A5A40]">
            <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF] flex justify-between items-center">
              <span className="font-bold text-[#5A5A40] text-sm">আপনার লেখা (ভুল থাকতে পারে)</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="এখানে আপনার বাংলা লেখা পেস্ট করুন..."
              className="flex-1 w-full p-4 focus:outline-none resize-none font-medium leading-relaxed"
              style={{ fontFamily: 'SolaimanLipi, sans-serif' }}
            ></textarea>
          </div>

          <div className="flex justify-center items-center py-2 md:py-0">
            <button 
              onClick={handleCheck}
              disabled={isLoading || !text.trim()}
              className="bg-[#2C2C24] hover:bg-[#434338] disabled:bg-[#8A8A78] disabled:cursor-not-allowed text-white px-6 py-3 md:py-8 rounded-xl md:rounded-full font-bold shadow-md transition-all active:scale-95 flex flex-col items-center gap-2"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <SpellCheck size={24} />}
              <span className="md:hidden lg:inline">{isLoading ? 'চেক হচ্ছে...' : 'চেক করুন'}</span>
            </button>
          </div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden">
            <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF] flex justify-between items-center">
              <span className="font-bold text-[#5A5A40] text-sm flex items-center gap-1.5">
                <CheckCircle size={16} className="text-green-600" /> সঠিক লেখা
              </span>
              <button 
                onClick={handleCopy} 
                disabled={!result}
                className="text-[#5A5A40] hover:text-black disabled:opacity-50 transition-colors bg-white border border-[#DCDCCF] px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
              >
                <Copy size={14} /> কপি
              </button>
            </div>
            <div className="flex-1 w-full p-4 bg-[#FAFAFA] overflow-y-auto">
              {result ? (
                <div 
                  className="font-medium leading-relaxed text-[#2C2C24]"
                  style={{ fontFamily: 'SolaimanLipi, sans-serif', whiteSpace: 'pre-wrap' }}
                >
                  {result}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#8A8A78] text-sm italic">
                  ফলাফল এখানে দেখাবে...
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
