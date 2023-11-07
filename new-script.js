class App {
  constructor() {
    this.loadEventListeners();
    this.getCities();
    this.getWeatherByCity();
    this.fetchedCities = [];
    this.matches = [];
    this.responseContainer = document.getElementById('response');
    // this.success = true;
  }

  async getCities() {
    const res = await fetch('./cities.json');
    const cities = await res.json();
    return cities;
  }

  async getWeatherByCity() {
    this.showSpinner();
    const cities = await this.getCities();

    for (const city of cities) {
      await this.fetchCurrentWeather(city);
    }
    this.hideSpinner();
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
      // Create new city with data from local json and SMHI
      const storedCity = new newCity(city, lat, lng, data);

      const date = new Date().toLocaleString();
      document.querySelector(
        '.last-update'
      ).textContent = `Weather information fetched ${date}`;

      this.fetchedCities.push(storedCity);
    } catch (error) {
      this.success = false;
      console.log(`Ett fel uppstod vid hämtning av ${city}: ${error}`);
      document.querySelector('.last-update').textContent =
        'No data collected, see console for more infomation.';
      document.querySelector('.last-update').style.color = 'red';
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
    let backgroundElement = document.querySelector('.overlay');
    let weatherCodes = [];

    switch (userInput) {
      case 'clear-skies':
        weatherCodes = [1, 2, 3];
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1550133730-695473e544be?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        break;
      case 'cloudy':
        weatherCodes = [5, 6];
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1485249245068-d8dc50b77cc7?q=80&w=2662&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        break;
      case 'foggy':
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1541480110211-586977e40589?q=80&w=2693&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [7];
        break;
      case 'raining':
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [8, 9, 10, 18, 19, 20];
        break;
      case 'thunder':
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1431440869543-efaf3388c585?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [21, 11];
        break;
      case 'snowing':
        weatherCodes = [25, 26, 27, 13, 14, 15, 16, 17];
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1577457943926-11193adc0563?q=80&w=2702&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        break;
    }
    this.findMatchingWeather(weatherCodes);
    const userInputFormatted = userInput.replace('-', ' ');
    this.displayMatches(userInputFormatted);
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

    // if (this.success === false) {
    //   h2.textContent = `Something went wrong wile fetching the data. Please come back later`;
    //   this.responseContainer.appendChild(h2);
    //   this.responseContainer.append(responseCards);
    //   console.log('WERJKFLDSJKLFJDKSLJFLKSD');
    // }

    h2.textContent = `Yes! There currently ${userInput} in ${this.matches.length} cities.`;
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
