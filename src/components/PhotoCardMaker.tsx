import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';

export default function PhotoCardMaker({ sharedImage }: { sharedImage?: string | null }) {
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [mainImgSrc, setMainImgSrc] = useState<string>('');
  
  const [zoomVal, setZoomVal] = useState<number>(1);
  const [posVal, setPosVal] = useState<number>(0);
  const [posXVal, setPosXVal] = useState<number>(0);
  
  const [titleText, setTitleText] = useState<string>('এখানে আপনার নিউজ পোর্টালের ব্রেকিং অথবা প্রধান আকর্ষণীয় শিরোনামটি লিখুন...');
  const [titleFontSize, setTitleFontSize] = useState<number>(26);
  const [detailTag, setDetailTag] = useState<string>('বিস্তারিত কমেন্টে');
  
  const [dayName, setDayName] = useState<string>('');
  const [engDate, setEngDate] = useState<string>('');
  const [bngDate, setBngDate] = useState<string>('');
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateDate();
    const savedLogo = localStorage.getItem('purbadhala_saved_logo');
    if (savedLogo) setLogoSrc(savedLogo);
  }, []);

  useEffect(() => {
    if (sharedImage) {
      setMainImgSrc(sharedImage);
      setZoomVal(1);
      setPosVal(0);
      setPosXVal(0);
    }
  }, [sharedImage]);

  const updateDate = () => {
    const today = new Date();
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    setDayName(days[today.getDay()]);
    
    const bngNum = (n: number) => n.toString().split('').map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join('');
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    setEngDate(`${bngNum(today.getDate())} ${months[today.getMonth()]} ${bngNum(today.getFullYear())}`);
    
    let bngDay = today.getDate() + 17; 
    let bngMonth = "জ্যৈষ্ঠ";
    let bngYear = 1433; // Approximation as in original HTML
    if(today.getMonth() === 5 && today.getDate() > 14) {
        bngDay = today.getDate() - 14; 
        bngMonth = "আষাঢ়";
    }
    setBngDate(`${bngNum(bngDay)} ${bngMonth} ${bngNum(bngYear)}`); 
  };

  const loadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
          const result = reader.result as string;
          localStorage.setItem('purbadhala_saved_logo', result);
          setLogoSrc(result);
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const loadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]); 
      setMainImgSrc(url);
      setZoomVal(1);
      setPosVal(0);
    }
  };

  const download = () => {
    if (cardRef.current) {
        htmlToImage.toPng(cardRef.current, { 
            pixelRatio: 2, 
            width: 540,
            height: 540,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }
        }).then(dataUrl => {
            const link = document.createElement('a'); 
            link.download = 'Purbadhala_Premium_Card_' + Date.now() + '.png'; 
            link.href = dataUrl; 
            link.click();
        }).catch(err => {
            console.error('Error generating image', err);
        });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full bg-[#0f172a] text-white p-6 overflow-y-auto">
      <style>{`
        .slider-orange::-webkit-slider-thumb { background: #f39c12; }
        .slider-green::-webkit-slider-thumb { background: #2ecc71; }
      `}</style>
      
      {/* Controls */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl w-full lg:w-[380px] h-fit border border-[#334155] shrink-0">
        <h2 className="font-bold tracking-wide text-[#38bdf8] text-xl mb-1">Purbadhala PhotoCard Maker</h2>
        <p className="text-[#94a3b8] text-xs mb-6">প্রফেশনাল থিম সমৃদ্ধ মডার্ন মেকার</p>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">১. পোর্টাল লোগো:</label>
          <input type="file" accept="image/*" onChange={loadLogo} className="w-full p-2 border border-[#334155] bg-[#0f172a] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
        </div>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">২. মূল খবরের ছবি:</label>
          <input type="file" accept="image/*" onChange={loadImg} className="w-full p-2 border border-[#334155] bg-[#0f172a] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
        </div>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৩. ছবি জুম করুন (Zoom In/Out):</label>
          <input type="range" min="0.5" max="3" step="0.02" value={zoomVal} onChange={(e) => setZoomVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-orange" />
          <span className="font-bold text-[#f39c12] inline-block mt-1 text-xs">{Math.round(zoomVal * 100)}%</span>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৪. ছবি উপরে-নিচে সরান (Position Y):</label>
          <input type="range" min="-300" max="300" value={posVal} onChange={(e) => setPosVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-green" />
          <span className="font-bold text-[#2ecc71] inline-block mt-1 text-xs">
            {posVal === 0 ? '0px (Center)' : posVal > 0 ? `+${posVal}px (নিচে)` : `${posVal}px (উপরে)`}
          </span>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৪.১ ছবি ডানে-বামে সরান (Position X):</label>
          <input type="range" min="-300" max="300" value={posXVal} onChange={(e) => setPosXVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-orange" />
          <span className="font-bold text-[#f39c12] inline-block mt-1 text-xs">
            {posXVal === 0 ? '0px (Center)' : posXVal > 0 ? `+${posXVal}px (ডানে)` : `${posXVal}px (বামে)`}
          </span>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৫. আকর্ষণীয় শিরোনাম:</label>
          <textarea rows={3} value={titleText} onChange={(e) => setTitleText(e.target.value)} className="w-full p-3 border border-[#334155] bg-[#0f172a] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] resize-none" placeholder="এখানে আপনার নিউজ পোর্টালের ব্রেকিং অথবা প্রধান আকর্ষণীয় শিরোনামটি লিখুন..."></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৬. শিরোনামের ফন্ট সাইজ:</label>
          <input type="range" min="18" max="40" value={titleFontSize} onChange={(e) => setTitleFontSize(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none" />
          <span className="font-bold text-[#38bdf8] inline-block mt-1 text-xs">{titleFontSize}px</span>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৭. বিস্তারিত ট্যাগ বাটন:</label>
          <select value={detailTag} onChange={(e) => setDetailTag(e.target.value)} className="w-full p-3 border border-[#334155] bg-[#0f172a] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]">
            <option value="বিস্তারিত কমেন্টে">বিস্তারিত কমেন্টে</option>
            <option value="বিস্তারিত ক্যাপশনে">বিস্তারিত ক্যাপশনে</option>
          </select>
        </div>
        
        <button onClick={download} className="w-full py-4 bg-gradient-to-br from-[#38bdf8] to-[#0369a1] text-white rounded-xl text-lg font-bold shadow-[0_4px_15px_rgba(56,189,248,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(56,189,248,0.4)] transition-all">
          ফটোকার্ড ডাউনলোড করুন
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex justify-center items-start pt-4 lg:pt-0">
        <div className="border-[8px] border-[#1e293b] rounded-xl shadow-2xl p-2 bg-[#0f172a]">
          <div 
            ref={cardRef} 
            className="relative bg-[#111] overflow-hidden" 
            style={{ width: '540px', height: '540px', fontFamily: "'SolaimanLipi', sans-serif" }}
          >
            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
                {mainImgSrc && (
                  <img 
                    src={mainImgSrc} 
                    style={{
                      transform: `translate(${posXVal}px, ${posVal}px) scale(${zoomVal})`,
                      transformOrigin: 'center center',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }} 
                    alt="Main News" 
                  />
                )}
            </div>
            
            {/* Top Fixed Bar */}
            <div className="absolute top-0 left-0 w-full h-[85px] z-20" style={{ background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)', borderBottom: '2.5px solid #f59e0b' }}></div>
            
            {/* Content Mask Gradient */}
            <div className="absolute bottom-[45px] left-0 w-full h-[165px] z-20 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}></div>
            
            {/* Newsprint Texture */}
            <div className="absolute bottom-0 left-0 w-full h-[40%] opacity-[0.02] z-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '5px 5px' }}></div>

            {/* Header Content */}
            <div className="absolute top-[15px] left-[25px] right-[25px] flex justify-between items-center z-30">
                <div className="max-w-[170px] h-[50px] flex items-center">
                  {logoSrc && <img src={logoSrc} className="max-w-full max-h-full object-contain" alt="Logo" />}
                </div>
                <div className="text-right text-white leading-tight">
                    <div className="text-[16px] font-bold text-[#f59e0b]">{dayName}</div>
                    <div className="text-[13px] font-medium opacity-95 my-[1px]">{engDate}</div>
                    <div className="text-[11px] opacity-85">{bngDate}</div>
                </div>
            </div>

            {/* Main Text Content */}
            <div className="absolute bottom-[55px] left-[25px] right-[25px] z-30 text-left">
                <div className="border-l-[3.5px] border-[#e50914] pl-3 mb-3">
                    <div style={{ fontSize: `${titleFontSize}px` }} className="font-bold leading-[1.38] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                      {titleText}
                    </div>
                </div>
                <div className="inline-block bg-gradient-to-br from-[#e50914] to-[#990000] text-white px-[22px] py-[5px] rounded font-bold text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] ml-[15px]">
                  {detailTag}
                </div>
            </div>

            {/* Footer Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[45px] bg-[#f59e0b] z-40 flex items-center justify-around border-t border-black/5">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="16" height="16" alt="Facebook" />
                  @purbadhala
                </div>
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="22" height="16" alt="YouTube" style={{ objectFit: 'contain' }} />
                  @purbadhala
                </div>
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                  <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" />
                  www.pdonline.com.bd
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
