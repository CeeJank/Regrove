import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCases } from '../../contexts/CasesContext';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onSelect: (childId: string, childName: string) => void;
  placeholder?: string;
}

const ChildSearchBar: React.FC<Props> = ({ onSelect, placeholder = 'Search for a child...' }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { allChildren } = useCases();
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length >= 1
    ? Object.entries(allChildren).filter(([, c]) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="search-wrap" ref={ref}>
      <div className="search-input-wrap">
        <MagnifyingGlassIcon className="search-icon" />
        <input
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map(([id, child]) => (
            <div key={id} className="search-result-row" onClick={() => {
              onSelect(id, child.name);
              setQuery('');
              setOpen(false);
            }}>
              <div className="search-avatar">{child.name[0]}</div>
              <div>
                <p className="search-result-name">{child.name}</p>
                <p className="search-result-sub">{child.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildSearchBar;