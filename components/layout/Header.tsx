
import React, { useState, useRef, useEffect } from 'react';
import { User, Zone, Tenant, UserRole } from '../../types';

interface HeaderProps {
  user: User;
  zone: Zone;
  zones: Zone[];
  onZoneChange: (zone: Zone) => void;
  tenant: Tenant;
  tenants: Tenant[];
  onTenantChange: (tenant: Tenant) => void;
  onNavigateHome: () => void;
  activeWorkbench: 'olympus-hub-saas' | 'next-orbit-saas' | null;
}

const TenantIcon = ({ className = "h-5 w-5 text-slate-500" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="8" height="16" rx="1" />
      <rect x="12" y="9" width="8" height="11" rx="1" />
      <path d="M8 8h.01" /><path d="M8 12h.01" /><path d="M8 16h.01" />
      <path d="M16 13h.01" /><path d="M16 17h.01" />
    </svg>
);

const GlobeIcon = ({ className = "h-5 w-5 text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500 ml-2"><path d="m6 9 6 6 6-6"></path></svg>
);

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M20 6 9 17l-5-5"></path></svg>;

const Header: React.FC<HeaderProps> = ({ user, zone, zones, onZoneChange, tenant, tenants, onTenantChange, onNavigateHome, activeWorkbench }) => {
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [zoneSearch, setZoneSearch] = useState('');
  const zoneRef = useRef<HTMLDivElement>(null);
  const tenantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) {
        setIsZoneOpen(false);
      }
      if (tenantRef.current && !tenantRef.current.contains(event.target as Node)) {
        setIsTenantOpen(false);
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
        <div className="flex items-center space-x-2">
            <button onClick={onNavigateHome} className="text-xl font-semibold text-slate-500 hover:text-slate-800 transition-colors">OPS Center</button>
            <span className="text-xl text-slate-400">/</span>
            <h1 className="text-xl font-semibold text-slate-800">{workbenchTitle} <span className="text-sm font-normal text-sky-600 ml-2">Workbench</span></h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Tenant Dropdown */}
        <div className="relative" ref={tenantRef}>
          <button onClick={() => setIsTenantOpen(!isTenantOpen)} className="flex items-center hover:bg-slate-100 rounded-md p-1 text-sm font-medium transition-colors">
            <TenantIcon className="h-6 w-6 text-slate-500" />
            <div className="ml-2 text-left">
              <div className="text-xs text-slate-400 uppercase">Tenant Account</div>
              <span className="text-slate-700">{tenant.name}</span>
            </div>
            <ChevronDownIcon />
          </button>
          {isTenantOpen && (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                {tenants.map((t) => (
                  <a
                    key={t.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onTenantChange(t);
                      setIsTenantOpen(false);
                    }}
                    className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                        <TenantIcon className="h-5 w-5 text-slate-600" />
                        <span className="ml-3">{t.name}</span>
                    </div>
                    {tenant.id === t.id && <CheckIcon />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone Dropdown */}
        <div className="relative" ref={zoneRef}>
          <button onClick={() => setIsZoneOpen(!isZoneOpen)} className="flex items-center hover:bg-slate-100 rounded-md p-1 text-sm font-medium transition-colors">
            <GlobeIcon className="h-6 w-6 text-slate-500"/>
            <div className="ml-2 text-left">
              <div className="text-xs text-slate-400 uppercase">Zone</div>
              <span className="text-slate-700">{zone.name}</span>
            </div>
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
        </div>
      </div>
    </header>
  );
};

export default Header;