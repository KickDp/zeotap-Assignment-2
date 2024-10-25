require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const ALERT_THRESHOLD = 35; // Celsius threshold for alerts
let previousTemperatureData = {};

// Serve static files from the "public" folder
app.use(express.static('public'));

// Connect to SQLite Database
const db = new sqlite3.Database('./weather.db');

// Create table for daily weather summaries
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS weather_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        city TEXT UNIQUE,
        avg_temp REAL,
        max_temp REAL,
        min_temp REAL,
        dominant_condition TEXT
    )`);
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send alert emails
function sendAlertEmail(city, temperature) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'recipient_email@gmail.com',
        subject: `Weather Alert for ${city}`,
        text: `ALERT: ${city} has exceeded the temperature threshold of ${ALERT_THRESHOLD}°C. Current Temperature: ${temperature}°C`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Function to convert temperature to user-specified units
function convertTemperature(tempInKelvin, unit) {
    if (unit === 'C') {
        return tempInKelvin - 273.15; // Kelvin to Celsius
    } else if (unit === 'F') {
        return (tempInKelvin - 273.15) * 9 / 5 + 32; // Kelvin to Fahrenheit
    } else {
        return tempInKelvin; // Kelvin (default)
    }
}

// Function to fetch weather for a specific city
async function fetchCityWeather(city, unit = 'C') {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
        const weatherData = response.data;
        const tempC = convertTemperature(weatherData.main.temp, unit);
        const feelsLikeC = convertTemperature(weatherData.main.feels_like, unit);
        const condition = weatherData.weather[0].main;
        const date = new Date(weatherData.dt * 1000).toISOString();

        return {
            city,
            temperature: tempC.toFixed(2),
            feels_like: feelsLikeC.toFixed(2),
            condition,
            date,
            icon: weatherData.weather[0].icon,
            max_temp: convertTemperature(weatherData.main.temp_max, unit).toFixed(2),
            min_temp: convertTemperature(weatherData.main.temp_min, unit).toFixed(2),
            unit: unit === 'C' ? '°C' : unit === 'F' ? '°F' : 'K'
        };
    } catch (error) {
        throw new Error(`Error fetching weather for ${city}: ${error.message}`);
    }
}

// Function to fetch weather data and insert into database
async function fetchWeatherData() {
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const promises = cities.map(city => fetchCityWeather(city));

    try {
        const results = await Promise.all(promises);
        results.forEach(weatherData => {
            const { city, temperature, feels_like, condition, date, max_temp, min_temp } = weatherData;
            const today = new Date().toISOString().split('T')[0];

            // Insert or update weather summary in database
            db.get(`SELECT * FROM weather_summary WHERE city = ? AND date = ?`, [city, today], (err, row) => {
                if (err) {
                    console.error('Error querying database:', err.message);
                } else if (!row) {
                    db.run(`INSERT INTO weather_summary (date, city, avg_temp, max_temp, min_temp, dominant_condition)
                        VALUES (?, ?, ?, ?, ?, ?)`, [today, city, temperature, max_temp, min_temp, condition]);
                } else {
                    db.run(`UPDATE weather_summary SET avg_temp = ?, max_temp = ?, min_temp = ?, dominant_condition = ? 
                        WHERE id = ?`, [temperature, max_temp, min_temp, condition, row.id]);
                }
            });

            // Check alerting threshold
            if (previousTemperatureData[city] && previousTemperatureData[city] > ALERT_THRESHOLD && temperature > ALERT_THRESHOLD) {
                sendAlertEmail(city, temperature);
            }
            previousTemperatureData[city] = temperature;
        });
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

// Schedule fetching weather data every 5 minutes
schedule.scheduleJob('*/5 * * * *', fetchWeatherData);

// Route to get daily weather summary
app.get('/weather-summary', (req, res) => {
    db.all(`SELECT DISTINCT date, city, AVG(avg_temp) as avg_temp, MAX(max_temp) as max_temp, MIN(min_temp) as min_temp, dominant_condition
            FROM weather_summary GROUP BY date, city`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Route to search weather by city with optional temperature unit
app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;
    const unit = req.query.unit || 'C'; // Default to Celsius if not provided
    try {
        const weatherData = await fetchCityWeather(city, unit);
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
