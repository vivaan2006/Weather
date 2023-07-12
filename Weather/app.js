const iconElement = document.querySelector(".weather-icon img");
const tempElement = document.querySelector(".temperature-value h2");
const unitElement = document.querySelector(".unit");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location h3");
const notificationElement = document.querySelector(".notification");
const toggleUnitElement = document.querySelector(".toggle-unit input");

const weather = {};

weather.temperature = {
  value: undefined,
  unit: "celsius"
};

const key = "82005d27a116c2880c8f0fcb866998a0";

function displayError(message) {
  notificationElement.style.display = "block";
  notificationElement.innerHTML = `<p class="error-message">${message}</p>`;
}

function toggleUnit() {
  if (weather.temperature.unit === "celsius") {
    weather.temperature.unit = "fahrenheit";
  } else {
    weather.temperature.unit = "celsius";
  }
  tempElement.innerHTML = `${convertTemperature(weather.temperature.value)}<span class="unit">${getUnitSymbol()}</span>`;
  animateTemperatureChange();
}

function animateTemperatureChange() {
  tempElement.classList.add("temperature-change");
  setTimeout(() => {
    tempElement.classList.remove("temperature-change");
  }, 500);
}

function convertTemperature(temperature) {
  if (weather.temperature.unit === "celsius") {
    return temperature;
  }
  return Math.round((temperature * 9) / 5 + 32);
}

function getUnitSymbol() {
  return weather.temperature.unit === "celsius" ? "°C" : "°F";
}

function displayWeather() {
  iconElement.src = `icons/${weather.iconId}.png`;
  tempElement.innerHTML = `${weather.temperature.value}<span class="unit">${getUnitSymbol()}</span>`;
  descElement.innerHTML = weather.description;
  locationElement.innerHTML = `${weather.city}, ${weather.country}`;
  animateWeatherDisplay();
}

function animateWeatherDisplay() {
  const weatherElements = document.querySelectorAll(".weather-container > *");
  weatherElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 100}ms`;
    element.classList.add("fade-in");
  });
}

function removeAnimationClasses() {
  const weatherElements = document.querySelectorAll(".weather-container > *");
  weatherElements.forEach((element) => {
    element.style.animationDelay = "";
    element.classList.remove("fade-in");
  });
}

function setWeatherData(data) {
  weather.temperature.value = Math.floor(data.main.temp - 273);
  weather.description = data.weather[0].description;
  weather.iconId = data.weather[0].icon;
  weather.city = data.name;
  weather.country = data.sys.country;
}

function getWeather(latitude, longitude) {
  const api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then((response) => response.json())
    .then((data) => {
      setWeatherData(data);
    })
    .then(() => {
      displayWeather();
    })
    .catch((error) => {
      displayError(error.message);
    });
}

function setPosition(position) {
  const { latitude, longitude } = position.coords;
  getWeather(latitude, longitude);
}

function showError(error) {
  displayError(error.message);
}

function getLocationWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
  } else {
    displayError("Browser doesn't support Geolocation");
  }
}

toggleUnitElement.addEventListener("change", toggleUnit);
toggleUnitElement.addEventListener("click", removeAnimationClasses);

getLocationWeather();