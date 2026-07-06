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

      {/* Content for SEO and AdSense */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-10 text-[#434338]">
        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-[#DCDCCF] shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-[#2C2C24]">Purbadhala PhotoCard Maker ও Image Optimizer সম্পর্কে</h2>
          <p className="mb-4 leading-relaxed">
            পূর্বধলার দর্পন স্টুডিও (Purbadhala PhotoCard Maker) হলো একটি প্রফেশনাল, নির্ভরযোগ্য এবং সহজে ব্যবহারযোগ্য অনলাইন টুল। সাংবাদিক, নিউজ পোর্টাল অ্যাডমিন, এবং কন্টেন্ট ক্রিয়েটরদের কথা মাথায় রেখে এই টুলটি ডিজাইন করা হয়েছে। এর মাধ্যমে আপনি খুব সহজেই যেকোনো খবরের জন্য দৃষ্টিনন্দন ফটোকার্ড বা নিউজ কার্ড তৈরি করতে পারবেন। 
          </p>
          
          <h3 className="text-lg font-bold mt-6 mb-3 text-[#2C2C24]">প্রধান ফিচারসমূহ (Key Features):</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-sm md:text-base">
            <li><strong>ইমেজ অপ্টিমাইজেশন (Image Optimization):</strong> যেকোনো সাইজের ছবি আপলোড করে ক্রপ করা, ব্রাইটনেস, কনট্রাস্ট ও স্যাচুরেশন ঠিক করার সুবিধা।</li>
            <li><strong>একাধিক ডিজাইন টেমপ্লেট:</strong> সাধারণ, ব্রেকিং নিউজ এবং স্পেশাল খবরের জন্য আলাদা আলাদা প্রফেশনাল ডিজাইন টেমপ্লেট।</li>
            <li><strong>সম্পূর্ণ কাস্টমাইজেশন:</strong> নিউজ পোর্টালের লোগো, বাংলা তারিখ, শিরোনাম এবং সোশ্যাল মিডিয়ার লিংক (ফেসবুক, ইউটিউব, ওয়েবসাইট) পরিবর্তনের সম্পূর্ণ স্বাধীনতা।</li>
            <li><strong>উচ্চ মানের ছবি এক্সপোর্ট:</strong> আপনার তৈরি করা কার্ডটি হাই-রেজুলেশনে ডাউনলোড করার সুবিধা।</li>
          </ul>

          <h3 className="text-lg font-bold mt-6 mb-3 text-[#2C2C24]">কীভাবে ব্যবহার করবেন? (How to Use)</h3>
          <ol className="list-decimal pl-6 mb-4 space-y-2 text-sm md:text-base">
            <li>প্রথমে <strong>"ইমেজ অপ্টিমাইজার"</strong> সেকশনে গিয়ে আপনার ছবিটি আপলোড করুন। ছবির প্রয়োজনীয় অংশ ক্রপ করুন এবং কালার ঠিক করে নিন।</li>
            <li>এরপর ছবিটিকে <strong>"ফটোকার্ডে পাঠান"</strong> বাটনে ক্লিক করে মূল মেকারে নিয়ে আসুন।</li>
            <li>ফটোকার্ড মেকার থেকে আপনার খবরের ধরন অনুযায়ী একটি <strong>ডিজাইন টেমপ্লেট</strong> নির্বাচন করুন।</li>
            <li>আপনার নিউজ পোর্টালের লোগো আপলোড করুন, খবরের শিরোনাম লিখুন এবং ফুটারের তথ্য দিন।</li>
            <li>সবশেষে নিচে থাকা <strong>"ফটোকার্ড ডাউনলোড করুন"</strong> বাটনে ক্লিক করে ছবিটি সেভ করুন এবং সোশ্যাল মিডিয়ায় শেয়ার করুন।</li>
          </ol>

          <p className="mt-6 text-sm text-[#8A8A78] italic border-t border-[#DCDCCF] pt-4">
            * এটি একটি সম্পূর্ণ ওয়েব-ভিত্তিক টুল। দ্রুত কাজ করার জন্য এবং খবরের সোশ্যাল মিডিয়া রিচ বাড়াতে পূর্বধলার দর্পন স্টুডিও আপনার নিত্যদিনের সঙ্গী হতে পারে।
          </p>
        </div>
      </section>

      {/* Bottom Bar Info */}
      <footer className="h-12 border-t border-[#DCDCCF] px-4 md:px-8 flex items-center justify-center text-xs text-[#8A8A78] shrink-0 bg-white">
        <div>
          &copy; {new Date().getFullYear()} <a href="https://pdonline.com.bd" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[#5A5A40] transition-colors">পূর্বধলার দর্পন</a> - সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
}
