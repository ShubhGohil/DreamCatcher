import { useState } from 'react';
import Sidebar from './Sidebar';
import DreamFeed from './DreamFeed';
import MyDreams from './MyDreams';
import Analytics from './Analytics';
import Profile from './Profile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'feed' && <DreamFeed />}
          {activeTab === 'myDreams' && <MyDreams />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </main>
    </div>
  );
}
