document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/guns')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
        });
});

function populateTable(data) {
    const table = document.getElementById('gun-stats').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear existing table data
    data.forEach(gun => {
        const row = table.insertRow();
        row.insertCell(0).innerText = gun.id;
        row.insertCell(1).innerText = gun.name;
        row.insertCell(2).innerText = gun.damage;
        row.insertCell(3).innerText = gun.damage_multiplier;
        row.insertCell(4).innerText = gun.rpm;
        row.insertCell(5).innerText = gun.mag_size;
        row.insertCell(6).innerText = gun.reload_time;
        row.insertCell(7).innerText = gun.guntype;
        row.insertCell(8).innerText = gun.rps.toFixed(2);
        row.insertCell(9).innerText = gun.dps.toFixed(2);
        row.insertCell(10).innerText = gun.dpm.toFixed(2);
        row.insertCell(11).innerText = gun.avg_dps.toFixed(2);
    });
}