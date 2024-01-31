import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/weather?alzghoulraghad15@gmail.com&city=Amman', {
          headers: {
            Authorization: token,
          },
        });
        setWeatherData(response.data);
      } catch (error) {
        console.error(error);
        
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Weather Page</h1>
      {weatherData && (
        <div>
          {weatherData.list.map((day, index) => (
            <div key={index}>
              <p>Date: {new Date(day.dt * 1000).toLocaleDateString()}</p>
              <p>Temperature: {day.main.temp} K</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherPage;