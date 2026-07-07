import React, { useState } from 'react';
import { Heading, AlertCircle, Loader2, Copy } from 'lucide-react';

export default function HeadlineGenerator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult([]);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `নিচের সংবাদ বা টেক্সটটির জন্য ৫টি আকর্ষণীয় ও এসইও-বান্ধব বাংলা শিরোনাম (Headline) তৈরি করে দাও। শিরোনামগুলো এমন হতে হবে যাতে পাঠকরা ক্লিক করতে আগ্রহী হয়। ফলাফল শুধুমাত্র ৫টি লাইনে ৫টি শিরোনাম দিবে, কোন অতিরিক্ত কথা বা নাম্বারিং (১, ২) এর প্রয়োজন নেই।\n\nসংবাদ/টেক্সট: \n\n${text}`,
          systemInstruction: "You are an expert news editor and copywriter in Bengali. Generate exactly 5 catchy, click-worthy, and SEO-friendly headlines for the provided text. Return ONLY the headlines separated by newlines. No numbering, no bullets, no conversational text."
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate headlines');
      }

      const lines = data.text.split('\n').filter((l: string) => l.trim().length > 0);
      setResult(lines);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (headline: string) => {
    navigator.clipboard.writeText(headline);
    alert('শিরোনাম কপি করা হয়েছে!');
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        <div className="mb-6 border-b border-[#E5E5DF] pb-4">
          <h2 className="text-xl font-bold text-[#2C2C24]">শিরোনাম জেনারেটর (Headline Generator)</h2>
          <p className="text-[#8A8A78] text-sm mt-1">আপনার সংবাদের মূল অংশ বা সারাংশ লিখুন, কৃত্রিম বুদ্ধিমত্তা আপনাকে আকর্ষণীয় ৫টি শিরোনাম তৈরি করে দেবে।</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Input Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5A5A40] h-[300px] md:h-auto">
            <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF]">
              <span className="font-bold text-[#5A5A40] text-sm">সংবাদের মূল বিষয় বা সারাংশ</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="এখানে আপনার সংবাদের সারাংশ লিখুন..."
              className="flex-1 w-full p-4 focus:outline-none resize-none font-medium leading-relaxed"
              style={{ fontFamily: 'SolaimanLipi, sans-serif' }}
            ></textarea>
            <div className="p-3 border-t border-[#DCDCCF] bg-white flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="bg-[#2C2C24] hover:bg-[#434338] disabled:bg-[#8A8A78] disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Heading size={18} />}
                <span>{isLoading ? 'তৈরি হচ্ছে...' : 'শিরোনাম তৈরি করুন'}</span>
              </button>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden">
            <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF]">
              <span className="font-bold text-[#5A5A40] text-sm">প্রস্তাবিত শিরোনাম</span>
            </div>
            <div className="flex-1 w-full p-4 bg-[#FAFAFA] overflow-y-auto">
              {result.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {result.map((headline, index) => (
                    <div key={index} className="bg-white border border-[#E5E5DF] rounded-lg p-4 flex justify-between items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-lg text-[#2C2C24] leading-snug" style={{ fontFamily: 'SolaimanLipi, sans-serif' }}>
                        {headline.replace(/^[-*•]\s*/, '')}
                      </h3>
                      <button 
                        onClick={() => handleCopy(headline.replace(/^[-*•]\s*/, ''))}
                        className="text-[#8A8A78] hover:text-[#5A5A40] bg-[#F5F5F0] p-2 rounded-md transition-colors flex-shrink-0"
                        title="কপি করুন"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  ))}
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
