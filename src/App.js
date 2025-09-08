import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [reversedDateTime, setReversedDateTime] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  const getReverseDateTime = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    
    const reversedMonth = month.split('').reverse().join('');
    const reversedDay = day.split('').reverse().join('');
    const reversedHours = hours.split('').reverse().join('');
    
    return reversedMonth + reversedDay + reversedHours;
  };

  const getTimeUntilNextHour = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    
    const diffMs = nextHour - now;
    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const updateDateTime = () => {
      const newPin = getReverseDateTime();
      const newTimeRemaining = getTimeUntilNextHour();
      
      setReversedDateTime(newPin);
      setTimeRemaining(newTimeRemaining);
      
      // Check if we've reached a new hour (timer shows 59:59 or 00:00)
      if (newTimeRemaining === '59:59' || newTimeRemaining === '00:00') {
        // Force recalculation of PIN for new hour
        setTimeout(() => {
          setReversedDateTime(getReverseDateTime());
          setTimeRemaining(getTimeUntilNextHour());
        }, 100);
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ fontSize: '28px', margin: '20px', color: '#61dafb' }}>
          Service PIN WMF Maschine
        </h1>
        <div style={{ fontSize: '24px', margin: '20px', color: '#61dafb' }}>
          {reversedDateTime}
        </div>
        <div style={{ fontSize: '18px', margin: '10px', color: '#ffffff' }}>
          Valid for: {timeRemaining}
        </div>
      </header>
    </div>
  );
}

export default App;
