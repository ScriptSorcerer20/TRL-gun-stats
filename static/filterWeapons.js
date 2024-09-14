let selectedWeapon = null;  // Store the selected weapon's data
let weapons = [];  // This will be populated by the fetched JSON data

// Function to fetch weapons data from JSON
function fetchWeaponsData() {
    fetch('static/data.json')  // Adjust the path to the actual location of your JSON file
        .then(response => response.json())
        .then(data => {
            weapons = data;  // Store the fetched data in the global 'weapons' variable
            populateWeapons();  // Populate the weapon dropdown once data is loaded
        })
        .catch(error => console.error('Error fetching weapons data:', error));
}

// Function to populate the select element with weapons
function populateWeapons() {
    const select = document.getElementById('weapon-select');
    select.innerHTML = ""; // Clear any existing options

    weapons.forEach(weapon => {
        const option = document.createElement('option');
        option.value = weapon.id;
        option.text = weapon.name;
        select.appendChild(option);
    });

    // Attach event listener to detect when a weapon is selected
    select.addEventListener('change', (event) => {
        const selectedWeaponId = parseInt(event.target.value);
        selectedWeapon = weapons.find(weapon => weapon.id === selectedWeaponId);
        if (selectedWeapon) {
            updateWeaponStats(selectedWeapon);  // Update stats on selection
        }
    });
}

// Function to display the selected weapon's stats in the UI
function updateWeaponStats(weapon) {
    // Example: Display the stats in variables or in the HTML
    const statsElement = document.getElementById('weapon-stats');
    statsElement.innerHTML = `
        <p>Name: ${weapon.name}</p>
        <p>Damage: ${weapon.damage}</p>
        <p>RPM: ${weapon.rpm}</p>
        <p>Mag Size: ${weapon.mag_size}</p>
        <p>Reload Time: ${weapon.reload_time}</p>
    `;

    // You can store the values for further calculations:
    let damage = weapon.damage;
    let rpm = weapon.rpm;
    let magSize = weapon.mag_size;
    let reloadTime = weapon.reload_time;

    // Calculate DPS and DPM here or trigger a calculation function
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime);
}

// Example DPS and DPM calculation function
function calculateDPSAndDPM(damage, rpm, magSize, reloadTime) {
    const rps = rpm / 60; // Rounds per second
    const dps = damage * rps;
    const reloadTimeMin = reloadTime / 60;
    const dpm = (magSize * damage) / (reloadTimeMin + (magSize / rpm));

    // Display the calculated stats
    const resultElement = document.getElementById('calculated-stats');
    resultElement.innerHTML = `
        <p>DPS: ${dps.toFixed(2)}</p>
        <p>DPM: ${dpm.toFixed(2)}</p>
    `;
}

// Call the fetch function to load the data and populate the dropdown on page load
fetchWeaponsData();