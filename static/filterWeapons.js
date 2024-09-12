// Weapon data from JSON

// Full weapons data from JSON
const weapons = [
    {"id": 1, "name": "G18"},
    {"id": 2, "name": "M1911"},
    {"id": 3, "name": "M9A"},
    {"id": 4, "name": "M1911MK2"},
    {"id": 5, "name": "Luger"},
    {"id": 6, "name": "AK47"},
    {"id": 7, "name": "G36"},
    {"id": 8, "name": "CRL10"},
    {"id": 9, "name": "BRH17"},
    {"id": 10, "name": "M4"},
    {"id": 11, "name": "M1"},
    {"id": 12, "name": "R870"},
    {"id": 14, "name": "Scattergun"},
    {"id": 16, "name": "Shorty"},
    {"id": 18, "name": "AA12"},
    {"id": 20, "name": "P90"},
    {"id": 21, "name": "Thompson"},
    {"id": 22, "name": "Uzi"},
    {"id": 23, "name": "Vector"},
    {"id": 24, "name": "MP5"},
    {"id": 25, "name": "U10"},
    {"id": 26, "name": "MPX"},
    {"id": 27, "name": "UMP45"},
    {"id": 28, "name": "Prototype"},
    {"id": 29, "name": "Prototype (Overcharged)"},
    {"id": 30, "name": "MP40"},
    {"id": 31, "name": "PKM"},
    {"id": 32, "name": "M249"},
    {"id": 33, "name": "T49"},
    {"id": 34, "name": "T32"},
    {"id": 35, "name": "Improved T49"},
    {"id": 36, "name": "Improved T32"},
    {"id": 37, "name": "AMR 12.7"},
    {"id": 38, "name": "Golden Thompson"},
    {"id": 39, "name": "MilTech SMGs"},
    {"id": 40, "name": "Eradicator"},
    {"id": 41, "name": "A10"},
    {"id": 42, "name": "Turret (Manual)"},
    {"id": 43, "name": "Turret (Automatic)"},
    {"id": 44, "name": "Improved G18"},
    {"id": 45, "name": "Silenced G18"},
    {"id": 46, "name": "RC12"},
    {"id": 48, "name": "MRL4"},
    {"id": 49, "name": "Improved MRL4"},
    {"id": 50, "name": "K4LAS"},
    {"id": 51, "name": "Improved K4LAS"},
    {"id": 52, "name": "MK49"},
    {"id": 53, "name": "Improved MK49"},
    {"id": 55, "name": "STEN Gun"},
    {"id": 56, "name": "Akimbo G18"},
    {"id": 57, "name": "ASR"},
    {"id": 58, "name": "Improved ASR"},
    {"id": 59, "name": "Improved G36"},
    {"id": 60, "name": "Akimbo Voids"},
    {"id": 61, "name": "Improved Akimbo Voids"},
    {"id": 62, "name": "Improved MP5"},
    {"id": 63, "name": "LTL Laser"},
    {"id": 64, "name": "Improved Vector"},
    {"id": 65, "name": "T45"},
    {"id": 66, "name": "Improved T45"},
    {"id": 67, "name": "Freeze Ray"},
    {"id": 68, "name": "Freeze Rifle"},
    {"id": 69, "name": "R416"},
    {"id": 70, "name": "Improved R416"},
    {"id": 71, "name": "Flare Gun"},
    {"id": 72, "name": "Improved BRH17"},
    {"id": 73, "name": "Deagle"},
    {"id": 74, "name": "Akimbo Deagles"},
    {"id": 75, "name": "CRL11"},
    {"id": 76, "name": "Scan Rifle"},
    {"id": 77, "name": "PPSH41"},
    {"id": 78, "name": "AK74M"},
    {"id": 79, "name": "Akimbo Uzi"},
    {"id": 80, "name": "Akimbo MP5"},
    {"id": 81, "name": "Improved Thompson"},
    {"id": 82, "name": "RV9"},
    {"id": 83, "name": "SPAS-12"},
    {"id": 84, "name": "Akimbo Shotguns"},
    {"id": 85, "name": "SK17"},
    {"id": 86, "name": "Type49"},
    {"id": 87, "name": "M32"},
    {"id": 88, "name": "M32NL"}
];


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
}

// Filter function for the search box
function filterWeapons() {
    const input = document.getElementById('search').value.toLowerCase();
    const select = document.getElementById('weapon-select');
    select.innerHTML = ""; // Clear previous options

    weapons.forEach(weapon => {
        if (weapon.name.toLowerCase().indexOf(input) > -1) {
            const option = document.createElement('option');
            option.value = weapon.id;
            option.text = weapon.name;
            select.appendChild(option);
        }
    });
}

// Populate the weapon list on page load
populateWeapons();