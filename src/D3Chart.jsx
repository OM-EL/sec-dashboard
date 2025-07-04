import { useEffect, useRef } from 'react';
import { SecurityScoreRace } from './SecurityScoreRace';

const D3Chart = ({ data, autoPlay = false }) => {
  const chartRef = useRef(null);
  const raceChartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      // Initialize the D3 chart
      raceChartRef.current = new SecurityScoreRace(chartRef.current, data);
      
      if (autoPlay) {
        // Start animation automatically
        raceChartRef.current.animate(data);
      } else {
        // Show the first frame
        const firstDate = data[0].date;
        const firstFrameData = data.filter(d => d.date === firstDate);
        raceChartRef.current.updateChart(firstFrameData);
      }
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, [data, autoPlay]);

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default D3Chart;
