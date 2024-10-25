# Weather Monitoring Application

A real-time weather monitoring application that fetches and displays weather conditions for major Indian cities. The application utilizes the OpenWeatherMap API to provide current weather updates, including temperature, feels-like temperature, and dominant weather conditions. It also features automatic updates every 5 minutes and sends alerts based on user-configurable thresholds.

## Features

- Fetch weather data for predefined cities (Delhi, Mumbai, Chennai, Bangalore, Kolkata, Hyderabad)
- Display current temperature, feels-like temperature, maximum and minimum temperatures
- Visual representation of weather conditions using charts
- Automatic weather data updates every 5 minutes
- Email alerts for temperature breaches
- Responsive design with a modern user interface

## Technologies Used

- Node.js
- Express.js
- SQLite3
- Axios
- Nodemailer
- Chart.js (for visualizations)
- HTML/CSS/JavaScript

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/USERNAME/my-weather-app.git
   cd my-weather-app
Install the required dependencies:

bash
Copy code
npm install
Create a .env file in the root directory and add your OpenWeatherMap API key and email credentials:

plaintext
Copy code
OPENWEATHER_API_KEY=your_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
Start the server:

bash
Copy code
node server.js
Open your browser and navigate to http://localhost:4000 to view the application.

Usage
The application displays weather data for predefined cities.
You can search for additional cities using the search bar.
Weather data updates automatically every 5 minutes.
Alerts will be sent to your email if the temperature exceeds the defined threshold.
Contributing
Contributions are welcome! Please open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
OpenWeatherMap API for providing weather data.
Nodemailer for sending emails.
Chart.js for visualizations.
markdown
Copy code

### Customization

1. **USERNAME**: Replace `USERNAME` in the clone URL with your actual GitHub username.
2. **License**: If you have a specific license, make sure to include it in the `LICENSE` file and update the reference in the README.
3. **Add any additional sections** as needed, such as FAQs or troubleshooting tips.

Feel free to edit any part of this README to better fit your application!



