import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search } from 'lucide-react';
import './SearchWidget.css';

export default function SearchWidget() {
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('Lucknow');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  
  // Autocomplete State
  const [originResults, setOriginResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const navigate = useNavigate();

  // Refs for click-outside logic
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search for Origin
  useEffect(() => {
    if (origin.length < 1) {
      setOriginResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stations/search?q=${origin}`);
        if (res.ok) {
          const data = await res.json();
          setOriginResults(data);
        }
      } catch (err) {
        console.error("Failed to fetch origin stations");
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [origin]);

  // Debounced Search for Destination
  useEffect(() => {
    if (destination.length < 1) {
      setDestResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stations/search?q=${destination}`);
        if (res.ok) {
          const data = await res.json();
          setDestResults(data);
        }
      } catch (err) {
        console.error("Failed to fetch dest stations");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (origin.toLowerCase().trim() === destination.toLowerCase().trim()) {
      setError('Origin and Destination stations cannot be the exact same.');
      return;
    }
    setError('');
    navigate(`/results?origin=${origin}&destination=${destination}&date=${date}`);
  };

  return (
    <div className="search-widget glass-panel">
      <form onSubmit={handleSearch} className="search-form">
        {error && <div className="search-error" style={{ width: '100%', color: '#ef4444', textAlign: 'center', marginBottom: '15px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontWeight: 'bold', gridColumn: '1 / -1' }}>{error}</div>}
        
        {/* Origin Field */}
        <div className="input-group" ref={originRef}>
          <MapPin className="input-icon" size={20} />
          <div className="input-field">
            <label>From</label>
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => { 
                setOrigin(e.target.value); 
                setError(''); 
                setShowOriginDropdown(true);
              }} 
              onFocus={() => {
                if (origin.length > 0) setShowOriginDropdown(true);
              }}
              placeholder="Origin Station"
              required
              autoComplete="off"
            />
          </div>
          
          {/* Origin Autocomplete Dropdown */}
          {showOriginDropdown && originResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {originResults.map((station, idx) => (
                <div 
                  key={idx} 
                  className="autocomplete-item"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents input from losing focus immediately
                    setOrigin(station.stationName);
                    setShowOriginDropdown(false);
                  }}
                >
                  <span className="station-name">{station.stationName} ({station.stationCode})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="divider"></div>

        {/* Destination Field */}
        <div className="input-group" ref={destRef}>
          <MapPin className="input-icon" size={20} />
          <div className="input-field">
            <label>To</label>
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => { 
                setDestination(e.target.value); 
                setError(''); 
                setShowDestDropdown(true);
              }} 
              onFocus={() => {
                if (destination.length > 0) setShowDestDropdown(true);
              }}
              placeholder="Destination Station"
              required
              autoComplete="off"
            />
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestDropdown && destResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {destResults.map((station, idx) => (
                <div 
                  key={idx} 
                  className="autocomplete-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDestination(station.stationName);
                    setShowDestDropdown(false);
                  }}
                >
                  <span className="station-name">{station.stationName} ({station.stationCode})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider"></div>

        <div className="input-group">
          <Calendar className="input-icon" size={20} />
          <div className="input-field">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              min={today}
              onChange={(e) => setDate(e.target.value)} 
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary search-btn">
          <Search size={20} />
          Find Trains
        </button>
      </form>
    </div>
  );
}
