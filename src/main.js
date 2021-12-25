require("dotenv").config();

const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_USER_RECIPIENT = process.env.EMAIL_USER_RECIPIENT;
const ACCUWEATHER_API_KEY = process.env.ACCUWEATHER_API_KEY;
const TENOR_API_KEY = process.env.TENOR_API_KEY;

const fahrenheitToCelsius = (f) => {
  const temp = (f - 32) * (5 / 9);

  return temp.toFixed(2);
};

(async function run() {
  console.log("Running report...");

  try {
    const city = "Santo Ângelo, RS";
    const countryCode = "BR";

    const locationEndpoint = `http://dataservice.accuweather.com/locations/v1/cities/${countryCode}/search`;
    const locationRequest = await fetch(
      `${locationEndpoint}?q=${encodeURIComponent(
        city
      )}&apikey=${ACCUWEATHER_API_KEY}`
    );

    const locationData = await locationRequest.json();

    const locationKey = locationData[0].Key;

    const forecastEndpoint = `http://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}`;
    const forecastRequest = await fetch(
      `${forecastEndpoint}?apikey=${ACCUWEATHER_API_KEY}&language=pt-br`
    );

    const forecastData = await forecastRequest.json();

    console.log(JSON.stringify(forecastData, null, 2));

    const tempMin = forecastData.DailyForecasts[0].Temperature.Minimum.Value;
    const tempMax = forecastData.DailyForecasts[0].Temperature.Maximum.Value;

    const gifEndpoint = `https://g.tenor.com/v1/trending`;
    const gifRequest = await fetch(
      `${gifEndpoint}?contentfilter=off&limit=1&key=${TENOR_API_KEY}`
    );
    const gifData = await gifRequest.json();

    const date = new Date();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER_RECIPIENT,
      subject: `Daily Report - ${date.toDateString()}`,
      text: `
    Daily Report - ${date}

    Weather
    - Forecast: ${forecastData.Headline.Text}
    - Temp Min: ${fahrenheitToCelsius(tempMin)} °C
    - Temp Max: ${fahrenheitToCelsius(tempMax)} °C

    Daily Gif: ${gifData.results[0].url}
    `,
      html: `
      <h1>Daily Report - ${date}</h1>
      <h2>Weather</h2>
      <p>Forecast: ${forecastData.Headline.Text}</p>
      <p>Temp Min: ${fahrenheitToCelsius(tempMin)} °C</p>
      <p>Temp Max: ${fahrenheitToCelsius(tempMax)} °C</p>

      <p><img src="${gifData.results[0].media[0].tinygif.url}" /></p>
    `,
    });
  } catch (error) {
    console.error(error);
  }
})();
