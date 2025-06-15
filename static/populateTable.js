document.addEventListener('DOMContentLoaded', () => {
    fetch('/trlstats/static/json/data.json')
        .then(response => response.json())
        .then(data => {
            const updatedGuns = data.map(gun => {
                const original_damage = gun['damage'];
                const total_damage = original_damage * gun['damage_multiplier'];
                const rps = gun['rpm'] / 60;
                const dps = total_damage * rps;
                const reload_time_min = gun['reload_time'] / 60;
                const dpm = (gun['mag_size'] * total_damage) / (reload_time_min + (gun['mag_size'] / gun['rpm']));
                const avg_dps = dpm / 60;
                return {
                    ...gun,
                    total_damage: total_damage,
                    rps: rps,
                    dps: dps,
                    dpm: dpm,
                    avg_dps: avg_dps
                };
            });

            populateTable(updatedGuns);
        });
});

function populateTable(data) {
    const table = document.getElementById('gun-stats').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    data.forEach(gun => {
        const row = table.insertRow();
        row.insertCell(0).innerText = gun.name;
        row.insertCell(1).innerText = gun.total_damage.toFixed(2);
        row.insertCell(2).innerText = gun.rpm;
        row.insertCell(3).innerText = gun.mag_size;
        row.insertCell(4).innerText = gun.reload_time;
        row.insertCell(5).innerText = gun.rps.toFixed(2);
        row.insertCell(6).innerText = gun.dps.toFixed(2);
        row.insertCell(7).innerText = gun.dpm.toFixed(2);
        row.insertCell(8).innerText = gun.avg_dps.toFixed(2);
    });
}
