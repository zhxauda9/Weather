// weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY;
const AIR_API_KEY = process.env.AIR_API_KEY;

router.get('/weather', async (req, res) => {
    const { city } = req.query;

    try {
        const weatherPromise = axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const newsPromise = axios.get(
            `https://newsapi.org/v2/everything?q=${city}&apiKey=${NEWS_API_KEY}`
        );

        const currencyPromise = axios.get(
            `https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/USD`
        );

        const [weatherResponse, newsResponse, currencyResponse] = await Promise.all([
            weatherPromise,
            newsPromise,
            currencyPromise
        ]);

        const weatherData = weatherResponse.data;
        const newsData = newsResponse.data.articles.slice(0, 5);
        const { lat, lon } = weatherData.coord;

        const airResponse = await axios.get(
            `https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lon}`,
            { headers: { 'x-api-key': AIR_API_KEY } }
        );

        const airData = airResponse.data;
        const airQuality = airData.stations && airData.stations.length > 0 ? airData.stations[0].AQI : 'No data';
        const currencyData = currencyResponse.data.conversion_rates;

        res.json({
            weather: {
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                coordinates: {
                    lat: weatherData.coord.lat,
                    lon: weatherData.coord.lon,
                },
                feels_like: weatherData.main.feels_like,
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                wind_speed: weatherData.wind.speed,
                country_code: weatherData.sys.country,
                rain_volume: weatherData.rain ? weatherData.rain['3h'] : 0,
            },
            news: newsData,
            air_quality: airQuality,
            currency: {
                USD_to_KZT: currencyData.KZT,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении данных.' });
    }
});

module.exports = router;
