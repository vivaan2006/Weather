const iconElement = document.querySelector(".weather-icon img");
const tempElement = document.querySelector(".temperature-value h2");
const unitElement = document.querySelector(".unit");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location h3");
const notificationElement = document.querySelector(".notification");
const toggleUnitElement = document.querySelector(".toggle-unit input");
const searchInputElement = document.getElementById("search-input");
const searchButtonElement = document.getElementById("search-button");
const forecastListElement = document.querySelector(".forecast-list");

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
  updateForecastTemperature();
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

function getWeatherByCoordinates(latitude, longitude) {
    const api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
  
    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data);
      })
      .then(() => {
        displayWeather();
        getForecastByCoordinates(latitude, longitude); // Update the forecast after setting the weather data
      })
      .catch((error) => {
        displayError(error.message);
      });
  }
  
  function getWeatherByCity(city) {
    const api = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
  
    let data; // Declare the data variable outside the fetch call
  
    fetch(api)
      .then((response) => response.json())
      .then((responseData) => {
        data = responseData; // Assign the response data to the data variable
        setWeatherData(data);
      })
      .then(() => {
        displayWeather();
        const { lat, lon } = data.coord; // Access the data variable to extract latitude and longitude
        getForecastByCoordinates(lat, lon); // Update the forecast using the coordinates
      })
      .catch((error) => {
        displayError(error.message);
      });
  }
  
  

function getForecastByCoordinates(latitude, longitude) {
  const api = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then((response) => response.json())
    .then((data) => {
      displayForecast(data.list);
    })
    .catch((error) => {
      console.error("Error fetching forecast:", error);
    });
}

function displayForecast(forecastData) {
  forecastListElement.innerHTML = "";
  for (let i = 0; i < forecastData.length; i += 8) {
    const forecast = forecastData[i];
    const forecastItem = createForecastItem(forecast);
    forecastListElement.appendChild(forecastItem);
  }
}

function updateForecastTemperature() {
  const forecastTemperatureElements = document.querySelectorAll(".forecast-temperature");
  forecastTemperatureElements.forEach((element) => {
    const currentTemperature = element.textContent.split("°")[0];
    const convertedTemperature = convertTemperature(parseInt(currentTemperature));
    element.innerHTML = `${convertedTemperature}°${getUnitSymbol()}`;
  });
}

function createForecastItem(forecast) {
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
  
    const date = new Date(forecast.dt * 1000);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
  
    const dateElement = document.createElement("h3");
    dateElement.classList.add("forecast-date");
    dateElement.textContent = dayOfWeek;
  
    const iconElement = document.createElement("img");
    iconElement.classList.add("forecast-icon");
    iconElement.src = `icons/${forecast.weather[0].icon}.png`;
    iconElement.alt = forecast.weather[0].description;
  
    const tempElement = document.createElement("p");
    tempElement.classList.add("forecast-temperature");
    tempElement.dataset.temperature = Math.round(forecast.main.temp - 273);
  
    forecastItem.appendChild(dateElement);
    forecastItem.appendChild(iconElement);
    forecastItem.appendChild(tempElement);
  
    return forecastItem;
  }
  
  function updateForecastTemperature() {
    const forecastTemperatureElements = document.querySelectorAll(".forecast-temperature");
    forecastTemperatureElements.forEach((element) => {
      const currentTemperature = element.dataset.temperature;
      const convertedTemperature = convertTemperature(parseInt(currentTemperature));
      element.innerHTML = `${convertedTemperature}°${getUnitSymbol()}`;
    });
  }  

function setCurrentLocationWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoordinates(latitude, longitude);
      getForecastByCoordinates(latitude, longitude);
    }, showError);
  } else {
    displayError("Browser doesn't support Geolocation");
  }
}

function showError(error) {
  displayError(error.message);
}

function searchLocationWeather() {
  const searchQuery = searchInputElement.value.trim();
  if (searchQuery !== "") {
    getWeatherByCity(searchQuery);
    searchInputElement.value = "";
  }
}

toggleUnitElement.addEventListener("change", toggleUnit);
toggleUnitElement.addEventListener("click", removeAnimationClasses);
searchButtonElement.addEventListener("click", searchLocationWeather);

setCurrentLocationWeather();