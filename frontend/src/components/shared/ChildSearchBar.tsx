import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { fetchAllChildren, type ChildProfile } from '../../services/childService';

interface Props {
  onSelect: (childId: string, childName: string) => void;
  placeholder?: string;
}

const ChildSearchBar: React.FC<Props> = ({ onSelect, placeholder = 'Search for a child...' }) => {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllChildren().then(setChildren).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = query.length >= 1
    ? children.filter((c) => c.full_name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="search-wrap" ref={ref}>
      <div className="search-input-wrap">
        <MagnifyingGlassIcon className="search-icon" />
        <input
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((c) => (
            <div
              key={c.id}
              className="search-result-row"
              onClick={() => {
                onSelect(String(c.id), c.full_name);
                setQuery('');
                setOpen(false);
              }}
            >
              <div className="search-avatar">{c.full_name[0]}</div>
              <div>
                <p className="search-result-name">{c.full_name}</p>
                <p className="search-result-sub">{c.school ?? c.category ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildSearchBar;
