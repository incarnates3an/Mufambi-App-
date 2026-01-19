
import React from 'react';
import { CreditCard, History, Map as MapIcon, Settings, TrendingUp, Briefcase, Star, LayoutGrid, Wallet } from 'lucide-react';
import { UserRole } from '../../types';

interface NavigationProps {
  role: UserRole;
  onSettingsClick: () => void;
  onWalletClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ role, onSettingsClick, onWalletClick }) => {
  const passengerLinks = [
    { icon: LayoutGrid, label: 'Node' },
    { icon: History, label: 'Rides' },
    { icon: Wallet, label: 'Wallet', isWallet: true },
    { icon: Settings, label: 'More', isSettings: true },
  ];

  const driverLinks = [
    { icon: TrendingUp, label: 'Income' },
    { icon: Briefcase, label: 'Requests' },
    { icon: Star, label: 'Profile', isSettings: true },
    { icon: Settings, label: 'Settings', isSettings: true },
  ];

  const links = role === UserRole.PASSENGER ? passengerLinks : driverLinks;

  const handleClick = (link: any) => {
    if (link.isSettings) onSettingsClick();
    else if (link.isWallet) onWalletClick();
  };

  return (
    <nav className="h-24 pb-6 bg-[#050505] border-t border-white/5 flex items-center justify-around px-4 z-50 fixed bottom-0 left-0 right-0">
      {links.map((link, i) => (
        <button 
          key={i} 
          onClick={() => handleClick(link)}
          className="flex flex-col items-center gap-1.5 group relative px-4"
        >
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${i === 0 ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'text-gray-500 group-hover:text-purple-400'}`}>
            <link.icon className="w-6 h-6" />
          </div>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${i === 0 ? 'text-purple-400' : 'text-gray-600 group-hover:text-purple-400'}`}>
            {link.label}
          </span>
          {i === 0 && <div className="absolute -top-1 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
