let matches = [];
let weatherCode = [];
let weatherInfo = '';
const responseContainer = document.getElementById('response');
let userInput = '';

async function getCities() {
  const res = await fetch('./cities.json');
  const cities = await res.json();
  return cities;
}

async function fetchWeatherData() {
  const cities = await getCities();

  for (const city of cities) {
    await getData(city);
  }
  displayResults();
}

async function getData(inputCity) {
  const { city, lng, lat } = inputCity;

  try {
    const res = await fetch(
      `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lng}/lat/${lat}/data.json`
    );

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();
    // Timeseries[0] bestämmer att visa vädret just nu
    const dataLength = data.timeSeries[0].parameters.length - 1;
    const weatherType = data.timeSeries[0].parameters[dataLength].values[0];

    weatherCode.forEach((num) => {
      if (num === weatherType) {
        const newCity = {
          city,
          lng,
          lat,
          weatherType,
        };

        matches.push(newCity);
      }
    });
  } catch (error) {
    console.log(`Ett fel uppstod vid hämtning av ${city}: ${error}`);
  }
}

function getUserInput(e) {
  const button = e.target.closest('.btn');
  if (button) {
    interpretUserInput(button.id);
  }
}

function interpretUserInput(id) {
  userInput = id;
  weatherCode = [];
  switch (userInput) {
    case 'sunny':
      weatherCode = [1, 2];
      break;
    case 'halfclear':
      weatherCode = [3, 4];
      break;
    case 'cloudy':
      weatherCode = [5, 6];
      break;
    case 'foggy':
      weatherCode = [7];
      break;
    case 'raining':
      weatherCode = [8, 9, 10, 18, 19, 20];
      break;
    case 'thunder':
      weatherCode = [3, 4, 21];
      break;
    case 'snowing':
      weatherCode = [25, 26, 27, 13, 14, 15, 16, 17];
      break;
  }
    fetchWeatherData();
}

function displayResults() {
    responseContainer.innerHTML = '';
  const h2 = document.createElement('h2');

  if (matches.length === 0) {
    h2.textContent = `Sorry, right now there is no cities in Sweden where it's ${userInput}`;
    responseContainer.appendChild(h2);
    return;
  }

  h2.textContent = `There is currently ${userInput} in`;
  responseContainer.appendChild(h2);

  matches.forEach((city) => {
    const h2 = document.createElement('h2');
    h2.textContent = city.city;
    responseContainer.appendChild(h2);
  });
    matches = [];
}

document.querySelector('.buttons').addEventListener('click', getUserInput);