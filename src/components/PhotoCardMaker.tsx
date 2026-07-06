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

  const [fbText, setFbText] = useState<string>('@purbadhala');
  const [ytText, setYtText] = useState<string>('@purbadhala');
  const [webText, setWebText] = useState<string>('www.pdonline.com.bd');

  const [activeTemplate, setActiveTemplate] = useState<number>(2);
  
  const [isTemplate1Unlocked, setIsTemplate1Unlocked] = useState(false);
  const [template1Password, setTemplate1Password] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

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
    let bngYear = 1433; 
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
      setPosXVal(0);
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
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl w-full lg:w-[420px] h-fit border border-[#334155] shrink-0">
        <h2 className="font-bold tracking-wide text-[#38bdf8] text-xl mb-1">Purbadhala PhotoCard Maker</h2>
        <p className="text-[#94a3b8] text-xs mb-6">প্রফেশনাল থিম সমৃদ্ধ মডার্ন মেকার</p>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">১. ডিজাইন টেমপ্লেট নির্বাচন করুন:</label>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(t => (
              <div key={t} className="relative">
                <button
                  onClick={() => {
                    if (t === 1 && !isTemplate1Unlocked) {
                      setShowPasswordInput(!showPasswordInput);
                    } else {
                      setActiveTemplate(t);
                      setShowPasswordInput(false);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                    activeTemplate === t 
                    ? 'bg-[#38bdf8] text-white border-[#38bdf8]' 
                    : 'bg-[#0f172a] text-[#94a3b8] border-[#334155] hover:border-[#38bdf8]'
                  }`}
                >
                  ডিজাইন {t} {t === 1 && !isTemplate1Unlocked && '🔒'}
                </button>
                {t === 1 && showPasswordInput && !isTemplate1Unlocked && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-[#1e293b] p-2 border border-[#334155] rounded-lg z-10 shadow-xl">
                    <input 
                      type="password" 
                      placeholder="পাসওয়ার্ড দিন" 
                      className="w-full p-2 text-sm bg-[#0f172a] text-white border border-[#334155] rounded mb-2 focus:outline-none focus:border-[#38bdf8]"
                      value={template1Password}
                      onChange={(e) => setTemplate1Password(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        if(template1Password === 'pdonline') {
                          setIsTemplate1Unlocked(true);
                          setActiveTemplate(1);
                          setShowPasswordInput(false);
                        } else {
                          alert('ভুল পাসওয়ার্ড! এটি শুধুমাত্র অ্যাডমিনদের জন্য।');
                        }
                      }}
                      className="w-full bg-[#38bdf8] text-white font-bold text-xs py-2 rounded hover:bg-[#0284c7] transition-colors"
                    >
                      আনলক করুন
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">২. পোর্টাল লোগো:</label>
          <input type="file" accept="image/*" onChange={loadLogo} className="w-full p-2 border border-[#334155] bg-[#0f172a] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
        </div>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৩. মূল খবরের ছবি:</label>
          <input type="file" accept="image/*" onChange={loadImg} className="w-full p-2 border border-[#334155] bg-[#0f172a] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
        </div>
        
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৪. ছবি জুম করুন (Zoom In/Out):</label>
          <input type="range" min="0.5" max="3" step="0.02" value={zoomVal} onChange={(e) => setZoomVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-orange" />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
             <label className="block font-semibold mb-2 text-[#94a3b8] text-xs">উপরে-নিচে সরান (Y):</label>
             <input type="range" min="-300" max="300" value={posVal} onChange={(e) => setPosVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-green" />
          </div>
          <div className="w-1/2">
             <label className="block font-semibold mb-2 text-[#94a3b8] text-xs">ডানে-বামে সরান (X):</label>
             <input type="range" min="-300" max="300" value={posXVal} onChange={(e) => setPosXVal(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none slider-orange" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-[#94a3b8] text-sm">৫. আকর্ষণীয় শিরোনাম:</label>
          <textarea rows={3} value={titleText} onChange={(e) => setTitleText(e.target.value)} className="w-full p-3 border border-[#334155] bg-[#0f172a] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8] resize-none" placeholder="এখানে আপনার নিউজ পোর্টালের ব্রেকিং অথবা প্রধান আকর্ষণীয় শিরোনামটি লিখুন..."></textarea>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block font-semibold mb-2 text-[#94a3b8] text-xs">৬. শিরোনামের ফন্ট সাইজ:</label>
            <input type="range" min="18" max="40" value={titleFontSize} onChange={(e) => setTitleFontSize(Number(e.target.value))} className="w-full h-1.5 bg-[#334155] rounded-full appearance-none" />
          </div>
          <div className="w-1/2">
            <label className="block font-semibold mb-2 text-[#94a3b8] text-xs">৭. বিস্তারিত ট্যাগ বাটন:</label>
            <select value={detailTag} onChange={(e) => setDetailTag(e.target.value)} className="w-full p-2 border border-[#334155] bg-[#0f172a] text-white rounded-lg text-sm focus:outline-none focus:border-[#38bdf8]">
              <option value="বিস্তারিত কমেন্টে">বিস্তারিত কমেন্টে</option>
              <option value="বিস্তারিত ক্যাপশনে">বিস্তারিত ক্যাপশনে</option>
            </select>
          </div>
        </div>

        <div className="mb-6 bg-[#0f172a] p-4 rounded-xl border border-[#334155]">
          <label className="block font-bold mb-3 text-[#38bdf8] text-sm">৮. ফুটার আইকন টেক্সট পরিবর্তন:</label>
          <div className="space-y-3">
             <div>
               <label className="block text-xs text-[#94a3b8] mb-1">ফেসবুক টেক্সট:</label>
               <input type="text" value={fbText} onChange={(e) => setFbText(e.target.value)} className="w-full p-2 border border-[#334155] bg-[#1e293b] rounded text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
             </div>
             <div>
               <label className="block text-xs text-[#94a3b8] mb-1">ইউটিউব টেক্সট:</label>
               <input type="text" value={ytText} onChange={(e) => setYtText(e.target.value)} className="w-full p-2 border border-[#334155] bg-[#1e293b] rounded text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
             </div>
             <div>
               <label className="block text-xs text-[#94a3b8] mb-1">ওয়েবসাইট ঠিকানা:</label>
               <input type="text" value={webText} onChange={(e) => setWebText(e.target.value)} className="w-full p-2 border border-[#334155] bg-[#1e293b] rounded text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8]" />
             </div>
          </div>
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
            {/* Main Image Layer */}
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

            {/* ----- TEMPLATE 1: Default Blue & Yellow ----- */}
            {activeTemplate === 1 && (
              <>
                <div className="absolute top-0 left-0 w-full h-[85px] z-20" style={{ background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)', borderBottom: '2.5px solid #f59e0b' }}></div>
                <div className="absolute bottom-[45px] left-0 w-full h-[165px] z-20 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] opacity-[0.02] z-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '5px 5px' }}></div>
                
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

                <div className="absolute bottom-0 left-0 w-full h-[45px] bg-[#f59e0b] z-40 flex items-center justify-around border-t border-black/5">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="16" height="16" alt="Facebook" />
                      {fbText}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="22" height="16" alt="YouTube" style={{ objectFit: 'contain' }} />
                      {ytText}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                      <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" />
                      {webText}
                    </div>
                </div>
              </>
            )}

            {/* ----- TEMPLATE 2: Elegant Light ----- */}
            {activeTemplate === 2 && (
              <>
                <div className="absolute top-0 left-0 w-full h-[90px] z-20 bg-white/95 backdrop-blur-sm border-b-4 border-[#e50914] shadow-md"></div>
                <div className="absolute bottom-[40px] left-0 w-full h-[180px] z-20 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)' }}></div>
                
                <div className="absolute top-[20px] left-[25px] right-[25px] flex justify-between items-center z-30">
                    <div className="max-w-[170px] h-[50px] flex items-center">
                      {logoSrc && <img src={logoSrc} className="max-w-full max-h-full object-contain filter drop-shadow-sm" alt="Logo" />}
                    </div>
                    <div className="text-right text-[#1e293b] leading-tight">
                        <div className="text-[16px] font-extrabold text-[#e50914]">{dayName}</div>
                        <div className="text-[13px] font-bold opacity-90 my-[1px]">{engDate}</div>
                        <div className="text-[11px] font-semibold opacity-80">{bngDate}</div>
                    </div>
                </div>

                <div className="absolute bottom-[55px] left-[25px] right-[25px] z-30 text-center flex flex-col items-center">
                    <div className="bg-[#e50914] text-white px-[22px] py-[6px] rounded-full font-bold text-[13px] shadow-lg mb-3 uppercase tracking-wider inline-block">
                      {detailTag}
                    </div>
                    <div style={{ fontSize: `${titleFontSize}px` }} className="font-extrabold leading-[1.3] text-[#0f172a] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] px-2">
                      {titleText}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[40px] bg-[#1e293b] z-40 flex items-center justify-around">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-white">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="14" height="14" alt="Facebook" />
                      {fbText}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-white">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="20" height="14" alt="YouTube" style={{ objectFit: 'contain' }} />
                      {ytText}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-white">
                      <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="14" height="14" alt="Website" style={{ filter: 'brightness(0) invert(1)' }} />
                      {webText}
                    </div>
                </div>
              </>
            )}

            {/* ----- TEMPLATE 3: Breaking News Red ----- */}
            {activeTemplate === 3 && (
              <>
                <div className="absolute top-0 left-0 w-full h-[70px] z-20 bg-[#e50914] border-b-[5px] border-black flex items-center shadow-lg">
                  {/* Ticker style text in background */}
                  <div className="absolute inset-0 overflow-hidden opacity-10 flex items-center whitespace-nowrap text-3xl font-bold uppercase tracking-widest pointer-events-none">
                    BREAKING NEWS • BREAKING NEWS • BREAKING NEWS • BREAKING NEWS
                  </div>
                </div>
                <div className="absolute bottom-[50px] left-0 w-full h-[200px] z-20 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }}></div>
                
                <div className="absolute top-[10px] left-[25px] right-[25px] flex justify-between items-center z-30">
                    <div className="max-w-[150px] h-[50px] flex items-center bg-white/95 px-3 py-1 rounded-sm shadow-sm border border-black/10">
                      {logoSrc && <img src={logoSrc} className="max-w-full max-h-full object-contain" alt="Logo" />}
                    </div>
                    <div className="text-right text-white leading-tight">
                        <div className="text-[14px] font-black uppercase tracking-wider">{dayName}</div>
                        <div className="text-[13px] font-bold opacity-95">{engDate}</div>
                    </div>
                </div>

                <div className="absolute bottom-[65px] left-[25px] right-[25px] z-30 text-left">
                    <div className="inline-block bg-[#f59e0b] text-black px-3 py-1 mb-2 font-black text-[14px] uppercase tracking-wider border-l-[4px] border-white shadow-md">
                      ব্রেকিং নিউজ
                    </div>
                    <div style={{ fontSize: `${titleFontSize}px` }} className="font-extrabold leading-[1.3] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] border-l-[4px] border-[#e50914] pl-3">
                      {titleText}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full font-bold text-[12px] border border-white/20 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {detailTag}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[50px] bg-black z-40 flex items-center justify-around border-t-[3px] border-[#e50914]">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-gray-200">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="16" height="16" alt="Facebook" />
                      {fbText}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-bold text-gray-200">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="22" height="16" alt="YouTube" style={{ objectFit: 'contain' }} />
                      {ytText}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-bold text-gray-200">
                      <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="16" height="16" alt="Website" style={{ filter: 'brightness(0) invert(1)' }} />
                      {webText}
                    </div>
                </div>
              </>
            )}

            {/* ----- TEMPLATE 4: Dark Creative Center ----- */}
            {activeTemplate === 4 && (
              <>
                {/* Full dark gradient vignette */}
                <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-[60%] z-20 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 40%, transparent 100%)' }}></div>
                
                <div className="absolute top-[25px] left-0 w-full flex justify-center z-30">
                    <div className="max-w-[180px] h-[55px] flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
                      {logoSrc && <img src={logoSrc} className="max-w-full max-h-full object-contain filter drop-shadow-md" alt="Logo" />}
                    </div>
                </div>

                <div className="absolute bottom-[80px] left-[30px] right-[30px] z-30 text-center flex flex-col items-center">
                    <div style={{ fontSize: `${titleFontSize}px` }} className="font-black leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] pb-4 border-b-2 border-white/20 mb-4">
                      {titleText}
                    </div>
                    <div className="text-[12px] font-medium text-[#38bdf8] tracking-widest uppercase mb-1">
                      {dayName} • {engDate}
                    </div>
                    <div className="inline-block bg-[#38bdf8] text-[#0f172a] px-4 py-1.5 rounded-sm font-bold text-[12px] shadow-lg mt-3">
                      {detailTag}
                    </div>
                </div>

                <div className="absolute bottom-[20px] left-0 w-full z-40 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" width="12" height="12" alt="Facebook" className="opacity-80" />
                      {fbText}
                    </div>
                    <div className="w-[1px] h-[12px] bg-white/20"></div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" width="18" height="12" alt="YouTube" style={{ objectFit: 'contain' }} className="opacity-80" />
                      {ytText}
                    </div>
                    <div className="w-[1px] h-[12px] bg-white/20"></div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
                      <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="12" height="12" alt="Website" style={{ filter: 'brightness(0) invert(1)' }} className="opacity-80" />
                      {webText}
                    </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
