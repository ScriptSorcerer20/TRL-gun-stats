let selectedWeapon = null;  // Store the selected weapon's data
let selectedOperative = null;  // Store the selected operative's data
let weapons = [];  // This will be populated by the fetched JSON data
let globalModifiers = []; // This will be populated by the fetched JSON data
let selectedGunTypes = [];  // Track selected gun types for filtering
let headshotMultiplier = 0;
let headshotBaseApplied = false;


// Function to fetch operatives data from JSON
function fetchOperativesData() {
    fetch('/static/json/operative.json')
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
    // Add the placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";  // Empty value for the placeholder
    placeholderOption.text = "Select an operative";
    select.appendChild(placeholderOption);  // Add the placeholder option
    operatives.forEach(operative => {
        const option = document.createElement('option');
        option.value = operative.id;
        option.text = operative.name;
        select.appendChild(option);
    });
    // Attach event listener to detect when an operative is selected
    select.addEventListener('change', (event) => {
        const selectedOperativeId = event.target.value;
        // If placeholder is selected, don't proceed
        if (!selectedOperativeId) {
            document.getElementById('operative-modifiers').innerHTML = '';
            return;  // Do nothing when the placeholder is selected
        }
        selectedOperative = operatives.find(op => op.id === selectedOperativeId);
        if (selectedOperative) {
            updateOperativeBuffs(selectedOperative);  // Update operative modifiers on valid selection
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
            input.dataset.buffs = mod.buffs ? JSON.stringify(mod.buffs) : '';  // Store buffs if available
            // Set checkbox to be unchecked by default
            input.checked = false;
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
            createGunTypeCheckboxes();  // Create the gun type checkboxes after loading the weapons
        })
        .catch(error => console.error('Error fetching weapons data:', error));
}

// Function to populate the weapon dropdown
function populateWeapons() {
    const select = document.getElementById('weapon-select');
    select.innerHTML = ""; // Clear any existing options
    // Add the placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";  // Empty value for the placeholder
    placeholderOption.text = "Select a Weapon";
    select.appendChild(placeholderOption);  // Add the placeholder option
    // Populate with actual weapons
    weapons.forEach(weapon => {
        const option = document.createElement('option');
        option.value = weapon.id;
        option.text = weapon.name;
        select.appendChild(option);
    });
    // Attach event listener to detect when a weapon is selected
    select.addEventListener('change', (event) => {
        const selectedWeaponId = parseInt(event.target.value);
        // If placeholder is selected, don't proceed
        if (!selectedWeaponId) {
            document.getElementById('weapon-stats').innerHTML = '';
            return;  // Do nothing when the placeholder is selected
        }
        selectedWeapon = weapons.find(weapon => weapon.id === selectedWeaponId);
        if (selectedWeapon) {
            updateWeaponStats(selectedWeapon);  // Update stats on valid selection
            applyModifiers(); // Apply Modifiers on valid selection
        }
    });
}

// Function to display the selected weapon's stats in a table-like format
function updateWeaponStats(weapon) {
    const statsElement = document.getElementById('weapon-stats');
    statsElement.innerHTML = `
        <table class="weapon-stats-table horizontal-table">
            <tr>
                <th>Name</th>
                <th>Damage</th>
                <th>RPM</th>
                <th>Mag Size</th>
                <th>Reload Time</th>
                <th>DPS</th>
                <th>DPM</th>
                <th>Average DPS</th> <!-- New Column for Average DPS -->
            </tr>
            <tr>
                <td>${weapon.name}</td>
                <td>${(weapon.damage * weapon.damage_multiplier).toFixed(2)}</td>
                <td>${weapon.rpm}</td>
                <td>${weapon.mag_size}</td>
                <td>${weapon.reload_time.toFixed(2)} seconds</td>
                <td id="dps-value"></td>
                <td id="dpm-value"></td>
                <td id="average-dps-value"></td> <!-- Cell for Average DPS -->
            </tr>
        </table>
    `;
    // Store values for further calculations
    const damage = weapon.damage * weapon.damage_multiplier;
    const rpm = weapon.rpm;
    const magSize = weapon.mag_size;
    const reloadTime = weapon.reload_time;
    // Calculate DPS, DPM, and Average DPS
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime);
}

// Function to display the modified weapon's stats in the table format
function updateModifiedWeaponStats(damage, rpm, reloadTime) {
    const statsElement = document.getElementById('weapon-stats');
    statsElement.innerHTML = `
        <table class="weapon-stats-table horizontal-table">
            <tr>
                <th>Name</th>
                <th>Modified Damage</th>
                <th>Modified RPM</th>
                <th>Mag Size</th>
                <th>Modified Reload Time</th>
                <th>DPS</th>
                <th>DPM</th>
                <th>Average DPS</th>
            </tr>
            <tr>
                <td>${selectedWeapon.name}</td>
                <td>${damage.toFixed(2)}</td>
                <td>${rpm.toFixed(2)}</td>
                <td>${selectedWeapon.mag_size}</td>
                <td>${reloadTime.toFixed(2)} seconds</td>
                <td id="dps-value"></td>
                <td id="dpm-value"></td>
                <td id="average-dps-value"></td>
            </tr>
        </table>
    `;
    // Recalculate and update DPS, DPM, and Average DPS
    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);
}

// Function to calculate DPS, DPM, and Average DPS, and update the values in the table
function calculateDPSAndDPM(damage, rpm, magSize, reloadTime) {
    const rps = rpm / 60; // Rounds per second
    let dps = damage * rps;
    const reloadTimeMin = reloadTime / 60;
    let dpm = (magSize * damage) / (reloadTimeMin + (magSize / rpm));
    let averageDPS = dpm / 60; // New Average DPS Calculation
    // Update DPS, DPM, and Average DPS values in the table
    document.getElementById('dps-value').innerText = dps.toFixed(2);
    document.getElementById('dpm-value').innerText = dpm.toFixed(2);
    document.getElementById('average-dps-value').innerText = averageDPS.toFixed(2); // Update the Average DPS in the table
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
    const modifiersContainer = document.getElementById('modifiers-container');
    modifiersContainer.innerHTML = ''; // Clear existing modifiers
    const createModifierSection = (title, modifierList, sectionId) => {
        const section = document.createElement('div');
        section.id = sectionId; // Set an ID for the section
        section.className = sectionId === 'abilities' ? 'abilities' : ''; // Only for abilities
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
                input.dataset.buffs = JSON.stringify(mod.buffs);
            } else {
                input.value = mod.value;
                input.dataset.type = mod.type;
            }
            label.appendChild(input);
            label.appendChild(document.createTextNode(mod.label));
            // Create a container for each modifier item
            const modifierItem = document.createElement('div');
            modifierItem.className = 'modifier-item'; // Add the class for styling
            modifierItem.appendChild(label);
            section.appendChild(modifierItem); // Append the modifier item to the section
        });
        return section;
    };
    // Create a container for all modifiers
    const container = document.createElement('div');
    container.id = 'modifiers';
    // Populate sections
    container.appendChild(createModifierSection('Item Buffs', modifiers.itemBuffs, 'items'));
    container.appendChild(createModifierSection('Perks', modifiers.operativePerks, 'perks'));
    modifiersContainer.appendChild(container); // Append item and perks container
    // Create and append abilities section
    const abilitiesSection = createModifierSection('Abilities', modifiers.abilityPerks, 'abilities');
    modifiersContainer.appendChild(abilitiesSection); // Append abilities section
    // Add event listener to recalculate DPS/DPM when modifiers are toggled
    modifiersContainer.addEventListener('change', applyModifiers);
}

// Function to apply the modifiers and recalculate damage, RPM, and reloadTime
function applyModifiers() {
    if (!selectedWeapon) return;
    // Base stats
    let baseDamage = selectedWeapon.damage;
    let baseRpm = selectedWeapon.rpm;
    let baseReloadTime = selectedWeapon.reload_time;
    // Modifiers initialization
    let damageModifier = {additive: 0, multiplicative: 1};
    let rpmModifier = {additive: 0, multiplicative: 1};
    let reloadTimeModifier = {additive: 0, multiplicative: 1};
    headshotMultiplier = 0;  // Reset headshot multiplier
    headshotBaseApplied = false;


    // Function to process global modifiers
    const processModifier = (mod) => {
        // Ensure guntype is now an array of tags
        const weaponTags = selectedWeapon.guntype;  // This is now an array like ["PISTOL", "WW2", "SECONDARY"] -> Do not write "guntype": "PISTOL", write "guntype": ["PISTOL"]
        // Skip the modifier if it should not apply to any of the current weapon's tags
        if (mod.appliesNotTo && weaponTags.includes(mod.appliesNotTo)) {
            return;  // Skip this modifier
        }
        // Check if the modifier applies to any of the current weapon's tags
        if (mod.appliesTo && !weaponTags.includes(mod.appliesTo)) {
            return;  // Skip this modifier if it does not apply to the selected weapon type
        }
        if (mod.dataset.type === 'multiplicative-headshot') {
            if (!headshotBaseApplied) {
                // Automatically check and apply headshot base
                const baseHeadshotModifier = document.querySelector("#modifiers input[data-type='multiplicative-headshot-base']");
                if (baseHeadshotModifier && !baseHeadshotModifier.checked) {
                    baseHeadshotModifier.checked = true;
                    headshotMultiplier += parseFloat(baseHeadshotModifier.value) - 1;
                    headshotBaseApplied = true;
                }
            }
            headshotMultiplier += parseFloat(mod.value) - 1;
        } else if (mod.dataset.type === 'multiplicative-headshot-base') {
            if (!headshotBaseApplied) {
                headshotMultiplier += parseFloat(mod.value) - 1;
                headshotBaseApplied = true;
            }
        } else {
            // Process other modifiers
            applyBuff(mod, rpmModifier, reloadTimeModifier, damageModifier);
        }
        // Handle modifiers with multiple buffs
        if (mod.dataset.buffs) {
            const buffs = JSON.parse(mod.dataset.buffs);
            buffs.forEach(buff => {
                applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier);
            });
        } else {
            const modType = mod.dataset.type;
            const modValue = parseFloat(mod.value);
            const singleBuff = {
                type: modType === 'multiplicative' ? 'multiplicative' : 'additive',
                buffType: modType,
                value: modValue
            };
            if (mod.id.includes('damage')) {
                singleBuff.type = 'damage';
            } else if (mod.id.includes('rpm')) {
                singleBuff.type = 'rpm';
            } else if (mod.id.includes('reload')) {
                singleBuff.type = 'reloadTime';
            }
            applyBuff(singleBuff, rpmModifier, reloadTimeModifier, damageModifier);
        }
    };

    // Function to process operative-specific modifiers
    const processOperativeModifier = (mod) => {
        // Ensure guntype is now an array of tags
        const weaponTags = selectedWeapon.guntype;  // This is now an array like ["PISTOL", "WW2", "SECONDARY"]
        // Skip the modifier if it should not apply to any of the current weapon's tags
        if (mod.appliesNotTo && weaponTags.includes(mod.appliesNotTo)) {
            return;  // Skip this modifier
        }
        // Check if the modifier applies to any of the current weapon's tags
        if (mod.appliesTo && !weaponTags.includes(mod.appliesTo)) {
            return;  // Skip this modifier if it does not apply to the selected weapon type
        }
        // Handle operative modifiers with multiple buffs
        if (mod.buffs) {
            mod.buffs.forEach(buff => {
                applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier);
            });
        } else {
            const modValue = parseFloat(mod.value);
            const modType = mod.type || 'additive';

            const singleBuff = {
                type: mod.id.includes('damage') ? 'damage' : mod.id.includes('rpm') ? 'rpm' : 'reloadTime',
                buffType: modType === 'multiplicative' ? 'multiplicative' : 'additive',
                value: modValue
            };

            applyBuff(singleBuff, rpmModifier, reloadTimeModifier, damageModifier);
        }
    };
    // Process ability modifiers
    const abilitiesSection = document.getElementById('abilities');
    abilitiesSection.querySelectorAll('input:checked').forEach(mod => {
        processModifier(mod);  // Process the ability modifier the same way as global modifiers
    });
    const modifiersContainer = document.getElementById('modifiers');
    modifiersContainer.removeEventListener('change', applyModifiers);
    // Process global modifiers
    document.querySelectorAll('#modifiers input:checked').forEach(mod => {
        processModifier(mod);
    });
    // Re-apply listener after change
    modifiersContainer.addEventListener('change', applyModifiers);
    // Process operative-specific modifiers that are checked
    const operativeSection = document.getElementById('operative-modifiers');
    operativeSection.querySelectorAll('input:checked').forEach(mod => {
        if (selectedOperative && selectedOperative.modifiers) {
            const modObj = selectedOperative.modifiers.find(m => m.id === mod.id);
            if (modObj) {
                processOperativeModifier(modObj);
            }
        }
    });

    // Step 1: Calculate final damage
    let damage = baseDamage; // Reset to base damage

    // Step 2: Apply multiplicative damage modifiers
    damage *= damageModifier.multiplicative;

    // Step 3: Apply headshot multiplicative damage modifiers
    if (headshotMultiplier > 0) {
        damage *= (1 + headshotMultiplier);
    }

    // Step 4: Apply additive damage modifiers
    damage += damageModifier.additive;

    // Step 5: Apply the weapon's damage multiplier
    damage *= selectedWeapon.damage_multiplier;

    // Calculate other modified stats
    let rpm = baseRpm * rpmModifier.multiplicative + rpmModifier.additive;
    let reloadTime = baseReloadTime * reloadTimeModifier.multiplicative + reloadTimeModifier.additive;

    // Safeguard: Reload time cannot go below 0.1 seconds
    if (reloadTime < 0.1) {
        reloadTime = 0.1;
    }

    // Calculate and update DPS, DPM, and average DPS
    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);
    updateModifiedWeaponStats(damage, rpm, reloadTime);
}

// Function to apply individual buffs, with headshot handling
function applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier) {
    const {type, buffType, value} = buff;
    // Handle headshot multipliers
    if (buffType === 'multiplicative-headshot-base' && !headshotBaseApplied) {
        headshotMultiplier = value - 1;
        headshotBaseApplied = true;
        return;
    }
    if (buffType === 'multiplicative-headshot') {
        headshotMultiplier += value - 1;
        return;
    }
    // Apply buffs based on the stat being modified
    if (type === 'rpm') {
        if (buffType === 'multiplicative') rpmModifier.multiplicative *= value;
        else if (buffType === 'additive') rpmModifier.additive += value;
    } else if (type === 'reloadTime') {
        if (buffType === 'multiplicative') reloadTimeModifier.multiplicative *= value;
        else if (buffType === 'additive') reloadTimeModifier.additive += value;
    } else if (type === 'damage' && damageModifier) {
        if (buffType === 'multiplicative') damageModifier.multiplicative *= value;
        else if (buffType === 'additive') damageModifier.additive += value;
    }
}

// Modify the existing filterWeapons function to consider gun type checkboxes
function filterWeapons() {
    const input = document.getElementById('weapon-search').value.toLowerCase();
    const weaponSelect = document.getElementById('weapon-select');
    const options = weaponSelect.getElementsByTagName('option');
    // Get selected guntype filters
    const selectedGuntypes = Array.from(document.querySelectorAll('#guntype-filters input:checked'))
        .map(checkbox => checkbox.value);
    let firstVisibleOption = null; // Variable to track the first matching option
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent || options[i].innerText;
        const weaponId = parseInt(options[i].value);  // Get the weapon ID
        const weapon = weapons.find(w => w.id === weaponId);  // Find the corresponding weapon
        if (!weapon) continue;  // Skip if the weapon is not found (for safety)
        // Check if the option matches the search query and the selected guntype filters
        const matchesSearch = optionText.toLowerCase().indexOf(input) > -1;
        const matchesGuntypes = selectedGuntypes.length === 0 || selectedGuntypes.every(type => weapon.guntype.includes(type));
        // Show or hide options based on both search and guntype filters
        if (matchesSearch && matchesGuntypes) {
            options[i].style.display = '';  // Show matching option
            if (!firstVisibleOption) {
                firstVisibleOption = options[i]; // Save the first visible option
            }
        } else {
            options[i].style.display = 'none';  // Hide non-matching option
        }
    }
    // Automatically select the first visible matching option
    if (firstVisibleOption) {
        weaponSelect.value = firstVisibleOption.value;
        // Manually trigger the 'change' event after auto-selecting the first option
        weaponSelect.dispatchEvent(new Event('change'));
    }
}

// Function to filter operatives in the dropdown based on search input
function filterOperatives() {
    const input = document.getElementById('operative-search').value.toLowerCase();
    const operativeSelect = document.getElementById('operative-select');
    const options = operativeSelect.getElementsByTagName('option');
    let firstVisibleOption = null; // Track the first matching option
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent || options[i].innerText;
        // Check if the option matches the search query
        if (optionText.toLowerCase().indexOf(input) > -1) {
            options[i].style.display = '';  // Show matching option
            if (!firstVisibleOption) {
                firstVisibleOption = options[i]; // Save the first visible option
            }
        } else {
            options[i].style.display = 'none';  // Hide non-matching option
        }
    }
    // Automatically select the first visible matching option
    if (firstVisibleOption) {
        operativeSelect.value = firstVisibleOption.value;
        // Manually trigger the 'change' event after auto-selecting the first option
        operativeSelect.dispatchEvent(new Event('change'));
    }
}

// Function to dynamically create gun type checkboxes based on available gun types in the weapon data
function createGunTypeCheckboxes() {
    const gunTypeFiltersContainer = document.getElementById('gun-type-filters');
    gunTypeFiltersContainer.innerHTML = '';  // Clear existing checkboxes
    const gunTypesSet = new Set();  // Use a Set to store unique gun types from the weapon data
    // Extract unique gun types from the weapon data
    weapons.forEach(weapon => {
        weapon.guntype.forEach(type => gunTypesSet.add(type));  // Add each gun type to the Set
    });
    // Create checkboxes for each unique gun type
    gunTypesSet.forEach(gunType => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = gunType;
        input.className = 'gun-type-checkbox';
        // Add event listener to filter weapons when checkbox is checked/unchecked
        input.addEventListener('change', () => {
            const selectedCheckboxes = Array.from(document.querySelectorAll('.gun-type-checkbox:checked'));
            selectedGunTypes = selectedCheckboxes.map(checkbox => checkbox.value);
            filterWeapons();  // Re-filter weapons based on the selected gun types
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(gunType));
        gunTypeFiltersContainer.appendChild(label);
        gunTypeFiltersContainer.appendChild(document.createElement('br'));
    });
}
// Attach event listeners to the search inputs
document.getElementById('weapon-search').addEventListener('keyup', filterWeapons);
document.getElementById('operative-search').addEventListener('keyup', filterOperatives);
// Add event listeners to the guntype checkboxes
document.querySelectorAll('#guntype-filters input').forEach(checkbox => {
    checkbox.addEventListener('change', filterWeapons);
});

// Call the fetch function to load the data and populate the dropdown on page load
fetchWeaponsData();
fetchModifiers();
fetchOperativesData()