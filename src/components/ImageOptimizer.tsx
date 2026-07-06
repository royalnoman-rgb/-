import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, Crop, Maximize, Download, RefreshCw, Image as ImageIcon, CheckCircle, FileArchive, Trash2, Layers, SlidersHorizontal, Sparkles, Undo2, PlusSquare, ArrowRight, ArrowDown, Droplet } from 'lucide-react';
import JSZip from 'jszip';
import FaceBlurTool from './FaceBlurTool';

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 630;
const ASPECT_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;

type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

const defaultAdjustments: Adjustments = { brightness: 100, contrast: 100, saturation: 100 };

type ImageItem = {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  dataUrl: string;
  optimizedUrl?: string;
  optimizedBlob?: Blob;
  optimizedSize?: number;
  adjustments: Adjustments;
};

export default function ImageOptimizer({ onSendToPhotocard }: { onSendToPhotocard?: (url: string) => void }) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [mode, setMode] = useState<'crop' | 'blur' | 'selective-blur'>('blur');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Collage mode states
  const [isCollageMode, setIsCollageMode] = useState(false);
  const [collageSelection, setCollageSelection] = useState<number[]>([]);
  const [collageDirection, setCollageDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = images[activeIndex];

  const handleCreateCollage = async () => {
    if (collageSelection.length < 2) return;
    
    setIsProcessing(true);
    try {
      const loadedImages = await Promise.all(
        collageSelection.map(i => createImage(images[i].dataUrl))
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No context');

      if (collageDirection === 'horizontal') {
          const targetHeight = Math.max(...loadedImages.map(img => img.height));
          let totalWidth = 0;
          const dimensions = loadedImages.map(img => {
              const scale = targetHeight / img.height;
              const w = img.width * scale;
              totalWidth += w;
              return { w, h: targetHeight, img };
          });
          
          canvas.width = totalWidth;
          canvas.height = targetHeight;
          
          let currentX = 0;
          dimensions.forEach(({w, h, img}) => {
              ctx.drawImage(img, currentX, 0, w, h);
              currentX += w;
          });
      } else {
          const targetWidth = Math.max(...loadedImages.map(img => img.width));
          let totalHeight = 0;
          const dimensions = loadedImages.map(img => {
              const scale = targetWidth / img.width;
              const h = img.height * scale;
              totalHeight += h;
              return { w: targetWidth, h, img };
          });
          
          canvas.width = targetWidth;
          canvas.height = totalHeight;
          
          let currentY = 0;
          dimensions.forEach(({w, h, img}) => {
              ctx.drawImage(img, 0, currentY, w, h);
              currentY += h;
          });
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      const newImageItem: ImageItem = {
          id: 'collage-' + Date.now(),
          file: new File([], 'collage.jpg', { type: 'image/jpeg' }),
          originalName: 'Collage_Merged.jpg',
          originalSize: Math.round((dataUrl.length * 3) / 4),
          dataUrl,
          adjustments: { ...defaultAdjustments },
      };

      setImages(prev => [newImageItem, ...prev]);
      setActiveIndex(0);
      setIsCollageMode(false);
      setCollageSelection([]);
    } catch(e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  const toggleCollageSelection = (index: number) => {
    setCollageSelection(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: ImageItem[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const dataUrl = await readFile(file);
        newImages.push({
          id: Date.now() + '-' + i,
          file,
          originalName: file.name,
          originalSize: file.size,
          dataUrl,
          adjustments: { ...defaultAdjustments },
        });
      }
      setImages(prev => [...prev, ...newImages]);
      if (images.length === 0) setActiveIndex(0);
      // Reset input value so same files can be selected again if removed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (activeIndex >= index && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const updateAdjustment = (field: keyof Adjustments, value: number) => {
    if (!activeImage) return;
    setImages(prev => {
      const copy = [...prev];
      copy[activeIndex] = {
         ...copy[activeIndex],
         adjustments: {
            ...copy[activeIndex].adjustments,
            [field]: value
         }
      };
      return copy;
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getOptimizedBlob = async (srcUrl: string, currentMode: 'crop' | 'blur', cropPixels: any, adj: Adjustments): Promise<Blob | null> => {
    try {
      const image = await createImage(srcUrl);
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('No 2d context');

      const filterStr = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%)`;

      if (currentMode === 'crop' && cropPixels) {
        ctx.filter = filterStr;
        ctx.drawImage(
          image,
          cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
          0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );
      } else {
        const imgRatio = image.width / image.height;
        const canvasRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT;
        let renderWidth, renderHeight, x, y;

        if (imgRatio > canvasRatio) {
           renderHeight = OUTPUT_HEIGHT;
           renderWidth = image.width * (OUTPUT_HEIGHT / image.height);
        } else {
           renderWidth = OUTPUT_WIDTH;
           renderHeight = image.height * (OUTPUT_WIDTH / image.width);
        }
        x = (OUTPUT_WIDTH - renderWidth) / 2;
        y = (OUTPUT_HEIGHT - renderHeight) / 2;

        ctx.filter = 'blur(20px) brightness(0.8)';
        ctx.drawImage(image, x, y, renderWidth, renderHeight);
        
        ctx.filter = filterStr;

        let fitWidth, fitHeight, fitX, fitY;
        if (imgRatio > canvasRatio) {
            fitWidth = OUTPUT_WIDTH;
            fitHeight = image.height * (OUTPUT_WIDTH / image.width);
        } else {
            fitHeight = OUTPUT_HEIGHT;
            fitWidth = image.width * (OUTPUT_HEIGHT / image.height);
        }
        fitX = (OUTPUT_WIDTH - fitWidth) / 2;
        fitY = (OUTPUT_HEIGHT - fitHeight) / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.drawImage(image, fitX, fitY, fitWidth, fitHeight);
        ctx.shadowColor = 'transparent';
      }

      return new Promise((resolve) => {
        const attemptOptimization = (quality: number) => {
          canvas.toBlob((blob) => {
             if (blob && blob.size > 200 * 1024 && quality > 0.4) {
               attemptOptimization(quality - 0.1);
             } else {
               resolve(blob);
             }
          }, 'image/webp', quality);
        };
        attemptOptimization(0.85);
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const processCurrentActive = async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    const blob = await getOptimizedBlob(activeImage.dataUrl, mode, croppedAreaPixels, activeImage.adjustments);
    if (blob) {
      updateImageBlob(activeIndex, blob);
    }
    setIsProcessing(false);
  };

  const handleSendToPhotocard = async () => {
    if (!activeImage || !onSendToPhotocard) return;
    setIsProcessing(true);
    
    try {
      const blob = await getOptimizedBlob(activeImage.dataUrl, mode, croppedAreaPixels, activeImage.adjustments);
      if (blob) {
         const reader = new FileReader();
         reader.readAsDataURL(blob);
         reader.onloadend = () => {
            const dataUrl = reader.result as string;
            onSendToPhotocard(dataUrl);
            setIsProcessing(false);
         };
         return;
      }
    } catch(e) {
      console.error(e);
    }
    
    setIsProcessing(false);
  };

  const processAllPending = async () => {
    setIsProcessingAll(true);
    for (let i = 0; i < images.length; i++) {
       if (!images[i].optimizedBlob) {
         const blob = await getOptimizedBlob(images[i].dataUrl, 'blur', null, images[i].adjustments);
         if (blob) {
            updateImageBlob(i, blob);
         }
       }
    }
    setIsProcessingAll(false);
  };

  const updateImageBlob = (index: number, blob: Blob) => {
    setImages(prev => {
      const copy = [...prev];
      copy[index] = {
         ...copy[index],
         optimizedBlob: blob,
         optimizedSize: blob.size,
         optimizedUrl: URL.createObjectURL(blob),
      };
      return copy;
    });
  };

  const getNewFileName = (original: string) => {
    const nameWithoutExt = original.substring(0, original.lastIndexOf('.')) || original;
    return `${nameWithoutExt}.webp`;
  };

  const downloadCurrent = () => {
    if (!activeImage?.optimizedUrl) return;
    const a = document.createElement('a');
    a.href = activeImage.optimizedUrl;
    a.download = getNewFileName(activeImage.originalName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllAsZip = async () => {
    const optimizedImages = images.filter(img => img.optimizedBlob);
    
    if (optimizedImages.length === 1) {
       const img = optimizedImages[0];
       const url = URL.createObjectURL(img.optimizedBlob!);
       const a = document.createElement('a');
       a.href = url;
       a.download = getNewFileName(img.originalName);
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       return;
    }

    const zip = new JSZip();
    optimizedImages.forEach(img => {
       zip.file(getNewFileName(img.originalName), img.optimizedBlob!);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-featured-images-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (images.length === 0) {
    return (
      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#DCDCCF] rounded-3xl p-12 bg-[#FBFBF8] hover:bg-[#F5F5F0] transition-colors cursor-pointer w-full h-full block">
        <input type="file" multiple className="hidden" accept="image/jpeg, image/png, image/webp" onChange={onFileChange} />
        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-[#5A5A40] shadow-sm mb-4">
          <Upload size={28} />
        </div>
        <h3 className="font-serif text-xl text-[#2C2C24] mb-2 text-center">আপনার ছবি একসাথে আপলোড করুন</h3>
        <p className="text-[#8A8A78] text-sm text-center max-w-sm">
          একাধিক ছবি সিলেক্ট করতে পারবেন। ছবির মূল নাম ঠিক রেখেই WebP ফর্মেটে অপ্টিমাইজ করা হবে।
        </p>
      </label>
    );
  }

  return (
    <div className="flex-1 flex flex-col sm:flex-row h-full min-h-[500px] gap-6">
      {/* Left Sidebar: Thumbnail List */}
      <div className="w-full sm:w-64 bg-white rounded-[24px] border border-[#DCDCCF] flex flex-col overflow-hidden shrink-0 h-48 sm:h-auto">
         <div className="p-4 border-b border-[#F0F0E8] bg-[#FBFBF8] flex justify-between items-center">
            <span className="font-bold text-[#434338] text-sm flex items-center gap-2"><Layers size={16}/> আপলোড করা ছবি ({images.length})</span>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {images.map((img, i) => (
              <div 
                key={img.id} 
                className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all cursor-pointer group ${!isCollageMode && activeIndex === i ? 'border-[#5A5A40] bg-[#F5F5F0]' : isCollageMode && collageSelection.includes(i) ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-[#FBFBF8]'}`}
                onClick={() => isCollageMode ? toggleCollageSelection(i) : setActiveIndex(i)}
              >
                 <div className="w-12 h-12 rounded-lg bg-black shrink-0 overflow-hidden relative">
                    <img src={img.dataUrl} className="w-full h-full object-cover opacity-80" alt={img.originalName} />
                    {img.optimizedUrl && !isCollageMode && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                         <CheckCircle size={16} className="text-white drop-shadow-md" />
                      </div>
                    )}
                    {isCollageMode && collageSelection.includes(i) && (
                      <div className="absolute inset-0 bg-orange-500/80 flex items-center justify-center">
                         <span className="text-white font-bold text-xs">{collageSelection.indexOf(i) + 1}</span>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#434338] truncate">{img.originalName}</p>
                    <p className="text-[10px] text-[#A1A18E]">{(img.originalSize / 1024).toFixed(1)} KB</p>
                 </div>
                 {!isCollageMode && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                     className="p-1.5 text-[#A1A18E] hover:text-red-500 hover:bg-red-50 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-all shrink-0"
                   >
                     <Trash2 size={14} />
                   </button>
                 )}
              </div>
            ))}
         </div>
         <div className="p-3 border-t border-[#F0F0E8] bg-[#FBFBF8] flex flex-col gap-2 shrink-0">
            <button
               onClick={() => {
                 setIsCollageMode(!isCollageMode);
                 setCollageSelection([]);
               }}
               className={`w-full py-2 border rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 ${isCollageMode ? 'bg-[#5A5A40] text-white border-[#5A5A40]' : 'bg-white border-[#DCDCCF] hover:bg-[#F5F5F0]'}`}
            >
               <PlusSquare size={14} /> {isCollageMode ? 'কলেজ মোড বন্ধ করুন' : 'ছবি জোড়া লাগান (Collage)'}
            </button>
            <label className="w-full py-2 bg-white border border-[#DCDCCF] rounded-xl text-xs font-medium hover:bg-[#F5F5F0] transition-colors text-center cursor-pointer block">
               <input type="file" multiple className="hidden" accept="image/jpeg, image/png, image/webp" onChange={onFileChange} />
               + আরও ছবি যুক্ত করুন
            </label>
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 bg-white rounded-[24px] border border-[#DCDCCF] overflow-hidden flex flex-col min-w-0">
         {isCollageMode ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#FBFBF8] items-center justify-center">
               <div className="text-center mb-8 max-w-lg">
                 <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-[#5A5A40] shadow-sm mb-4">
                   <Layers size={28} />
                 </div>
                 <h2 className="text-2xl font-bold text-[#2C2C24]">ছবি জোড়া লাগান</h2>
                 <p className="text-sm text-[#8A8A78] mt-2">বাম পাশের তালিকা থেকে অন্তত ২ থেকে ৪টি ছবি নির্বাচন করুন। ক্রমানুযায়ী ছবিগুলো সাজানো হবে।</p>
               </div>
               
               {collageSelection.length > 0 ? (
                 <div className="bg-white p-6 rounded-3xl border border-[#DCDCCF] shadow-sm max-w-md w-full">
                    <h3 className="text-sm font-bold text-[#434338] mb-4 text-center">কীভাবে জোড়া লাগাতে চান?</h3>
                    <div className="flex gap-4 justify-center mb-6">
                      <button onClick={() => setCollageDirection('horizontal')} className={`flex-1 py-4 px-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${collageDirection === 'horizontal' ? 'border-[#5A5A40] bg-[#F5F5F0]' : 'border-[#F0F0E8] hover:bg-[#FBFBF8]'}`}>
                        <ArrowRight size={24} className="text-[#5A5A40]" />
                        <span className="text-xs font-bold text-[#5A5A40]">পাশাপাশি</span>
                      </button>
                      <button onClick={() => setCollageDirection('vertical')} className={`flex-1 py-4 px-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${collageDirection === 'vertical' ? 'border-[#5A5A40] bg-[#F5F5F0]' : 'border-[#F0F0E8] hover:bg-[#FBFBF8]'}`}>
                        <ArrowDown size={24} className="text-[#5A5A40]" />
                        <span className="text-xs font-bold text-[#5A5A40]">উপরে নিচে</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={handleCreateCollage}
                      disabled={isProcessing || collageSelection.length < 2}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <PlusSquare size={18} />}
                      {collageSelection.length < 2 ? 'অন্তত ২টি ছবি নির্বাচন করুন' : 'সংযুক্ত করুন'}
                    </button>
                 </div>
               ) : (
                 <div className="text-center p-8 border-2 border-dashed border-[#DCDCCF] rounded-3xl text-[#A1A18E] max-w-md w-full bg-white">
                   <PlusSquare size={32} className="mx-auto mb-3 opacity-30" />
                   বাম পাশ থেকে ছবিতে ক্লিক করুন
                 </div>
               )}
            </div>
         ) : activeImage ? (
           <>
             {!activeImage.optimizedUrl ? (
               // Editor Mode
               <>
                 <div className="p-4 border-b border-[#F0F0E8] flex justify-between items-center bg-[#FBFBF8] overflow-x-auto">
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setMode('blur')} 
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${mode === 'blur' ? 'bg-[#5A5A40] text-white' : 'bg-[#E9E9DE] text-[#5A5A40] hover:bg-[#DCDCCF]'}`}
                      >
                        <Maximize size={14} /> ব্লার ব্যাকগ্রাউন্ড (Fit)
                      </button>
                      <button 
                        onClick={() => setMode('crop')} 
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${mode === 'crop' ? 'bg-[#5A5A40] text-white' : 'bg-[#E9E9DE] text-[#5A5A40] hover:bg-[#DCDCCF]'}`}
                      >
                        <Crop size={14} /> ইচ্ছামতো ক্রপ করুন
                      </button>
                      <button 
                        onClick={() => setMode('selective-blur')} 
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${mode === 'selective-blur' ? 'bg-[#5A5A40] text-white' : 'bg-[#E9E9DE] text-[#5A5A40] hover:bg-[#DCDCCF]'}`}
                      >
                        <Droplet size={14} /> নির্দিষ্ট অংশ ব্লার
                      </button>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => setShowAdjustments(!showAdjustments)} 
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${showAdjustments ? 'bg-[#5A5A40] text-white' : 'bg-[#E9E9DE] text-[#5A5A40] hover:bg-[#DCDCCF]'}`}
                      >
                        <SlidersHorizontal size={14} /> পলিশ/কালার
                      </button>
                    </div>
                 </div>
                 
                 {showAdjustments && (
                   <div className="bg-[#FBFBF8] p-4 border-b border-[#F0F0E8] flex flex-wrap gap-4 text-xs font-medium text-[#5A5A40] shrink-0">
                     <div className="flex-1 min-w-[120px]">
                       <label className="block mb-2 flex justify-between"><span>আলো (Brightness)</span> <span>{activeImage.adjustments.brightness}%</span></label>
                       <input type="range" min="0" max="200" value={activeImage.adjustments.brightness} onChange={(e) => updateAdjustment('brightness', Number(e.target.value))} className="w-full accent-[#5A5A40]" />
                     </div>
                     <div className="flex-1 min-w-[120px]">
                       <label className="block mb-2 flex justify-between"><span>কন্ট্রাস্ট (Contrast)</span> <span>{activeImage.adjustments.contrast}%</span></label>
                       <input type="range" min="0" max="200" value={activeImage.adjustments.contrast} onChange={(e) => updateAdjustment('contrast', Number(e.target.value))} className="w-full accent-[#5A5A40]" />
                     </div>
                     <div className="flex-1 min-w-[120px]">
                       <label className="block mb-2 flex justify-between"><span>রং (Saturation)</span> <span>{activeImage.adjustments.saturation}%</span></label>
                       <input type="range" min="0" max="200" value={activeImage.adjustments.saturation} onChange={(e) => updateAdjustment('saturation', Number(e.target.value))} className="w-full accent-[#5A5A40]" />
                     </div>
                     <div className="flex items-end gap-2">
                       <button onClick={() => { updateAdjustment('brightness', 108); updateAdjustment('contrast', 112); updateAdjustment('saturation', 115); }} className="px-3 py-1.5 bg-orange-500 text-white font-bold rounded-xl shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                         <Sparkles size={14} /> ম্যাজিক
                       </button>
                       <button onClick={() => { updateAdjustment('brightness', 100); updateAdjustment('contrast', 100); updateAdjustment('saturation', 100); }} className="px-3 py-1.5 bg-white border border-[#DCDCCF] rounded-xl shadow-sm hover:bg-[#F5F5F0] transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/50">
                         <Undo2 size={14} /> আনডু
                       </button>
                     </div>
                   </div>
                 )}

                 <div className="flex-1 relative bg-neutral-900 border-y border-[#F0F0E8] min-h-[250px]">
                    {mode === 'selective-blur' ? (
                      <FaceBlurTool 
                        imageUrl={activeImage.dataUrl} 
                        onSave={(newUrl) => {
                          setImages(prev => {
                            const copy = [...prev];
                            copy[activeIndex] = { ...copy[activeIndex], dataUrl: newUrl };
                            return copy;
                          });
                          setMode('blur');
                        }}
                        onCancel={() => setMode('blur')}
                      />
                    ) : mode === 'crop' ? (
                      <Cropper
                        image={activeImage.dataUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={ASPECT_RATIO}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{ mediaStyle: { filter: `brightness(${activeImage.adjustments.brightness}%) contrast(${activeImage.adjustments.contrast}%) saturate(${activeImage.adjustments.saturation}%)` } }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img src={activeImage.dataUrl} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ filter: `brightness(${activeImage.adjustments.brightness}%) contrast(${activeImage.adjustments.contrast}%) saturate(${activeImage.adjustments.saturation}%)` }} />
                      </div>
                    )}
                 </div>

                 {/* Action Bar */}
                 <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                       <button
                         onClick={processCurrentActive}
                         disabled={isProcessing}
                         className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                       >
                         {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                         প্রিভিউ ও অপ্টিমাইজ করুন
                       </button>
                       <button
                         onClick={handleSendToPhotocard}
                         disabled={isProcessing || !onSendToPhotocard}
                         className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                       >
                         {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                         ফটোকার্ডে পাঠান
                       </button>
                       {images.some(img => !img.optimizedUrl) && (
                         <button
                           onClick={processAllPending}
                           disabled={isProcessingAll}
                           className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#43432F] text-white rounded-full text-sm font-bold shadow-lg shadow-[#5A5A40]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                         >
                           {isProcessingAll ? <RefreshCw className="animate-spin" size={16} /> : <Layers size={16} />}
                           সবগুলো একসাথে Auto Filter (Fit) করুন
                         </button>
                       )}
                    </div>
                 </div>
               </>
             ) : (
               // Preview & Download Mode
               <div className="flex-1 flex flex-col h-full bg-[#F5F5F0] overflow-hidden">
                 <div className="p-4 border-b border-[#DCDCCF] flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
                    <h3 className="font-semibold text-[#2C2C24] text-sm truncate pr-4">{getNewFileName(activeImage.originalName)}</h3>
                    <div className="flex gap-2 shrink-0">
                       <button 
                         onClick={() => {
                            const resetList = [...images];
                            resetList[activeIndex] = { ...resetList[activeIndex], optimizedUrl: undefined, optimizedBlob: undefined };
                            setImages(resetList);
                         }}
                         className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#E9E9DE] text-[#5A5A40] hover:bg-[#DCDCCF] transition-colors flex items-center gap-1.5"
                       >
                         <RefreshCw size={14} /> আবার সম্পাদনা
                       </button>
                       <button
                         onClick={downloadCurrent}
                         className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                       >
                         <Download size={14} /> ডাউনলোড
                       </button>
                    </div>
                 </div>
                 
                 <div className="flex-1 p-4 sm:p-6 flex flex-col items-center overflow-y-auto">
                    <div className="max-w-[700px] w-full bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-[#DCDCCF]">
                      <img src={activeImage.optimizedUrl} alt="Optimized WebP" className="w-full h-auto rounded-xl" />
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center bg-white px-6 py-4 rounded-3xl border border-[#DCDCCF] shadow-sm shrink-0">
                       <div className="text-center">
                         <p className="text-[10px] text-[#A1A18E] uppercase tracking-wider mb-1">আগে ছিল (Original)</p>
                         <p className="text-sm font-bold text-[#8A8A78]">{(activeImage.originalSize / 1024).toFixed(1)} KB</p>
                       </div>
                       <div className="w-full h-px sm:w-px sm:h-8 bg-[#F0F0E8]"></div>
                       <div className="text-center">
                         <p className="text-[10px] text-green-600 uppercase tracking-wider mb-1">এখন হয়েছে (WebP)</p>
                         <p className="text-xl font-bold text-green-600">{activeImage.optimizedSize ? (activeImage.optimizedSize / 1024).toFixed(1) : '...'} KB</p>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      {images.filter(i => i.optimizedUrl).length > 0 && (
                         <button
                           onClick={downloadAllAsZip}
                           className="w-full sm:w-auto px-8 py-3 bg-[#5A5A40] hover:bg-[#43432F] text-white rounded-full text-sm font-bold shadow-xl shadow-[#5A5A40]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                         >
                           {images.filter(i => i.optimizedUrl).length > 1 ? (
                             <><FileArchive size={18} /> {images.filter(i => i.optimizedUrl).length}টি ফাইল একসাথে ZIP ডাউনলোড করুন</>
                           ) : (
                             <><Download size={18} /> ফাইলটি ডাউনলোড করুন</>
                           )}
                         </button>
                      )}
                      
                      {onSendToPhotocard && (
                         <button
                           onClick={() => {
                              if (activeImage?.optimizedBlob) {
                                 const reader = new FileReader();
                                 reader.readAsDataURL(activeImage.optimizedBlob);
                                 reader.onloadend = () => {
                                    onSendToPhotocard(reader.result as string);
                                 };
                              }
                           }}
                           className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                         >
                           <ArrowRight size={18} /> ফটোকার্ডে পাঠান
                         </button>
                      )}
                    </div>
                 </div>
               </div>
             )}
           </>
         ) : (
            <div className="flex-1 flex items-center justify-center text-[#8A8A78]">
               বাম পাশ থেকে একটি ছবি নির্বাচন করুন
            </div>
         )}
      </div>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
