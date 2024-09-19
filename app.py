from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


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
