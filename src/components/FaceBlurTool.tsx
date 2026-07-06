import React, { useState, useRef, useEffect } from 'react';
import { Undo2, CheckCircle, RefreshCw } from 'lucide-react';

interface FaceBlurToolProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onCancel: () => void;
}

export default function FaceBlurTool({ imageUrl, onSave, onCancel }: FaceBlurToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(8);
  
  // Offscreen canvas for storing strokes
  const maskCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      maskCanvasRef.current.width = img.width;
      maskCanvasRef.current.height = img.height;
      redraw(img, maskCanvasRef.current);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const redraw = (img: HTMLImageElement, maskCanvas: HTMLCanvasElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fit container while maintaining aspect ratio
    const container = containerRef.current;
    if (!container) return;

    const ratio = img.width / img.height;
    let renderWidth = container.clientWidth;
    let renderHeight = renderWidth / ratio;

    if (renderHeight > container.clientHeight) {
      renderHeight = container.clientHeight;
      renderWidth = renderHeight * ratio;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    // Draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw blurred version masked by strokes
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offCtx = offscreenCanvas.getContext('2d');
    if (offCtx) {
      // Draw blurred image
      offCtx.filter = `blur(${blurIntensity}px)`;
      offCtx.drawImage(img, 0, 0);
      
      // Apply mask
      offCtx.filter = 'none';
      offCtx.globalCompositeOperation = 'destination-in';
      offCtx.drawImage(maskCanvas, 0, 0);
      
      ctx.drawImage(offscreenCanvas, 0, 0);
    }
  };

  useEffect(() => {
    if (image) {
      redraw(image, maskCanvasRef.current);
    }
  }, [blurIntensity]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (mCtx) {
      mCtx.beginPath();
      mCtx.moveTo(x, y);
      mCtx.lineCap = 'round';
      mCtx.lineJoin = 'round';
      mCtx.lineWidth = Math.max(maskCanvasRef.current.width * 0.05, 40); // responsive brush size
      mCtx.strokeStyle = 'black';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !image) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (mCtx) {
      mCtx.lineTo(x, y);
      mCtx.stroke();
      redraw(image, maskCanvasRef.current);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (mCtx && image) {
      mCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      redraw(image, maskCanvasRef.current);
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    // get high res dataURL from canvas
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 1.0);
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white absolute inset-0 z-50 rounded-[24px] overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1a1a1a]">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h3 className="font-bold text-sm whitespace-nowrap">অংশ ব্লার করুন</h3>
          <div className="flex items-center gap-2 flex-1 sm:w-48 bg-gray-800 px-3 py-1.5 rounded-full">
            <span className="text-xs text-gray-400">ব্লার:</span>
            <input 
              type="range" 
              min="2" 
              max="30" 
              value={blurIntensity} 
              onChange={(e) => setBlurIntensity(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={clearMask}
            className="px-4 py-2 rounded-full text-xs font-medium bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Undo2 size={14} /> রিসেট
          </button>
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs font-medium bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            বাতিল
          </button>
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="px-4 py-2 rounded-full text-xs font-medium bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
            প্রয়োগ করুন
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-[#0a0a0a]" ref={containerRef}>
        <div className="text-center absolute top-4 left-0 right-0 pointer-events-none z-10 text-gray-400 text-sm drop-shadow-md">
          মাউস দিয়ে চেপে ধরে ছবির যে অংশে ঘষবেন, সে অংশ ব্লার হবে
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair shadow-2xl rounded-lg touch-none max-w-full max-h-full"
        />
      </div>
    </div>
  );
}
