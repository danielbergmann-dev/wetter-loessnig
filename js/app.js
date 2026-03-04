const weatherCodeMap = {
  0: "Sonnig",
  1: "Überwiegend sonnig",
  2: "Leicht bewölkt",
  3: "Bewölkt",
  45: "Neblig",
  48: "Reifnebel",
  51: "Leichter Nieselregen",
  53: "Nieselregen",
  55: "Starker Nieselregen",
  61: "Leichter Regen",
  63: "Regen",
  65: "Starker Regen",
  71: "Leichter Schnee",
  73: "Schnee",
  75: "Starker Schneefall",
  80: "Regenschauer",
  81: "Starke Regenschauer",
  82: "Heftige Schauer",
  95: "Gewitter"
};

function getClothingRecommendation(temp) {
  if (temp <= 5) {
    return { icon: "🧥", text: "Dicke Jacke + Pullover" };
  }
  if (temp <= 12) {
    return { icon: "🧥", text: "Leichte Jacke oder Hoodie" };
  }
  if (temp <= 20) {
    return { icon: "👕", text: "Langarmshirt oder T-Shirt" };
  }

  return { icon: "🩳", text: "T-Shirt, heute ist es warm" };
}

function getTempFillHeight(temp) {
  const min = -10;
  const max = 35;
  const clamped = Math.max(min, Math.min(max, temp));
  return ((clamped - min) / (max - min)) * 100;
}

function weekday(dateString) {
  return new Date(dateString).toLocaleDateString("de-DE", { weekday: "short" });
}

async function loadWeather() {
  const statusEl = document.getElementById("status");

  try {
    statusEl.textContent = "Wetterdaten werden geladen …";

    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=51.3059&longitude=12.3713&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=4"
    );

    if (!response.ok) {
      throw new Error("Die Wetterdaten konnten nicht geladen werden.");
    }

    const data = await response.json();
    const currentTemp = Math.round(data.current.temperature_2m);
    const currentCode = data.current.weather_code;
    const condition = weatherCodeMap[currentCode] || "Unbekannt";

    document.getElementById("current-temp").textContent = `${currentTemp}°C`;
    document.getElementById("current-condition").textContent = condition;

    const clothing = getClothingRecommendation(currentTemp);
    document.getElementById("clothing-icon").textContent = clothing.icon;
    document.getElementById("clothing-text").textContent = clothing.text;

    document.getElementById("thermometer-fill").style.height = `${getTempFillHeight(currentTemp)}%`;

    const forecastGrid = document.getElementById("forecast-grid");
    forecastGrid.innerHTML = "";

    for (let i = 1; i <= 3; i += 1) {
      const dayCode = data.daily.weather_code[i];
      const day = document.createElement("article");
      day.className = "forecast-day";
      day.innerHTML = `
        <p><strong>${weekday(data.daily.time[i])}</strong></p>
        <p>${weatherCodeMap[dayCode] || "Wetter"}</p>
        <p>🌡️ ${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(
        data.daily.temperature_2m_min[i]
      )}°</p>
      `;
      forecastGrid.appendChild(day);
    }

    statusEl.textContent = "Aktualisiert: " + new Date().toLocaleTimeString("de-DE");
  } catch (error) {
    statusEl.textContent =
      "Ups! Wetterdaten konnten gerade nicht geladen werden. Bitte später neu versuchen.";
  }
}

loadWeather();
setInterval(loadWeather, 1000 * 60 * 10);
