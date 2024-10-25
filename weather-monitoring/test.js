require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Test API Connection
async function testAPIConnection() {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Delhi,IN&appid=${API_KEY}`);
        console.log('API Connection Successful:', response.data);
    } catch (error) {
        console.error('API Connection Failed:', error.message);
    }
}

// Test Data Retrieval
async function testDataRetrieval() {
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const promises = cities.map(city => 
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}`)
    );

    try {
        const results = await Promise.all(promises);
        results.forEach(response => {
            console.log(`Data for ${response.data.name}:`, response.data);
        });
    } catch (error) {
        console.error('Data Retrieval Failed:', error.message);
    }
}

// Test Temperature Conversion
function convertKelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

function testTemperatureConversion() {
    const kelvinTemperatures = [300, 310, 280]; // Example Kelvin values
    kelvinTemperatures.forEach(temp => {
        const celsius = convertKelvinToCelsius(temp);
        console.log(`Temperature: ${temp} K = ${celsius.toFixed(2)} °C`);
    });
}

// Execute Tests
async function runTests() {
    await testAPIConnection();
    await testDataRetrieval();
    testTemperatureConversion();
}

runTests();
