from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load the data from the JSON file
with open('data.json') as f:
    guns = json.load(f)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/guns', methods=['GET'])
def get_guns():
    updated_guns = []
    for gun in guns:
        # Calculate RPS, DPS, DPM, avgDPS
        rps = gun['rpm'] / 60
        dps = gun['damage'] * rps
        reload_time_min = gun['reload_time'] / 60
        dpm = (gun['mag_size'] * gun['damage']) / (reload_time_min + (gun['mag_size'] / gun['rpm']))
        avg_dps = dpm / 60

        # Add calculated stats to the gun data
        gun.update({
            'rps': rps,
            'dps': dps,
            'dpm': dpm,
            'avg_dps': avg_dps
        })
        updated_guns.append(gun)

    return jsonify(updated_guns)

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')


def dps_calculation(damage, extra_dmg_percent, rpm, extra_fire_rate):
    dps = damage * (extra_dmg_percent / 100 + 1) * (rpm * (extra_fire_rate / 100 + 1) / 60)
    return round(dps, 2)


def dpm_calculation(reload_time, extra_reload_speed, rpm, damage, extra_dmg_percent, mag_size, extra_fire_rate):
    adjusted_reload_time = reload_time * (extra_reload_speed / 100 + 1)
    adjusted_fire_rate = rpm * (extra_fire_rate / 100 + 1)
    total_damage_per_mag = damage * (extra_dmg_percent / 100 + 1) * mag_size
    dpm = total_damage_per_mag / ((adjusted_reload_time / 60) + (mag_size / adjusted_fire_rate))
    return round(dpm, 2)


def average_dpm_calculation():
    dpm = float(dpm_calculation())
    return round(dpm / 60, 2)

if __name__ == '__main__':
    app.run(debug=True)