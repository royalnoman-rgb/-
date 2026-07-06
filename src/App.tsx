/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ImageOptimizer from './components/ImageOptimizer';
import PhotoCardMaker from './components/PhotoCardMaker';
import { Layers, Image as ImageIcon, Newspaper } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'photocard'>('optimizer');
  const [sharedImage, setSharedImage] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F0] text-[#434338] font-sans flex flex-col">
      {/* Header Section */}
      <header className="h-16 border-b border-[#DCDCCF] px-4 md:px-8 flex items-center justify-between bg-white text-[#2C2C24] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5A5A40] flex items-center justify-center text-white shrink-0 shadow-md">
            <Layers size={18} />
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight hidden sm:block">পূর্বধলার দর্পন স্টুডিও</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('optimizer')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'optimizer' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#8A8A78] hover:text-[#5A5A40]'}`}
          >
            <ImageIcon size={16} /> <span>ইমেজ অপ্টিমাইজার</span>
          </button>
          <button 
            onClick={() => setActiveTab('photocard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'photocard' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#8A8A78] hover:text-[#5A5A40]'}`}
          >
            <Newspaper size={16} /> <span>ফটোকার্ড মেকার</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex flex-col p-4 md:p-6 min-h-0">
        <section className="flex-1 max-w-7xl mx-auto w-full flex flex-col min-h-0 bg-white rounded-[24px] sm:rounded-[32px] border border-[#DCDCCF] shadow-sm overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'optimizer' ? <ImageOptimizer onSendToPhotocard={(url) => { setSharedImage(url); setActiveTab('photocard'); }} /> : <PhotoCardMaker sharedImage={sharedImage} />}
          </div>
        </section>
      </main>

      {/* Bottom Bar Info */}
      <footer className="h-12 border-t border-[#DCDCCF] px-4 md:px-8 flex items-center justify-center text-xs text-[#8A8A78] shrink-0 bg-white">
        <div>
          &copy; {new Date().getFullYear()} <strong>পূর্বধলার দর্পন</strong> - সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
}
