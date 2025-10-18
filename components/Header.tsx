import React from 'react';
import { LogoIcon, ArrowRightOnRectangleIcon, UserCircleIcon, EnvelopeIcon } from './Icons';
import { User } from '../types';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
    currentUser: User | null;
    onTitleClick: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
    onDmsClick: () => void;
    notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onTitleClick, onLogout, onProfileClick, onDmsClick, notificationCount }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50 shadow-md shadow-brand-neon/10">
      <div className="container mx-auto p-4 max-w-2xl flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onTitleClick}
        >
          <LogoIcon className="w-8 h-8 text-brand-neon group-hover:animate-pulse" />
          <h1 className="text-2xl font-bold tracking-wider text-brand-text group-hover:text-brand-neon transition-colors">
            Where's Up?
          </h1>
        </div>
        {currentUser && (
            <div className="flex items-center gap-4">
                 <LanguageSelector />
                 {currentUser.authType === 'registered' && (
                    <button onClick={onDmsClick} className="relative text-brand-text-secondary hover:text-white transition-colors">
                        <EnvelopeIcon className="w-8 h-8"/>
                        {notificationCount > 0 && (
                            <div className="absolute -top-1 -right-1 flex justify-center items-center h-5 w-5 rounded-full bg-brand-neon text-brand-primary text-xs font-bold">
                                {notificationCount}
                            </div>
                        )}
                    </button>
                 )}
                 <button onClick={onProfileClick} className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors relative">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full"/>
                    ) : (
                        <UserCircleIcon className="w-8 h-8"/>
                    )}
                    <span className="font-bold text-brand-text hidden sm:block">{currentUser.name}</span>
                 </button>
                <button onClick={onLogout} className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors text-sm font-semibold">
                    <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                    <span className="hidden sm:block">{t('logout', 'Logout')}</span>
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;