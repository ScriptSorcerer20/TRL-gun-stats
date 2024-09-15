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
    const statsElement = document.getElementById('weapon-stats');
    statsElement.innerHTML = `
        <p>Name: ${weapon.name}</p>
        <p>Damage: ${weapon.damage}</p>
        <p>RPM: ${weapon.rpm}</p>
        <p>Mag Size: ${weapon.mag_size}</p>
        <p>Reload Time: ${weapon.reload_time}</p>
    `;

    // Store values for further calculations
    const damage = weapon.damage;
    const rpm = weapon.rpm;
    const magSize = weapon.mag_size;
    const reloadTime = weapon.reload_time;

    // Calculate DPS and DPM initially without modifiers
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime);
}

// Function to fetch and populate modifiers from the JSON file
function fetchModifiers() {
    fetch('static/modifiers.json')  // Adjust the path to your JSON file
        .then(response => response.json())
        .then(data => {
            populateModifiers(data);
        })
        .catch(error => console.error('Error fetching modifiers:', error));
}

// Function to dynamically populate modifiers into the HTML
function populateModifiers(modifiers) {
    const modifiersContainer = document.getElementById('modifiers');

    const createModifierSection = (title, modifierList) => {
        const section = document.createElement('div');
        const header = document.createElement('h3');
        header.textContent = title;
        section.appendChild(header);

        modifierList.forEach(mod => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = mod.id;
            input.value = mod.value;
            input.dataset.type = mod.type;  // Store if it's additive or multiplicative
            label.appendChild(input);
            label.appendChild(document.createTextNode(mod.label));
            section.appendChild(label);
            section.appendChild(document.createElement('br'));
        });

        return section;
    };

    // Clear any existing modifiers
    modifiersContainer.innerHTML = '';

    // Add Item Buffs
    modifiersContainer.appendChild(createModifierSection('Item Buffs', modifiers.itemBuffs));

    // Add Operative Perks
    modifiersContainer.appendChild(createModifierSection('Operative Perks', modifiers.operativePerks));

    // Add Ability Perks
    modifiersContainer.appendChild(createModifierSection('Ability Perks', modifiers.abilityPerks));

    // Add event listener to recalculate DPS/DPM when modifiers are toggled
    modifiersContainer.addEventListener('change', applyModifiers);
}

// Function to apply the modifiers and recalculate DPS and DPM
function applyModifiers() {
    if (!selectedWeapon) return;

    const damage = selectedWeapon.damage;
    let rpm = selectedWeapon.rpm;
    const magSize = selectedWeapon.mag_size;
    const reloadTime = selectedWeapon.reload_time;

    let dpsModifier = { additive: 0, multiplicative: 1 };
    let dpmModifier = { additive: 0, multiplicative: 1 };
    let rpmModifier = { additive: 0, multiplicative: 1 };

    // Collect checked modifier values
    document.querySelectorAll('#modifiers input:checked').forEach(mod => {
        const modType = mod.dataset.type;
        const modValue = parseFloat(mod.value);

        if (mod.id.includes('dps')) {
            if (modType === 'additive') dpsModifier.additive += modValue;
            else dpsModifier.multiplicative *= modValue;
        }
        if (mod.id.includes('dpm')) {
            if (modType === 'additive') dpmModifier.additive += modValue;
            else dpmModifier.multiplicative *= modValue;
        }
        if (mod.id.includes('rpm')) {
            if (modType === 'additive') rpmModifier.additive += modValue;
            else rpmModifier.multiplicative *= modValue;
        }
    });

    // Apply RPM modifiers
    rpm = rpm + (rpm * rpmModifier.additive);
    rpm = rpm * rpmModifier.multiplicative;

    // Recalculate DPS and DPM with modifiers
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime, dpsModifier, dpmModifier);
}

// Function to calculate DPS, DPM, and RPS with optional modifiers
// Function to calculate DPS and DPM with optional modifiers
function calculateDPSAndDPM(damage, rpm, magSize, reloadTime, dpsModifier = { additive: 0, multiplicative: 1 }, dpmModifier = { additive: 0, multiplicative: 1 }) {
    const rps = rpm / 60; // Rounds per second
    let dps = damage * rps;
    const reloadTimeMin = reloadTime / 60;
    let dpm = (magSize * damage) / (reloadTimeMin + (magSize / rpm));

    // Apply modifiers
    dps = dps + (dps * dpsModifier.additive);
    dps = dps * dpsModifier.multiplicative;
    dpm = dpm + (dpm * dpmModifier.additive);
    dpm = dpm * dpmModifier.multiplicative;

    // Display the calculated stats
    const resultElement = document.getElementById('calculated-stats');
    resultElement.innerHTML = `
        <p>DPS: ${dps.toFixed(2)}</p>
        <p>DPM: ${dpm.toFixed(2)}</p>
    `;
}


// Call the fetch function to load the data and populate the dropdown on page load
fetchWeaponsData();
fetchModifiers();
