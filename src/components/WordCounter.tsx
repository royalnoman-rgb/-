import React, { useState } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-[#2C2C24]">শব্দ ও অক্ষর গণনাকারী (Word & Character Counter)</h2>
        <p className="text-sm text-[#8A8A78] mb-4">নিচের বক্সে আপনার লেখাটি পেস্ট করুন। এটি স্বয়ংক্রিয়ভাবে শব্দ ও অক্ষর গণনা করবে।</p>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="এখানে আপনার লেখা পেস্ট করুন..."
          className="flex-1 w-full p-4 border border-[#DCDCCF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent resize-none font-medium mb-4"
        ></textarea>
        
        <div className="flex gap-4">
          <div className="bg-[#F5F5F0] px-6 py-4 rounded-xl flex flex-col items-center flex-1 border border-[#E5E5DF]">
            <span className="text-3xl font-bold text-[#2C2C24]">{wordCount}</span>
            <span className="text-sm text-[#8A8A78] font-bold mt-1">শব্দ (Words)</span>
          </div>
          <div className="bg-[#F5F5F0] px-6 py-4 rounded-xl flex flex-col items-center flex-1 border border-[#E5E5DF]">
            <span className="text-3xl font-bold text-[#2C2C24]">{charCount}</span>
            <span className="text-sm text-[#8A8A78] font-bold mt-1">অক্ষর (Characters)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
