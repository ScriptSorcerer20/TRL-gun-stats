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
    modifiersContainer.appendChild(createModifierSection('Abilities', modifiers.abilityPerks));

    // Add event listener to recalculate DPS/DPM when modifiers are toggled
    modifiersContainer.addEventListener('change', applyModifiers);
}

// Function to apply the modifiers and recalculate DPS and DPM
// Function to apply the modifiers and recalculate damage, RPM, and reloadTime
// Function to apply the modifiers and recalculate damage, RPM, and reloadTime
function applyModifiers() {
    if (!selectedWeapon) return;

    // Get the base stats from the selected weapon
    let baseDamage = selectedWeapon.damage;
    let baseRpm = selectedWeapon.rpm;
    let baseReloadTime = selectedWeapon.reload_time;

    // Initialize the modifier objects
    let damageModifier = {additive: 0, multiplicative: 1, flat: 0};
    let rpmModifier = {additive: 0, multiplicative: 1};
    let reloadTimeModifier = {additive: 0, multiplicative: 1};

    // Collect checked modifier values
    document.querySelectorAll('#modifiers input:checked').forEach(mod => {
        const modType = mod.dataset.type;
        const modValue = parseFloat(mod.value);
        // Apply damage modifiers
        if (mod.id.includes('damage')) {
            if (modType === 'multiplicative') damageModifier.multiplicative *= modValue;  // Multiplicative
            else if (modType === 'additive') damageModifier.additive += modValue;       // Additive
        }

        // Apply RPM modifiers
        if (mod.id.includes('rpm')) {
            if (modType === 'multiplicative') rpmModifier.multiplicative *= modValue;
            else if (modType === 'additive') rpmModifier.additive += modValue;
        }

        // Apply Reload Time modifiers
        if (mod.id.includes('reloadTime')) {
            if (modType === 'multiplicative') reloadTimeModifier.multiplicative *= modValue;
            else if (modType === 'additive') reloadTimeModifier.additive += modValue;
        }
    });

    // Apply the damage modifiers
    let damage = baseDamage * damageModifier.multiplicative;  // First apply multiplicative modifiers// Then apply percentage-based additive modifiers
    damage += damageModifier.additive;                            // Finally, add the flat additive modifier (e.g., HE Rounds)

    // Apply the RPM modifiers
    let rpm = baseRpm * rpmModifier.multiplicative;
    rpm = rpm + (rpm * rpmModifier.additive);

    // Apply the reload time modifiers
    let reloadTime = baseReloadTime * reloadTimeModifier.multiplicative;
    reloadTime = reloadTime + (reloadTime * reloadTimeModifier.additive);

    // Recalculate DPS and DPM with the modified stats
    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);

    // Update the displayed weapon stats with the modified values
    updateModifiedWeaponStats(damage, rpm, reloadTime);
}

// Function to calculate DPS and DPM with optional modifiers
function calculateDPSAndDPM(damage, rpm, magSize, reloadTime) {
    const rps = rpm / 60; // Rounds per second
    let dps = damage * rps;
    const reloadTimeMin = reloadTime / 60;
    let dpm = (magSize * damage) / (reloadTimeMin + (magSize / rpm));

    // Display the calculated stats
    const resultElement = document.getElementById('calculated-stats');
    resultElement.innerHTML = `
        <p>DPS: ${dps.toFixed(2)}</p>
        <p>DPM: ${dpm.toFixed(2)}</p>
    `;
}

// Function to display the modified weapon's stats in the UI
function updateModifiedWeaponStats(damage, rpm, reloadTime) {
    const statsElement = document.getElementById('weapon-stats');
    statsElement.innerHTML = `
        <p>Modified Damage: ${damage.toFixed(2)}</p>
        <p>Modified RPM: ${rpm.toFixed(2)}</p>
        <p>Mag Size: ${selectedWeapon.mag_size}</p>
        <p>Modified Reload Time: ${reloadTime.toFixed(2)} seconds</p>
    `;
}

// Call the fetch function to load the data and populate the dropdown on page load
fetchWeaponsData();
fetchModifiers();