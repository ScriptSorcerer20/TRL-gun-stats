let selectedWeapon = null;
let selectedOperative = null;
let weapons = [];
let globalModifiers = [];
let selectedGunTypes = [];
let headshotMultiplier = 0;
let headshotBaseApplied = false;
let ignoreHeadshots = false;

//fetch operatives data from JSON
function fetchOperativesData() {
    fetch('/trlstats/static/json/operative.json')
        .then(response => response.json())
        .then(data => {
            populateOperatives(data.operatives);
        })
        .catch(error => console.error('Error fetching operatives data:', error));
}

//populate the select element with operatives
function populateOperatives(operatives) {
    const select = document.getElementById('operative-select');
    select.innerHTML = "";
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";  // Empty value for the placeholder
    placeholderOption.text = "Select an operative";
    select.appendChild(placeholderOption);
    operatives.forEach(operative => {
        const option = document.createElement('option');
        option.value = operative.id;
        option.text = operative.name;
        select.appendChild(option);
    });
    select.addEventListener('change', (event) => {
        const selectedOperativeId = event.target.value;
        if (!selectedOperativeId) {
            document.getElementById('operative-modifiers').innerHTML = '';
            return;
        }
        selectedOperative = operatives.find(op => op.id === selectedOperativeId);
        if (selectedOperative) {
            updateOperativeBuffs(selectedOperative);
        }
    });
}

function updateOperativeBuffs(operative) {
    const operativeModifiers = operative.modifiers || [];
    const operativeSection = document.getElementById('operative-modifiers');
    operativeSection.innerHTML = '';
    if (operativeModifiers.length > 0) {
        operativeModifiers.forEach(mod => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = mod.id;
            input.value = mod.value;
            input.dataset.type = mod.type;
            input.dataset.buffs = mod.buffs ? JSON.stringify(mod.buffs) : '';
            input.checked = false;
            label.appendChild(input);
            label.appendChild(document.createTextNode(mod.label));
            operativeSection.appendChild(label);
            operativeSection.appendChild(document.createElement('br'));
        });
    }
    operativeSection.addEventListener('change', applyModifiers);
    applyModifiers();
}


//fetch weapons data from JSON
function fetchWeaponsData() {
    fetch('static/json/data.json')
        .then(response => response.json())
        .then(data => {
            weapons = data;
            populateWeapons();
            createGunTypeCheckboxes();
        })
        .catch(error => console.error('Error fetching weapons data:', error));
}

//populate the weapon dropdown
function populateWeapons() {
    const select = document.getElementById('weapon-select');
    select.innerHTML = "";
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.text = "Select a Weapon";
    select.appendChild(placeholderOption);
    weapons.forEach(weapon => {
        const option = document.createElement('option');
        option.value = weapon.id;
        option.text = weapon.name;
        select.appendChild(option);
    });
    select.addEventListener('change', (event) => {
        const selectedWeaponId = parseInt(event.target.value);
        if (!selectedWeaponId) {
            document.getElementById('weapon-stats').innerHTML = '';
            return;
        }
        selectedWeapon = weapons.find(weapon => weapon.id === selectedWeaponId);
        if (selectedWeapon) {
            updateWeaponStats(selectedWeapon);
            applyModifiers();
        }
    });
}

//display the selected weapon's stats in table
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
                <th>Average DPS</th>
            </tr>
            <tr>
                <td>${weapon.name}</td>
                <td>${(weapon.damage * weapon.damage_multiplier).toFixed(2)}</td>
                <td>${weapon.rpm}</td>
                <td>${weapon.mag_size}</td>
                <td>${weapon.reload_time.toFixed(2)} seconds</td>
                <td id="dps-value"></td>
                <td id="dpm-value"></td>
                <td id="average-dps-value"></td>
            </tr>
        </table>
    `;
    const damage = weapon.damage * weapon.damage_multiplier;
    const rpm = weapon.rpm;
    const magSize = weapon.mag_size;
    const reloadTime = weapon.reload_time;
    calculateDPSAndDPM(damage, rpm, magSize, reloadTime);
}

//display the modified weapon's stats in the table
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
    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);
}

//calculate DPS, DPM, and Average DPS, and update the values in the table
function calculateDPSAndDPM(damage, rpm, magSize, reloadTime) {
    const rps = rpm / 60; // Rounds per second
    let dps = damage * rps; //damage per second
    const reloadTimeMin = reloadTime / 60; //variable used for dpm calculation
    let dpm = (magSize * damage) / (reloadTimeMin + (magSize / rpm)); //damage per minute (including reload time)
    let averageDPS = dpm / 60; //average damage per second considering reload time and mag size
    document.getElementById('dps-value').innerText = dps.toFixed(2);
    document.getElementById('dpm-value').innerText = dpm.toFixed(2);
    document.getElementById('average-dps-value').innerText = averageDPS.toFixed(2);
}

//fetch and populate modifiers from the JSON file
function fetchModifiers() {
    fetch('static/json/modifiers.json')
        .then(response => response.json())
        .then(data => {
            globalModifiers = data;
            populateModifiers(data);
        })
        .catch(error => console.error('Error fetching modifiers:', error));
}

//populate modifiers into the HTML
function populateModifiers(modifiers) {
    const modifiersContainer = document.getElementById('modifiers-container');
    modifiersContainer.innerHTML = '';
    const createModifierSection = (title, modifierList, sectionId) => {
        const section = document.createElement('div');
        section.id = sectionId;
        const header = document.createElement('h3');
        header.textContent = title;
        section.appendChild(header);
        modifierList.forEach(mod => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = mod.id;
            if (mod.buffs) {
                input.dataset.buffs = JSON.stringify(mod.buffs);
            } else {
                input.value = mod.value;
                input.dataset.type = mod.type;
            }
            if (mod.operatives) {
                input.dataset.operatives = mod.operatives;
            }
            if (mod.appliesTo) {
                input.dataset.appliesTo = mod.appliesTo;
            }
            if (mod.appliesNotTo) {
                input.dataset.appliesNotTo = mod.appliesNotTo;
            }
            label.appendChild(input);
            label.appendChild(document.createTextNode(mod.label));
            const modifierItem = document.createElement('div');
            modifierItem.className = 'modifier-item';
            modifierItem.appendChild(label);
            section.appendChild(modifierItem);
        });
        return section;
    };
    const container = document.createElement('div');
    container.id = 'modifiers';
    container.appendChild(createModifierSection('Item Buffs', modifiers.itemBuffs, 'items'));
    container.appendChild(createModifierSection('Perks', modifiers.operativePerks, 'perks'));
    modifiersContainer.appendChild(container);
    const abilitiesSection = createModifierSection('Abilities', modifiers.abilityPerks, 'abilities');
    modifiersContainer.appendChild(abilitiesSection);
    modifiersContainer.addEventListener('change', applyModifiers);
}

function applyModifiers() {
    if (!selectedWeapon) return;
    const hasNVG = !!document.querySelector(
        "#modifiers input[id='damage-item-multiplicative-nightvision']:checked"
    );
    let baseDamage = selectedWeapon.damage;
    let baseRpm = selectedWeapon.rpm;
    let baseReloadTime = selectedWeapon.reload_time;
    let damageModifier = {additive: 0, multiplicative: 1};
    let rpmModifier = {additive: 0, multiplicative: 1};
    let reloadTimeModifier = {additive: 0, multiplicative: 1};
    headshotMultiplier = 0;
    headshotBaseApplied = false;
    ignoreHeadshots = hasNVG;

    function processModifier(mod) {
        if (mod.dataset.operatives && mod.dataset.operatives.trim() !== "" && (!selectedOperative || selectedOperative.category !== mod.dataset.operatives)) {
            return;
        }
        const weaponTags = selectedWeapon.guntype;
        const appliesNotTo = mod.dataset.appliesNotTo;
        const appliesTo = mod.dataset.appliesTo;
        if (appliesNotTo && weaponTags.includes(appliesNotTo)) {
            return;
        }
        if (appliesTo && !weaponTags.includes(appliesTo)) {
            return;
        }
        if (mod.appliesNotTo && weaponTags.includes(mod.appliesNotTo)) {
            return;
        }
        if (mod.appliesTo && !weaponTags.includes(mod.appliesTo)) {
            return;
        }
        if (mod.dataset.type === 'multiplicative-headshot') {
            if (!headshotBaseApplied) {
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
            applyBuff(mod, rpmModifier, reloadTimeModifier, damageModifier);
        }
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
    }

    //process operative-specific modifiers
    const processOperativeModifier = (mod) => {
        const weaponTags = selectedWeapon.guntype; //this is now an array
        if (mod.appliesNotTo && weaponTags.includes(mod.appliesNotTo)) {
            return;
        }
        if (mod.appliesTo && !weaponTags.includes(mod.appliesTo)) {
            return;
        }
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
    const abilitiesSection = document.getElementById('abilities');
    abilitiesSection.querySelectorAll('input:checked').forEach(mod => {
        processModifier(mod);  // Process the ability modifier the same way as global modifiers
    });
    const modifiersContainer = document.getElementById('modifiers');
    modifiersContainer.removeEventListener('change', applyModifiers);
    document.querySelectorAll('#modifiers input:checked').forEach(mod => {
        processModifier(mod);
    });
    modifiersContainer.addEventListener('change', applyModifiers);
    const operativeSection = document.getElementById('operative-modifiers');
    operativeSection.querySelectorAll('input:checked').forEach(mod => {
        if (selectedOperative && selectedOperative.modifiers) {
            const modObj = selectedOperative.modifiers.find(m => m.id === mod.id);
            if (modObj) {
                processOperativeModifier(modObj);
            }
        }
    });
    let damage = baseDamage;
    damage *= damageModifier.multiplicative;
    if (headshotMultiplier > 0) {
        damage *= (1 + headshotMultiplier);
    }
    damage += damageModifier.additive;
    damage *= selectedWeapon.damage_multiplier;
    let rpm = baseRpm * rpmModifier.multiplicative + rpmModifier.additive;
    let reloadTime = baseReloadTime * reloadTimeModifier.multiplicative + reloadTimeModifier.additive;
    if (reloadTime < 0.1) {
        reloadTime = 0.1;
    }
    calculateDPSAndDPM(damage, rpm, selectedWeapon.mag_size, reloadTime);
    updateModifiedWeaponStats(damage, rpm, reloadTime);
}

function applyBuff(buff, rpmModifier, reloadTimeModifier, damageModifier) {
    if (ignoreHeadshots &&
        (buff.buffType === 'multiplicative-headshot' ||
            buff.buffType === 'multiplicative-headshot-base')) {
        return;
    }
    const {type, buffType, value} = buff;
    if (buffType === 'multiplicative-headshot-base' && !headshotBaseApplied) {
        headshotMultiplier = value - 1;
        headshotBaseApplied = true;
        return;
    }
    if (buffType === 'multiplicative-headshot') {
        headshotMultiplier += value - 1;
        return;
    }
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

//consider gun type checkboxes
function filterWeapons() {
    const input = document.getElementById('weapon-search').value.toLowerCase();
    const weaponSelect = document.getElementById('weapon-select');
    const options = weaponSelect.getElementsByTagName('option');
    const selectedGuntypes = Array.from(document.querySelectorAll('#guntype-filters input:checked'))
        .map(checkbox => checkbox.value);
    let firstVisibleOption = null;
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent || options[i].innerText;
        const weaponId = parseInt(options[i].value);
        const weapon = weapons.find(w => w.id === weaponId);
        if (!weapon) continue;
        const matchesSearch = optionText.toLowerCase().indexOf(input) > -1;
        const matchesGuntypes = selectedGuntypes.length === 0 || selectedGuntypes.every(type => weapon.guntype.includes(type));
        if (matchesSearch && matchesGuntypes) {
            options[i].style.display = '';
            if (!firstVisibleOption) {
                firstVisibleOption = options[i];
            }
        } else {
            options[i].style.display = 'none';
        }
    }
    if (firstVisibleOption) {
        weaponSelect.value = firstVisibleOption.value;
        weaponSelect.dispatchEvent(new Event('change'));
    }
}

//filter operatives in the dropdown based on search input
function filterOperatives() {
    const input = document.getElementById('operative-search').value.toLowerCase();
    const operativeSelect = document.getElementById('operative-select');
    const options = operativeSelect.getElementsByTagName('option');
    let firstVisibleOption = null;
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent || options[i].innerText;
        if (optionText.toLowerCase().indexOf(input) > -1) {
            options[i].style.display = '';
            if (!firstVisibleOption) {
                firstVisibleOption = options[i];
            }
        } else {
            options[i].style.display = 'none';
        }
    }
    if (firstVisibleOption) {
        operativeSelect.value = firstVisibleOption.value;
        operativeSelect.dispatchEvent(new Event('change'));
    }
}

//create gun type checkboxes based on available gun types in the weapon data
function createGunTypeCheckboxes() {
    const gunTypeFiltersContainer = document.getElementById('gun-type-filters');
    gunTypeFiltersContainer.innerHTML = '';
    const gunTypesSet = new Set();
    weapons.forEach(weapon => {
        weapon.guntype.forEach(type => gunTypesSet.add(type));
    });
    gunTypesSet.forEach(gunType => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = gunType;
        input.className = 'gun-type-checkbox';
        input.addEventListener('change', () => {
            const selectedCheckboxes = Array.from(document.querySelectorAll('.gun-type-checkbox:checked'));
            selectedGunTypes = selectedCheckboxes.map(checkbox => checkbox.value);
            filterWeapons();
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(gunType));
        gunTypeFiltersContainer.appendChild(label);
        gunTypeFiltersContainer.appendChild(document.createElement('br'));
    });
}

document.getElementById('weapon-search').addEventListener('keyup', filterWeapons);
document.getElementById('operative-search').addEventListener('keyup', filterOperatives);
document.querySelectorAll('#guntype-filters input').forEach(checkbox => {
    checkbox.addEventListener('change', filterWeapons);
});

//Create a Weapon
const openBtn = document.getElementById('weapon-create');
const closeBtn = document.getElementById('weapon-cancel');
const modal = document.getElementById('weapon-form');
const form = document.getElementById('weaponForm');

//Show the modal
openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

//Hide the modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
});

//Handle form submission
form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const newId = weapons.length
        ? Math.max(...weapons.map(w => w.id)) + 1
        : 1;
    const weapon = {
        id: newId,
        name: data.get('name'),
        damage: parseFloat(data.get('damage')),
        rpm: parseFloat(data.get('rpm')),
        mag_size: parseFloat(data.get('magazin')),
        reload_time: parseFloat(data.get('reload-time')),
        damage_multiplier: parseFloat(data.get('multiplier')),
        guntype: data.getAll('gun-type')
    };
    weapons.push(weapon);
    populateWeapons();
    modal.style.display = 'none';
    form.reset();
});

modal.addEventListener('click', e => {
    if (e.target === modal) {
        modal.style.display = 'none';
        form.reset();
    }
});

document.getElementById('copy-stats').addEventListener('click', async () => {
    const statsTable = document.querySelector('#weapon-stats table tr + tr');
    if (!statsTable) {
        showCopyMessage('No weapon selected to copy.', 'error');
        return;
    }
    const cells = Array.from(statsTable.querySelectorAll('td')).map(td => td.innerText.trim());
    const [name, dmg, rpm, mag, reload, dps, dpm, avgDps] = cells;
    const globalMods = Array.from(
        document.querySelectorAll('#modifiers label input:checked')
    ).map(cb => cb.parentNode.textContent.trim());
    const opMods = Array.from(
        document.querySelectorAll('#operative-modifiers label input:checked')
    ).map(cb => cb.parentNode.textContent.trim());
    const allMods = globalMods.concat(opMods);
    const modsString = allMods.length
        ? allMods.join(', ')
        : 'None';
    const payload = [
        `Weapon: ${name}`,
        `Damage: ${dmg}`,
        `RPM: ${rpm}`,
        `Mag Size: ${mag}`,
        `Reload Time: ${reload}`,
        `DPS: ${dps}`,
        `DPM: ${dpm}`,
        `Average DPS: ${avgDps}`,
        `Modifiers used for this calculation: ${modsString}`
    ].join('\n');
    try {
        await navigator.clipboard.writeText(payload);
        showCopyMessage('✅ Stats copied to clipboard!', 'success');
    } catch (err) {
        console.error(err);
        showCopyMessage('Failed to copy.', 'error');
    }
});

function showCopyMessage(text, type) {
    const msg = document.getElementById('copy-message');
    msg.textContent = text;
    msg.className = type;
    setTimeout(() => {
        msg.textContent = '';
        msg.className = '';
    }, 3000);
}


// Initialize
fetchWeaponsData();
fetchModifiers();
fetchOperativesData()