const LOESSNIG_COORDS = {
  latitude: 51.3005,
  longitude: 12.398,
};

const elements = {
  currentTime: document.getElementById('currentTime'),
  weatherIcon: document.getElementById('weatherIcon'),
  weatherSummary: document.getElementById('weatherSummary'),
  temperature: document.getElementById('temperature'),
  thermFill: document.getElementById('thermFill'),
  thermLabel: document.getElementById('thermLabel'),
  clothingIcon: document.getElementById('clothingIcon'),
  clothingTitle: document.getElementById('clothingTitle'),
  clothingHint: document.getElementById('clothingHint'),
  forecast: document.getElementById('forecast'),
};

const weatherCodeMap = {
  0: { label: 'Sonnig', icon: '☀️' },
  1: { label: 'Meist sonnig', icon: '🌤️' },
  2: { label: 'Teilweise bewölkt', icon: '⛅' },
  3: { label: 'Bewölkt', icon: '☁️' },
  45: { label: 'Nebel', icon: '🌫️' },
  48: { label: 'Raureif-Nebel', icon: '🌫️' },
  51: { label: 'Leichter Nieselregen', icon: '🌦️' },
  53: { label: 'Nieselregen', icon: '🌦️' },
  55: { label: 'Starker Nieselregen', icon: '🌧️' },
  61: { label: 'Leichter Regen', icon: '🌦️' },
  63: { label: 'Regen', icon: '🌧️' },
  65: { label: 'Starker Regen', icon: '🌧️' },
  71: { label: 'Leichter Schnee', icon: '🌨️' },
  73: { label: 'Schnee', icon: '❄️' },
  75: { label: 'Starker Schneefall', icon: '❄️' },
  80: { label: 'Regenschauer', icon: '🌦️' },
  81: { label: 'Kräftige Schauer', icon: '🌧️' },
  82: { label: 'Starke Schauer', icon: '⛈️' },
  95: { label: 'Gewitter', icon: '⛈️' },
};

function clothingRecommendation(temp, weatherCode, windspeed) {
  const rainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const stormy = [95].includes(weatherCode) || windspeed >= 35;

  if (temp <= 4) {
    return {
      icon: '🧥',
      title: 'Winterjacke',
      hint: 'Sehr kalt! Dicke Jacke und am besten Schal tragen.',
    };
  }
  if (temp <= 10) {
    return {
      icon: '🧥',
      title: 'Warme Jacke',
      hint: 'Es ist frisch. Eine warme Jacke ist heute gut.',
    };
  }
  if (temp <= 16) {
    return {
      icon: rainy || stormy ? '🧥' : '👕',
      title: rainy || stormy ? 'Übergangsjacke' : 'Langarmshirt / Hoodie',
      hint: rainy || stormy
        ? 'Nimm lieber eine leichte Jacke mit.'
        : 'Ein Langarmshirt passt heute prima.',
    };
  }
  if (temp <= 22) {
    return {
      icon: rainy ? '🧥' : '👕',
      title: rainy ? 'Leichte Jacke' : 'T-Shirt',
      hint: rainy
        ? 'Mild, aber regnerisch – eine dünne Jacke ist sinnvoll.'
        : 'Angenehm! Ein T-Shirt reicht meist aus.',
    };
  }

  return {
    icon: '👕',
    title: 'T-Shirt',
    hint: 'Warmes Wetter! Denk an Sonnencreme und genug trinken.',
  };
}

function setThermometer(temp) {
  const clamped = Math.max(-10, Math.min(35, temp));
  const percentage = ((clamped + 10) / 45) * 100;
  elements.thermFill.style.height = `${percentage}%`;
  elements.thermFill.style.background =
    temp < 10
      ? 'linear-gradient(180deg, #60a5fa, #0ea5e9)'
      : 'linear-gradient(180deg, #f59e0b, #ef4444)';
  elements.thermLabel.textContent = `${Math.round(temp)} °C`;
}

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { label: 'Unbekannt', icon: '🌈' };
}

function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

async function loadWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LOESSNIG_COORDS.latitude}` +
    `&longitude=${LOESSNIG_COORDS.longitude}` +
    '&current=temperature_2m,weather_code,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    '&timezone=Europe%2FBerlin&forecast_days=4';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Wetterdaten konnten nicht geladen werden.');
  }

  const data = await response.json();
  const current = data.current;
  const today = getWeatherInfo(current.weather_code);

  elements.currentTime.textContent = `Stand: ${new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })} Uhr`;
  elements.weatherIcon.textContent = today.icon;
  elements.weatherSummary.textContent = today.label;
  elements.temperature.textContent = `${Math.round(current.temperature_2m)} °C`;

  setThermometer(current.temperature_2m);

  const recommendation = clothingRecommendation(
    current.temperature_2m,
    current.weather_code,
    current.wind_speed_10m,
  );

  elements.clothingIcon.textContent = recommendation.icon;
  elements.clothingTitle.textContent = recommendation.title;
  elements.clothingHint.textContent = recommendation.hint;

  const forecastItems = data.daily.time.slice(1, 4).map((date, index) => {
    const code = data.daily.weather_code[index + 1];
    const info = getWeatherInfo(code);
    const max = Math.round(data.daily.temperature_2m_max[index + 1]);
    const min = Math.round(data.daily.temperature_2m_min[index + 1]);
    return `
      <article class="forecast-day">
        <h3>${formatDay(date)}</h3>
        <p class="weather-summary">${info.icon} ${info.label}</p>
        <p class="temp-range">${max} °C / ${min} °C</p>
      </article>
    `;
  });

  elements.forecast.innerHTML = forecastItems.join('');
}

loadWeather().catch((error) => {
  elements.weatherSummary.textContent = 'Ups, die Wetterdaten sind gerade nicht erreichbar.';
  elements.clothingTitle.textContent = 'Heute auf Nummer sicher gehen';
  elements.clothingHint.textContent = 'Bitte schaut kurz aus dem Fenster und entscheidet gemeinsam.';
  elements.forecast.innerHTML = `<p class="muted">${error.message}</p>`;
});
