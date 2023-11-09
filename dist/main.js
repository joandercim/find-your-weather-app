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
    const res = await fetch('../resources/cities.json');
    const cities = await res.json();
    return cities;
  }

  async getWeatherByCity() {
    this.showLoading();
    const cities = await this.getCities();

    for (const city of cities) {
      await this.fetchCurrentWeather(city);
      document.getElementById(
        'loading-cities'
      ).textContent = `Loading cities. ${this.fetchedCities.length}/120`;
      document.getElementById('progress-inner').style.width = `${
        this.fetchedCities.length - 20
      }%`;
    }
    document.getElementById('loading-cities').textContent =
      'Weather from 120 cities loaded';

    const date = new Date().toLocaleString();
    document.querySelector(
      '.last-update'
    ).textContent = `Weather information fetched ${date}`;

    setTimeout(() => {
      this.hideLoading();
    }, 2000);
  }

  async fetchCurrentWeather(inputCity) {
    const { city, lng, lat } = inputCity;

    try {
      // const res = await fetch(`/weather/${lng}/${lat}`);
      const res = await fetch(
        `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lng}/lat/${lat}/data.json`
      );

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      // Create new city with data from local json and SMHI
      const storedCity = new newCity(city, lat, lng, data);

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
    document
      .querySelector('#response')
      .addEventListener('click', (e) => this.handleReadMore(e));
    document
      .querySelector('.fa-xmark')
      .addEventListener('click', this.closeModal);
  }

  handleClick(e) {
    const button = e.target.closest('.btn');
    if (button) {
      this.interpretUserInput(button.id);
    }
  }

  closeModal() {
    document.querySelector('.modal').style.display = 'none';
  }

  openModal(id) {
    document.querySelector('.modal').style.display = 'flex';
    document.querySelector('.information h1').textContent = id;
  }

  handleReadMore(e) {
    if (
      e.target.id !== 'response' &&
      e.target.className !== 'card' &&
      e.target.className !== 'response-card'
    ) {
      if (e.target.id) {
        this.openModal(e.target.id);
      }
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
    h2.className = 'text-center';
    const responseCards = document.createElement('div');

    if (this.matches.length === 0) {
      h2.textContent = `Sorry, there is not going to be ${userInput} in any of our cities today.`;
      this.responseContainer.appendChild(h2);
      this.responseContainer.append(responseCards);
      return;
    }

    h2.textContent = `Yes! There currently ${userInput} in ${this.matches.length} cities.`;
    this.responseContainer.appendChild(h2);
    responseCards.className = 'response-cards';
    this.responseContainer.append(responseCards);

    let matchesSorted = this.matches.sort((a, b) => {
      const nameA = a.city.toUpperCase(); // ignore upper and lowercase
      const nameB = b.city.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });

    matchesSorted.forEach((city) => {
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
    <p class="more btn" id=${city.city} >Read more</p>
    `;
      responseCards.append(div);
    });
  }

  showLoading() {
    // document.getElementById('spinner').style.display = 'inline-block';
  }

  hideLoading() {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('process').style.width = '10px';
    document.getElementById('process').style.opacity = '0';
    document.getElementById('loading-cities').style.opacity = '0';
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
