import React, { useState } from 'react';
import { Search, AlertCircle, Loader2, Copy } from 'lucide-react';

export default function SeoTagGenerator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ keywords: string, description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
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
          prompt: `নিচের সংবাদ বা টেক্সটটির জন্য এসইও (SEO) মেটা ট্যাগ তৈরি করে দাও।\n১. ১০টি কমা দিয়ে আলাদা করা কিওয়ার্ড (Keywords)\n২. একটি আকর্ষণীয় মেটা ডেসক্রিপশন (Meta Description) যা ১৫৫ অক্ষরের মধ্যে হবে।\n\nফলাফলটি ঠিক এই ফরম্যাটে দিবে (অন্য কোন কথা থাকবে না):\nKEYWORDS: কিওয়ার্ড ১, কিওয়ার্ড ২, কিওয়ার্ড ৩...\nDESCRIPTION: মেটা ডেসক্রিপশন এখানে...\n\nসংবাদ/টেক্সট: \n\n${text}`,
          systemInstruction: "You are an expert SEO specialist in Bengali. Generate exactly 10 comma-separated keywords and one meta description (under 155 characters) for the provided text. Return ONLY the requested format without any markdown or extra text."
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate SEO tags');
      }

      // Parse the response
      const outputText = data.text;
      const kwMatch = outputText.match(/KEYWORDS:\s*(.+)/i);
      const descMatch = outputText.match(/DESCRIPTION:\s*(.+)/i);

      if (kwMatch || descMatch) {
        setResult({
          keywords: kwMatch ? kwMatch[1].trim() : '',
          description: descMatch ? descMatch[1].trim() : ''
        });
      } else {
        // Fallback if AI didn't follow exact format
        const lines = outputText.split('\n').filter((l: string) => l.trim().length > 0);
        setResult({
          keywords: lines[0] || '',
          description: lines[1] || ''
        });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('কপি করা হয়েছে!');
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        <div className="mb-6 border-b border-[#E5E5DF] pb-4">
          <h2 className="text-xl font-bold text-[#2C2C24]">এসইও ট্যাগ জেনারেটর (SEO Tags)</h2>
          <p className="text-[#8A8A78] text-sm mt-1">সংবাদের টেক্সট দিন, এআই (AI) স্বয়ংক্রিয়ভাবে এসইও-এর জন্য কিওয়ার্ড এবং মেটা ডেসক্রিপশন তৈরি করে দেবে।</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Input Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5A5A40] h-[300px] lg:h-auto">
            <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF]">
              <span className="font-bold text-[#5A5A40] text-sm">সংবাদের মূল বিষয় বা সম্পূর্ণ লেখা</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="এখানে আপনার সংবাদটি পেস্ট করুন..."
              className="flex-1 w-full p-4 focus:outline-none resize-none font-medium leading-relaxed"
              style={{ fontFamily: 'SolaimanLipi, sans-serif' }}
            ></textarea>
            <div className="p-3 border-t border-[#DCDCCF] bg-white flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="bg-[#2C2C24] hover:bg-[#434338] disabled:bg-[#8A8A78] disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                <span>{isLoading ? 'তৈরি হচ্ছে...' : 'এসইও ট্যাগ তৈরি করুন'}</span>
              </button>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Keywords */}
            <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden">
              <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF] flex justify-between items-center">
                <span className="font-bold text-[#5A5A40] text-sm">কিওয়ার্ডস (Keywords/Tags)</span>
                <button 
                  onClick={() => handleCopy(result?.keywords || '')}
                  disabled={!result?.keywords}
                  className="text-[#8A8A78] hover:text-[#5A5A40] disabled:opacity-50 transition-colors"
                  title="কপি করুন"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex-1 w-full p-4 bg-[#FAFAFA] overflow-y-auto">
                {result?.keywords ? (
                  <div className="font-medium text-[#2C2C24] leading-relaxed" style={{ fontFamily: 'SolaimanLipi, sans-serif' }}>
                    {result.keywords}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8A8A78] text-sm italic">
                    কিওয়ার্ডস এখানে দেখাবে...
                  </div>
                )}
              </div>
            </div>

            {/* Meta Description */}
            <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden">
              <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF] flex justify-between items-center">
                <span className="font-bold text-[#5A5A40] text-sm">মেটা ডেসক্রিপশন (Meta Description)</span>
                <button 
                  onClick={() => handleCopy(result?.description || '')}
                  disabled={!result?.description}
                  className="text-[#8A8A78] hover:text-[#5A5A40] disabled:opacity-50 transition-colors"
                  title="কপি করুন"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex-1 w-full p-4 bg-[#FAFAFA] overflow-y-auto relative">
                {result?.description ? (
                  <>
                    <div className="font-medium text-[#2C2C24] leading-relaxed" style={{ fontFamily: 'SolaimanLipi, sans-serif' }}>
                      {result.description}
                    </div>
                    <div className="absolute bottom-2 right-4 text-xs font-bold text-[#8A8A78]">
                      {result.description.length} অক্ষর
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8A8A78] text-sm italic">
                    ডেসক্রিপশন এখানে দেখাবে...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
