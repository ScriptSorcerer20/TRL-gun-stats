from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load the data from the JSON file
with open('static/data.json') as f:
    guns = json.load(f)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/guns', methods=['GET'])
def get_guns():
    updated_guns = []
    for gun in guns:
        original_damage = gun['damage']
        # Calculate RPS, DPS, DPM, avgDPS
        rps = gun['rpm'] / 60
        dps = original_damage * rps
        reload_time_min = gun['reload_time'] / 60
        dpm = (gun['mag_size'] * original_damage) / (reload_time_min + (gun['mag_size'] / gun['rpm']))
        avg_dps = dpm / 60
        total_damage = original_damage * gun['damage_multiplier']

        # Add calculated stats to the gun data
        gun.update({
            'total_damage': total_damage,
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


@app.route('/about_us')
def about_us():
    return render_template('about_us.html')


@app.route('/suggestion')
def suggestion():
    return render_template('suggestion.html')

if __name__ == '__main__':
    app.run(debug=True)
