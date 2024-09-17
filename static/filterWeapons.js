let selectedWeapon = null;  // Store the selected weapon's data
let weapons = [];  // This will be populated by the fetched JSON data
let selectedOperative = null;  // Store the selected operative's data
let globalModifiers = [];

// Function to fetch operatives data from JSON
function fetchOperativesData() {
    fetch('static/json/operative.json')  // Adjust the path to the actual location of your JSON file
        .then(response => response.json())
        .then(data => {
            populateOperatives(data.operatives);  // Populate the operative dropdown once data is loaded
        })
        .catch(error => console.error('Error fetching operatives data:', error));
}

// Function to populate the select element with operatives
function populateOperatives(operatives) {
    const select = document.getElementById('operative-select');
    select.innerHTML = ""; // Clear any existing options

    operatives.forEach(operative => {
        const option = document.createElement('option');
        option.value = operative.id;
        option.text = operative.name;
        select.appendChild(option);
    });

    // Attach event listener to detect when an operative is selected
    select.addEventListener('change', (event) => {
        const selectedOperativeId = event.target.value;
        selectedOperative = operatives.find(op => op.id === selectedOperativeId);
        if (selectedOperative) {
            updateOperativeBuffs(selectedOperative)
        }
    });
}

function updateOperativeBuffs(operative) {
    const operativeModifiers = operative.modifiers || [];

    // Remove previously added operative-specific modifiers
    const operativeSection = document.getElementById('operative-modifiers');
    operativeSection.innerHTML = '';  // Clear existing operative modifiers

    // If the operative has specific modifiers, show them
    if (operativeModifiers.length > 0) {
        operativeModifiers.forEach(mod => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = mod.id;
            input.value = mod.value;
            input.dataset.type = mod.type;

            // Automatically check the box if you want it enabled by default
            input.checked = true;

            label.appendChild(input);
            label.appendChild(document.createTextNode(mod.label));
            operativeSection.appendChild(label);
            operativeSection.appendChild(document.createElement('br'));
        });
    }

    // Make sure that each operative-specific modifier checkbox triggers recalculation when changed
    operativeSection.addEventListener('change', applyModifiers);

    // Trigger recalculation once the operative buffs are displayed
    applyModifiers();
}


// Function to fetch weapons data from JSON
function fetchWeaponsData() {
    fetch('static/json/data.json')  // Adjust the path to the actual location of your JSON file
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
        <p>Damage: ${weapon.damage * weapon.damage_multiplier}</p>
        <p>RPM: ${weapon.rpm}</p>
        <p>Mag Size: ${weapon.mag_size}</p>
        <p>Reload Time: ${weapon.reload_time}</p>
    `;

    // Store values for further calculations
    const damage = weapon.damage * weapon.damage_multiplier;
    const rpm = weapon.rpm;
    const magSize = weapon.mag_size;
    const reloadTime = weapon.reload_time;

    // Calculate DPS and DPM initially without modifiers
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime);
}

// Function to fetch and populate modifiers from the JSON file
function fetchModifiers() {
    fetch('static/json/modifiers.json')  // Adjust the path to your JSON file
        .then(response => response.json())
        .then(data => {
            globalModifiers = data; // Save global modifiers for future use
            populateModifiers(data);  // Populate the modifiers in the UI
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

            // Check if the modifier has multiple buffs
            if (mod.buffs) {
                input.dataset.buffs = JSON.stringify(mod.buffs);  // Store buffs data as a string in data-buffs
            } else {
                input.value = mod.value;
                input.dataset.type = mod.type;  // Store if it's additive or multiplicative
            }

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
    modifiersContainer.appendChild(createModifierSection('Perks', modifiers.operativePerks));

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

    // Base stats
    let baseDamage = selectedWeapon.damage * selectedWeapon.damage_multiplier;
    let baseRpm = selectedWeapon.rpm;
    let baseReloadTime = selectedWeapon.reload_time;

    // Modifiers initialization
    let damageModifier = { additive: 0, multiplicative: 1 };
    let rpmModifier = { additive: 0, multiplicative: 1 };
    let reloadTimeModifier = { additive: 0, multiplicative: 1 };

    // Function to process individual modifiers
    const processModifier = (mod, rpmModifier, reloadTimeModifier, damageModifier) => {
        // Handle multi-buff modifiers
        if (mod.dataset.buffs) {
            const buffs = JSON.parse(mod.dataset.buffs);
            buffs.forEach(buff => {
                applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier);
            });
        } else {
            // Single buff modifier
            const singleBuff = {
                type: mod.dataset.type === 'multiplicative' ? 'multiplicative' : 'additive',
                value: parseFloat(mod.value)
            };

            // Apply the single buff depending on its stat
            if (mod.id.includes('damage')) applyBuff({ stat: 'damage', ...singleBuff }, rpmModifier, reloadTimeModifier, damageModifier);
            if (mod.id.includes('rpm')) applyBuff({ stat: 'rpm', ...singleBuff }, rpmModifier, reloadTimeModifier, damageModifier);
            if (mod.id.includes('reload')) applyBuff({ stat: 'reloadTime', ...singleBuff }, rpmModifier, reloadTimeModifier, damageModifier);
        }
    };

    // Process global modifiers
    document.querySelectorAll('#modifiers input:checked').forEach(mod => {
        processModifier(mod, rpmModifier, reloadTimeModifier, damageModifier);
    });

    // Process operative-specific modifiers
    if (selectedOperative) {
        document.querySelectorAll('#operative-modifiers input:checked').forEach(mod => {
            processModifier(mod, rpmModifier, reloadTimeModifier, damageModifier);
        });
    }

    // Recalculate with applied modifiers
    let damage = baseDamage * damageModifier.multiplicative;
    damage += damageModifier.additive;

    let rpm = baseRpm * rpmModifier.multiplicative;
    rpm += rpm * rpmModifier.additive;

    let reloadTime = baseReloadTime * reloadTimeModifier.multiplicative;
    reloadTime += reloadTime * reloadTimeModifier.additive;

    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);
    updateModifiedWeaponStats(damage, rpm, reloadTime);
}



// Helper function to apply individual buffs
function applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier = null) {
    const {stat, type, value} = buff;

    // Apply buffs based on the stat being modified
    if (stat === 'rpm') {
        if (type === 'multiplicative') rpmModifier.multiplicative *= value;
        else if (type === 'additive') rpmModifier.additive += value;
    }

    if (stat === 'reloadTime') {
        if (type === 'multiplicative') reloadTimeModifier.multiplicative *= value;
        else if (type === 'additive') reloadTimeModifier.additive += value;
    }

    // Apply damage buffs
    if (stat === 'damage' && damageModifier) {
        if (type === 'multiplicative') damageModifier.multiplicative *= value;
        else if (type === 'additive') damageModifier.additive += value;
    }
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
fetchOperativesData()