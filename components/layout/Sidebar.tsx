
import React from 'react';

const sidebarSections = [
  {
    title: 'Tasks',
    items: ['My Tasks', 'Unassigned Tasks', 'In Progress Tasks', 'Completed Tasks'],
  },
  {
    title: 'Requests',
    items: ['Customer Service Requests', 'Business Requests', 'System Requests'],
  },
  {
    title: 'Console',
    items: ['File Processing', 'Exceptions'],
  },
];

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"></path></svg>
);

interface NavItemProps {
  name: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ name, active, onClick }) => {
  const baseClasses = "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClasses = "bg-slate-800 text-white";
  const inactiveClasses = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      <span>{name}</span>
    </a>
  );
};

interface SidebarProps {
  onNavigate: () => void;
  activeConsole: string;
  onConsoleChange: (consoleName: string) => void;
  activeWorkbench: 'olympus-hub-saas' | 'next-orbit-saas' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeConsole, onConsoleChange, activeWorkbench }) => {
  const workbenchTitle = activeWorkbench === 'next-orbit-saas' ? 'Next Orbit SaaS' : 'Olympus Hub SaaS';

  return (
    <nav className="hidden md:flex flex-col w-64 bg-slate-900 p-2">
      <div 
        onClick={onNavigate}
        className="flex items-center justify-between p-3 mb-4 rounded-md cursor-pointer hover:bg-slate-800 transition-colors"
      >
        <span className="text-md font-bold text-white">{workbenchTitle}</span>
        <ChevronDownIcon />
      </div>
      
      <ul className="space-y-6 flex-1">
        {sidebarSections.map((section) => (
          <li key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map(item => (
                <li key={item}>
                   <NavItem 
                     name={item} 
                     active={section.title === 'Console' ? item === activeConsole : false} 
                     onClick={() => {
                        if (section.title === 'Console') {
                          onConsoleChange(item);
                        }
                     }}
                   />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
