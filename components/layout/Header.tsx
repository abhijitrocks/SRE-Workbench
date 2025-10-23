
import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, UserRole } from '../../types';

interface HeaderProps {
  user: User;
  zone: Zone;
  zones: Zone[];
  onZoneChange: (zone: Zone) => void;
  onSwitchUser: () => void;
  onNavigateHome: () => void;
  isDashboardView: boolean;
  activeWorkbench: 'olympus-hub-saas' | 'next-orbit-saas' | null;
}

const OpsCenterLogo = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
        {/* Dark Blue Shape */}
        <path d="M22.9416 5.14355C25.9221 6.11183 28.3882 8.57791 29.3564 11.5584C30.292 14.4363 29.6534 17.6186 27.653 19.9987C28.5218 22.9531 27.7538 26.2483 25.6843 28.3177C23.6149 30.3871 20.3197 31.1552 17.3653 30.2864C14.4109 29.4175 11.4939 30.015 9.11379 28.0146C6.73371 26.0142 6.13619 23.0972 7.00504 20.1428C6.13619 17.1883 6.90423 13.8931 8.97368 11.8237C11.0431 9.75425 14.3383 8.98621 17.2928 9.85506C18.261 6.87458 20.6276 4.4085 22.9416 5.14355Z" fill="#3A4D8F"/>
        {/* Pink Shape */}
        <path d="M28.4111 20.9167C29.8333 21.5057 30.9023 22.8278 31.3368 24.3822C31.758 25.8829 31.4283 27.5253 30.4504 28.7891C30.8394 30.2253 30.5097 31.7897 29.5418 32.9645C28.5739 34.1393 27.0195 34.6338 25.6833 34.1993C24.3472 33.7648 22.8129 34.0438 21.6381 33.1759C20.4633 32.308 20.1336 30.8718 20.4731 29.5357C20.1336 28.1995 20.4026 26.7433 21.2705 25.5685C22.1384 24.3937 23.4605 23.8592 24.8827 24.2837C25.4717 22.8615 26.8828 21.7925 28.4111 20.9167Z" fill="#EC4899"/>
    </svg>
);

const GlobeIcon = ({ className = "h-5 w-5 text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500 ml-2"><path d="m6 9 6 6 6-6"></path></svg>
);

const Header: React.FC<HeaderProps> = ({ user, zone, zones, onZoneChange, onSwitchUser, onNavigateHome, isDashboardView, activeWorkbench }) => {
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [zoneSearch, setZoneSearch] = useState('');
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) {
        setIsZoneOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const workbenchTitle = activeWorkbench === 'next-orbit-saas' ? 'Next Orbit SaaS' : 'Olympus Hub SaaS';

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div>
        {isDashboardView ? (
          <div className="flex items-center space-x-2">
              <button onClick={onNavigateHome} className="text-xl font-semibold text-slate-500 hover:text-slate-800 transition-colors">OPS Center</button>
              <span className="text-xl text-slate-400">/</span>
              <h1 className="text-xl font-semibold text-slate-800">{workbenchTitle} <span className="text-sm font-normal text-sky-600 ml-2">Workbench</span></h1>
          </div>
        ) : (
          <div className="flex items-center">
            <OpsCenterLogo />
            <span className="text-xl font-semibold text-slate-800 tracking-wider">OPERATIONS CENTER</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={zoneRef}>
          <button onClick={() => setIsZoneOpen(!isZoneOpen)} className="flex items-center bg-slate-100 hover:bg-slate-200 rounded-md px-3 py-2 text-sm font-medium transition-colors">
            <GlobeIcon />
            <span className="ml-2 text-slate-700">{zone.name}</span>
            <ChevronDownIcon />
          </button>
          {isZoneOpen && (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="p-2 border-b border-slate-200">
                <input
                  type="text"
                  placeholder="Search zones..."
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 text-center">Select a Zone to continue.</p>
              </div>
              <div className="py-1 max-h-60 overflow-y-auto">
                {filteredZones.map((z) => (
                  <a
                    key={z.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onZoneChange(z);
                      setIsZoneOpen(false);
                      setZoneSearch('');
                    }}
                    className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100 flex items-center"
                  >
                    <GlobeIcon className="h-5 w-5 text-teal-600" />
                    <span className="ml-3">{z.name}</span>
                  </a>
                ))}
                {filteredZones.length === 0 && (
                  <p className="text-slate-500 text-center text-sm py-2">No zones found.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
            <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full" />
            <div>
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-sky-600">
                    {user.role === UserRole.SAAS_SRE && user.saas ? user.saas : user.role}
                </p>
            </div>
            <button onClick={onSwitchUser} title="Switch User Persona" className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold py-1 px-2 rounded">Switch</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
