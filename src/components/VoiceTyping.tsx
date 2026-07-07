import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Trash2, AlertCircle } from 'lucide-react';

export default function VoiceTyping() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Use any to bypass strict TS checking for webkitSpeechRecognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // Set language to Bengali (Bangladesh)

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setText((prev) => prev + transcript + ' ');
          } else {
            currentTranscript += transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('মাইক্রোফোন ব্যবহারের অনুমতি নেই। দয়া করে ব্রাউজার সেটিংস থেকে অনুমতি দিন।');
        } else {
          setError(`ত্রুটি: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        // If it stopped but we still want it to listen (continuous mode sometimes stops)
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError('আপনার ব্রাউজার ভয়েস টাইপিং সমর্থন করে না। দয়া করে Google Chrome ব্যবহার করুন।');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        try {
          recognitionRef.current.start();
          setError(null);
        } catch (e) {
          console.error(e);
        }
      } else {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('টেক্সট কপি করা হয়েছে!');
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-[#F9F9F6] h-full overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5DF] flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        <div className="mb-6 border-b border-[#E5E5DF] pb-4">
          <h2 className="text-xl font-bold text-[#2C2C24]">ভয়েস টাইপিং (বাংলা)</h2>
          <p className="text-[#8A8A78] text-sm mt-1">মাইক্রোফোন চালু করে কথা বলুন, স্বয়ংক্রিয়ভাবে লেখা হয়ে যাবে।</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col border border-[#DCDCCF] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#5A5A40]">
          <div className="bg-[#F5F5F0] px-4 py-3 border-b border-[#DCDCCF] flex justify-between items-center">
            
            <button 
              onClick={toggleListening}
              disabled={!!error && !recognitionRef.current}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-[#5A5A40] hover:bg-[#434338] text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>শুরু করুন</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={handleCopy} 
                className="flex items-center gap-1.5 text-[#5A5A40] bg-white border border-[#DCDCCF] hover:bg-[#F9F9F6] px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                <Copy size={16} /> <span className="hidden sm:inline">কপি</span>
              </button>
              <button 
                onClick={handleClear} 
                className="flex items-center gap-1.5 text-red-600 bg-white border border-[#DCDCCF] hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">মুছুন</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isListening ? "শুনছি... কথা বলুন..." : "এখানে আপনার কথা টেক্সট হিসেবে দেখা যাবে। আপনি চাইলে নিজেও লিখতে পারেন..."}
              className="absolute inset-0 w-full h-full p-6 focus:outline-none resize-none font-medium text-lg leading-relaxed text-[#2C2C24]"
              style={{ fontFamily: 'SolaimanLipi, sans-serif' }}
            ></textarea>
          </div>
        </div>

      </div>
    </div>
  );
}
