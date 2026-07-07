import React, { useState } from 'react';
import bnBijoy2Unicode from '@codesigntheory/bnbijoy2unicode';
import { bnUnicode2ANSI } from '@codesigntheory/bnunicode2ansi';
import { ArrowRightLeft, Copy, Trash2 } from 'lucide-react';

export default function BijoyUnicodeConverter() {
  const [sourceText, setSourceText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [mode, setMode] = useState<'b2u' | 'u2b'>('b2u');

  const handleConvert = () => {
    if (!sourceText.trim()) {
      setConvertedText('');
      return;
    }
    
    try {
      if (mode === 'b2u') {
        setConvertedText(bnBijoy2Unicode(sourceText));
      } else {
        setConvertedText(bnUnicode2ANSI(sourceText));
      }
    } catch (err) {
      console.error(err);
      setConvertedText('কনভার্ট করতে সমস্যা হয়েছে।');
    }
  };

  const handleClear = () => {
    setSourceText('');
    setConvertedText('');
  };

  const handleCopy = () => {
    if (convertedText) {
      navigator.clipboard.writeText(convertedText);
      alert('কপি করা হয়েছে!');
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'b2u' ? 'u2b' : 'b2u');
    // Swap text
    setSourceText(convertedText);
    setConvertedText(sourceText);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2C2C24]">
            {mode === 'b2u' ? 'বিজয় থেকে ইউনিকোড' : 'ইউনিকোড থেকে বিজয়'}
          </h2>
          
          <button 
            onClick={toggleMode}
            className="flex items-center gap-2 bg-[#F5F5F0] hover:bg-[#EAEAE2] text-[#5A5A40] px-4 py-2 rounded-lg font-bold transition-colors text-sm"
          >
            <ArrowRightLeft size={16} />
            <span>দিক পরিবর্তন করুন</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[400px]">
          {/* Source Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5A5A40]">
            <div className="bg-[#F5F5F0] px-4 py-2 border-b border-[#DCDCCF] flex justify-between items-center">
              <span className="font-bold text-[#5A5A40] text-sm">
                {mode === 'b2u' ? 'বিজয় (Bijoy)' : 'ইউনিকোড (Unicode)'}
              </span>
              <button onClick={handleClear} className="text-[#8A8A78] hover:text-red-500 transition-colors" title="মুছে ফেলুন">
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="এখানে টেক্সট পেস্ট করুন..."
              className="flex-1 w-full p-4 focus:outline-none resize-none"
              style={{ fontFamily: mode === 'u2b' ? 'SolaimanLipi, sans-serif' : 'sans-serif' }}
            ></textarea>
          </div>

          {/* Center Convert Button (Visible mainly on Desktop, on Mobile it's just below) */}
          <div className="flex justify-center items-center py-2 md:py-0">
            <button 
              onClick={handleConvert}
              className="bg-[#2C2C24] hover:bg-[#434338] text-white px-6 py-3 md:py-12 rounded-xl md:rounded-full font-bold shadow-md transition-all active:scale-95"
            >
              কনভার্ট
            </button>
          </div>

          {/* Converted Area */}
          <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden">
            <div className="bg-[#F5F5F0] px-4 py-2 border-b border-[#DCDCCF] flex justify-between items-center">
              <span className="font-bold text-[#5A5A40] text-sm">
                {mode === 'b2u' ? 'ইউনিকোড (Unicode)' : 'বিজয় (Bijoy)'}
              </span>
              <button onClick={handleCopy} className="text-[#8A8A78] hover:text-[#5A5A40] transition-colors" title="কপি করুন">
                <Copy size={16} />
              </button>
            </div>
            <textarea
              readOnly
              value={convertedText}
              placeholder="ফলাফল এখানে দেখাবে..."
              className="flex-1 w-full p-4 bg-[#FAFAFA] focus:outline-none resize-none text-[#2C2C24]"
              style={{ fontFamily: mode === 'b2u' ? 'SolaimanLipi, sans-serif' : 'sans-serif' }}
            ></textarea>
          </div>
        </div>

      </div>
    </div>
  );
}
