class App {
  constructor() {
    this.loadEventListeners();
    this.getCities();
    this.getWeatherByCity();
    this.fetchedCities = [];
    this.matches = [];
    this.responseContainer = document.getElementById('response');
  }

  async getCities() {
    const res = await fetch('./cities.json');
    const cities = await res.json();
    return cities;
  }

  async getWeatherByCity() {
    const cities = await this.getCities();

    for (const city of cities) {
      await this.fetchCurrentWeather(city);
    }
  }

  async fetchCurrentWeather(inputCity) {
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
      const storedCity = new newCity(city, lat, lng, data);

      this.fetchedCities.push(storedCity);
    } catch (error) {
      console.log(`Ett fel uppstod vid hämtning av ${city}: ${error}`);
    }
  }

  loadEventListeners() {
    document
      .querySelector('.buttons')
      .addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(e) {
    const button = e.target.closest('.btn');
    if (button) {
      this.interpretUserInput(button.id);
    }
  }

  interpretUserInput(userInput) {
    let weatherCodes = [];
    switch (userInput) {
      case 'sunny':
        weatherCodes = [1, 2];
        break;
      case 'halfclear':
        weatherCodes = [3, 4];
        break;
      case 'cloudy':
        weatherCodes = [5, 6];
        break;
      case 'foggy':
        weatherCodes = [7];
        break;
      case 'raining':
        weatherCodes = [8, 9, 10, 18, 19, 20];
        break;
      case 'thunder':
        weatherCodes = [21, 11];
        break;
      case 'snowing':
        weatherCodes = [25, 26, 27, 13, 14, 15, 16, 17];
        break;
    }
    this.findMatchingWeather(weatherCodes);
    this.displayMatches(userInput);
  }

  findMatchingWeather(weatherCodes) {
    // Empty matches array before new match request.
    this.matches = [];
    weatherCodes.forEach((weatherCode) => {
      this.fetchedCities.forEach((city) => {
        const dataLength =
          city.weatherInfo.weatherInfo.timeSeries[0].parameters.length - 1;
        const weatherType =
          city.weatherInfo.weatherInfo.timeSeries[0].parameters[dataLength]
            .values[0];
        if (weatherCode === weatherType) {
          this.matches.push(city);
        }
      });
    });
  }

  displayMatches(userInput) {
    this.responseContainer.innerHTML = '';
    const h2 = document.createElement('h2');
    const responseCards = document.createElement('div');

    if (this.matches.length === 0) {
      h2.textContent = `Sorry, there is not going to be ${userInput} in any of our cities today.`;
      this.responseContainer.appendChild(h2);
      this.responseContainer.append(responseCards);
      return;
    }

    h2.textContent = `Yes! Today there is supposed to be ${userInput} in ${this.matches.length} cities.`;
    this.responseContainer.appendChild(h2);
    responseCards.className = 'response-cards';
    this.responseContainer.append(responseCards);

    this.matches.forEach((city) => {
      const div = document.createElement('div');
      div.className = 'card';

      div.innerHTML = `
    <h3>${city.city}</h3>
    <p class="coord">
      LAT: ${city.lat}
    </p>
    <p class="coord">
      LNG: ${city.lng}
    </p>
    <p class="more btn" id=${city.city}>Read more</p>
    `;
      responseCards.append(div);
    });
  }

  showSpinner() {
    document.getElementById('spinner').style.display = 'inline-block';
  }

  hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
  }
}

class newCity {
  constructor(city, lng, lat, weatherInfo) {
    this.city = city;
    this.lng = lng;
    this.lat = lat;
    this.weatherInfo = {
      weatherInfo,
    };
  }
}

const app = new App();
