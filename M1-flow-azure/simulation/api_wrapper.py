from flask import Flask, request, jsonify
from crowd_sim import run_simulation
import os

app = Flask(__name__)

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.get_json()
    
    duration = data.get('duration', 60)
    arrival_rate = data.get('arrival_rate', 20)
    num_gates = data.get('num_gates', 3)
    
    results = run_simulation(duration, arrival_rate, num_gates)
    
    return jsonify({
        "params": data,
        "results": results
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
