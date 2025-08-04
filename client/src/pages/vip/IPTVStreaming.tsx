import React from 'react';
import TierGuard from '@/components/access/TierGuard';
import IPTVModule from '@/components/IPTVModule';

export default function IPTVStreaming() {
  return (
    <TierGuard requiredTier="vip" feature="IPTV Live TV Streaming">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP IPTV Streaming</h1>
            <p className="text-xl text-gray-300">
              Premium live TV channels with sports, news, and entertainment
            </p>
          </div>
          
          <IPTVModule />
        </div>
      </div>
    </TierGuard>
  );
}