import React, { useState } from 'react';
import Header from './components/Header';
import BuyTab from './components/BuyTab';
import KeygenTab from './components/KeygenTab';
import ProfileTab from './components/ProfileTab';

const INITIAL_USER = {
  uid: 1,
  username: 'morphezy', 
  role: 'owner', 
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
  subscription: 'Lifetime (Unlimited)',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('buy');
  const [currentUser] = useState(INITIAL_USER);

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-gray-300 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {activeTab === 'buy' && <BuyTab />}
        {activeTab === 'keygen' && <KeygenTab currentUser={currentUser} />}
        {activeTab === 'profile' && <ProfileTab currentUser={currentUser} />}
        {activeTab === 'admin' && (
          <div className="max-w-3xl mx-auto bg-[#12131a] border border-amber-500/30 p-6 rounded-2xl text-xs flex justify-between items-center">
            <div>
              <span className="font-mono text-amber-400 font-bold mr-2">UID #{currentUser.uid}</span>
              <span className="text-white font-bold">{currentUser.username}</span>
            </div>
            <span className="text-amber-400 font-bold">Full Owner Root Access</span>
          </div>
        )}
      </main>
    </div>
  );
}