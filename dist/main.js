class App {
  constructor() {
    this.loadEventListeners();
    this.getCities();
    this.getWeatherByCity();
    this.fetchedCities = [];
    this.matches = [];
    this.responseContainer = document.getElementById('response');
    this.weatherIcon = '';
    // this.success = true;
  }

  async getCities() {
    const res = await fetch('../resources/cities.json');
    const cities = await res.json();
    return cities;
  }

  async getWeatherByCity() {
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
    }, 750);
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
    document.querySelector('body').classList.add('modal-open');
    document.querySelector('.information h1').textContent = id;
    this.getCityInfo(id);
    this.getCityWeather(id);
  }

  async getCityWeather(id) {
    this.matches.forEach((obj) => console.log(obj.city));
    const currentCity = this.matches.filter((city) => city.city === id);

    const weather = currentCity[0].weatherInfo.weatherInfo.timeSeries[0];
    const airTemp = weather.parameters[10].values[0];
    const windSpeed = weather.parameters[14].values[0];
    const precipi = weather.parameters[5].values[0];
    const thunderProb = weather.parameters[16].values[0];
    const horizontalVisibility = weather.parameters[12].values[0];
    console.log(weather)

    const airTempEl = document.getElementById('air-temp');
    const windSpeedEl = document.getElementById('wind-speed');
    const precipiEl = document.getElementById('pricipitation');
    const thunderProbEl = document.getElementById('thunder-prob');
    const visEl = document.getElementById('visibility');

    let airTempCounter = 0;
    let windSpeedCounter = 0;
    let pricipiCounter = 0;
    let thunderCounter = 0;
    let visibilityCounter = 0;

    for (let i = 0; i < airTemp; i++) {
      setTimeout(() => {
        airTempCounter++;
        airTempEl.textContent = airTempCounter;
      }, 100 * i);
    }

    for (let i = 0; i < windSpeed; i++) {
      setTimeout(() => {
        windSpeedCounter++;
        windSpeedEl.textContent = windSpeedCounter;
      }, 100 * i);
    }

    for (let i = 0; i < precipi; i++) {
      setTimeout(() => {
        pricipiCounter++;
        precipiEl.textContent = pricipiCounter;
      }, 100 * i);
    }

    for (let i = 0; i < thunderProb; i++) {
      setTimeout(() => {
        thunderCounter++;
        thunderProbEl.textContent = thunderCounter;
      }, 100 * i);
    }

    for (let i = 0; i < horizontalVisibility; i++) {
      setTimeout(() => {
        visibilityCounter++;
        visEl.textContent = visibilityCounter;
      }, 100 * i);
    }
  }

  async getCityInfo(city) {
    const res = await fetch(`/${city}`);
    const data = await res.json();
    const pageId = Object.keys(data.query.pages);
    const summary = data.query.pages[pageId].extract;
    const title = data.query.pages[pageId].title;

    console.log(data.query.pages[pageId]);

    const outputString = summary.replace(/\(.*?\)/, '');

    document.querySelector('.modal .information p').textContent = outputString;
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
        this.weatherIcon = 'sun';
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1550133730-695473e544be?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        break;
      case 'cloudy':
        weatherCodes = [5, 6];
        this.weatherIcon = 'cloud';
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1485249245068-d8dc50b77cc7?q=80&w=2662&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        break;
      case 'foggy':
        this.weatherIcon = 'smog';
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1541480110211-586977e40589?q=80&w=2693&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [7];
        break;
      case 'raining':
        this.weatherIcon = 'cloud-showers-heavy';
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [8, 9, 10, 18, 19, 20];
        break;
      case 'thunder':
        this.weatherIcon = 'cloud-bolt';
        backgroundElement.style.backgroundImage =
          'url(https://images.unsplash.com/photo-1431440869543-efaf3388c585?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
        weatherCodes = [21, 11];
        break;
      case 'snowing':
        this.weatherIcon = 'snowflake';
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
      <i class="fa-solid fa-${this.weatherIcon}"></i>
    <h3>${city.city}</h3>
    <div class="coordinates">
              <p><em>LAT: ${city.lat}</em></p>
              <p><em>LNG: ${city.lng}</em></p>
            </div>
    <p class="more btn" id=${city.city} >Read more</p>
    `;
      responseCards.append(div);
    });
  }

  hideLoading() {
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
