import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  const [pinData, setPinData] = useState({ pin: '', timeRemaining: '' });
  const [error, setError] = useState('');
  const [localTimeRemaining, setLocalTimeRemaining] = useState(0);
  const pinExpirationRef = useRef(null);

  const parseTimeRemaining = (timeString) => {
    if (!timeString) return 0;
    
    // Handle MM:SS format from backend
    const colonMatch = timeString.match(/^(\d+):(\d+)$/);
    if (colonMatch) {
      const minutes = parseInt(colonMatch[1], 10);
      const seconds = parseInt(colonMatch[2], 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchPinData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/pin`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PIN data');
      }
      
      const data = await response.json();
      const timeInSeconds = parseTimeRemaining(data.timeRemaining);
      
      setPinData({ pin: data.pin, timeRemaining: data.timeRemaining });
      setLocalTimeRemaining(timeInSeconds);
      setError('');
      
      // Set expiration time for local countdown
      pinExpirationRef.current = Date.now() + (timeInSeconds * 1000);
    } catch (err) {
      setError('Failed to load PIN data');
      console.error('Error fetching PIN:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPinData();
    
    // Update countdown every second
    const interval = setInterval(() => {
      if (pinExpirationRef.current) {
        const remaining = Math.max(0, Math.ceil((pinExpirationRef.current - Date.now()) / 1000));
        setLocalTimeRemaining(remaining);
        
        // Update display with local countdown
        setPinData(prev => ({
          ...prev,
          timeRemaining: formatTimeRemaining(remaining)
        }));
        
        // Fetch new PIN only when expired
        if (remaining <= 0 && pinData.pin) {
          fetchPinData();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pinData.pin]);

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ fontSize: '28px', margin: '20px', color: '#61dafb' }}>
          Service PIN WMF Maschine
        </h1>
        {error ? (
          <div style={{ fontSize: '18px', margin: '20px', color: '#ff6b6b' }}>
            {error}
          </div>
        ) : (
          <>
            <div style={{ fontSize: '24px', margin: '20px', color: '#61dafb' }}>
              {pinData.pin}
            </div>
            <div style={{ fontSize: '18px', margin: '10px', color: '#ffffff' }}>
              Valid for: {pinData.timeRemaining}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
