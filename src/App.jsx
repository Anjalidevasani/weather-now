import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  async function getWeather() {
    if (!city) {
      alert("Please enter a city or country!");
      return;
    }
    fetchWeatherByCity(city);
  }

  function getWeatherByLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setError("⚠️ Unable to retrieve your location.");
      }
    );
  }

  async function fetchWeatherByCity(cityName) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setWeather(null);
        setError("❌ City not found!");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      await fetchWeatherByCoords(latitude, longitude, `${name}, ${country}`);
    } catch (err) {
      console.error(err);
      setError("⚠️ Error fetching weather!");
      setWeather(null);
    }
  }

  async function fetchWeatherByCoords(latitude, longitude, cityName = "Your Location") {
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setError("");
      setWeather({
        city: cityName,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        cond: weatherData.current_weather.weathercode,
      });
    } catch (err) {
      console.error(err);
      setError("⚠️ Error fetching weather!");
      setWeather(null);
    }
  }

  return (
    <div className="container">
      <h1>🌤 Weather Now</h1>
      <p className="subtitle">
        Search a city or use your location to see the current weather.
      </p>

      <input
        type="text"
        placeholder="e.g., Hyderabad, London, Tokyo"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button onClick={getWeather}>
        🔍 Search
      </button>

      <button onClick={getWeatherByLocation} className="location-btn">
        Use My Location
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <p>🌡 Temperature: {weather.temp}°C</p>
          <p>💨 Wind Speed: {weather.wind} km/h</p>
          <p>🌥 Weather Code: {weather.cond}</p>
        </div>
      )}
    </div>
  );
}

export default App;
