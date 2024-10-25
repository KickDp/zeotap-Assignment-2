const ctx = document.getElementById('weatherChart').getContext('2d');
let weatherChart;

const predefinedCities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

async function updateChart(city) {
    const response = await fetch(`/weather/${city}`);
    const data = await response.json();

    if (response.ok) {
        const temperatures = [data.temperature, data.feels_like, data.max_temp, data.min_temp];
        const labels = ['Current Temp', 'Feels Like', 'Max Temp', 'Min Temp'];

        if (weatherChart) {
            weatherChart.destroy(); // Destroy existing chart
        }

        weatherChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Temperature in ${data.city} (${data.unit})`,
                    data: temperatures,
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 2,
                    borderRadius: 5,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperature',
                            color: '#000',
                            font: {
                                size: 16,
                                weight: 'bold',
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 14,
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${data.unit}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

async function fetchAndDisplayWeather(city) {
    const unit = document.getElementById('unit').value;
    const response = await fetch(`/weather/${city}?unit=${unit}`);
    const data = await response.json();

    if (response.ok) {
        const resultDiv = document.getElementById('searched-weather');
        resultDiv.innerHTML = `
            <div class="weather-card">
                <h2>${data.city}</h2>
                <img src="http://openweathermap.org/img/wn/${data.icon}@2x.png" class="weather-icon" alt="${data.condition}">
                <p>Temperature: <strong>${data.temperature} ${data.unit}</strong></p>
                <p>Feels Like: <strong>${data.feels_like} ${data.unit}</strong></p>
                <p>Max Temp: <strong>${data.max_temp} ${data.unit}</strong></p>
                <p>Min Temp: <strong>${data.min_temp} ${data.unit}</strong></p>
                <h3>Condition: <strong>${data.condition}</strong></h3>
                <p>Last Updated: <strong>${data.date}</strong></p>
            </div>
        `;
        updateChart(data.city);
    } else {
        document.getElementById('searched-weather').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;

    }
}

async function fetchPredefinedWeather() {
    const predefinedWeatherDiv = document.getElementById('predefined-weather');
    predefinedWeatherDiv.innerHTML = '';

    const promises = predefinedCities.map(async (city) => {
        const unit = document.getElementById('unit').value;
        const response = await fetch(`/weather/${city}?unit=${unit}`);
        const data = await response.json();

        if (response.ok) {
            predefinedWeatherDiv.innerHTML += `
                <div class="weather-card">
                    <h2>${data.city}</h2>
                    <img src="http://openweathermap.org/img/wn/${data.icon}@2x.png" class="weather-icon" alt="${data.condition}">
                    <p>Temperature: <strong>${data.temperature} ${data.unit}</strong></p>
                    <p>Feels Like: <strong>${data.feels_like} ${data.unit}</strong></p>
                    <p>Max Temp: <strong>${data.max_temp} ${data.unit}</strong></p>
                    <p>Min Temp: <strong>${data.min_temp} ${data.unit}</strong></p>
                    <h3>Condition: <strong>${data.condition}</strong></h3>
                    <p>Last Updated: <strong>${data.date}</strong></p>
                </div>
            `;
        }
    });

    await Promise.all(promises);
}

document.getElementById('weather-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = document.getElementById('city').value;
    await fetchAndDisplayWeather(city);
});

fetchPredefinedWeather();
setInterval(fetchPredefinedWeather, 5 * 60 * 1000); 