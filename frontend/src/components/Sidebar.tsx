import { Moon, Home, User, PenSquare, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'feed', label: 'Dream Feed', icon: Home },
    { id: 'myDreams', label: 'My Dreams', icon: PenSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 bg-white border-r border-purple-100 h-screen flex flex-col">
      <div className="p-6 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-purple-900">DreamCatcher</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-100">
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
