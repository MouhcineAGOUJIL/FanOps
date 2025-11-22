import simpy
import random
import statistics

class StadiumGateSim:
    def __init__(self, env, num_gates=3, processing_time_avg=5.0):
        self.env = env
        self.gates = simpy.Resource(env, capacity=num_gates)
        self.processing_time_avg = processing_time_avg
        self.wait_times = []

    def process_fan(self, fan_id):
        arrival_time = self.env.now
        
        with self.gates.request() as request:
            yield request
            wait = self.env.now - arrival_time
            self.wait_times.append(wait)
            
            # Simulate processing (scanning ticket)
            yield self.env.timeout(random.expovariate(1.0 / self.processing_time_avg))

def fan_generator(env, gate_sim, arrival_rate):
    fan_id = 0
    while True:
        yield self.env.timeout(random.expovariate(arrival_rate))
        env.process(gate_sim.process_fan(fan_id))
        fan_id += 1

def run_simulation(duration_minutes=60, arrival_rate_per_min=20, num_gates=3):
    """
    Runs a crowd simulation and returns statistics.
    """
    env = simpy.Environment()
    gate_sim = StadiumGateSim(env, num_gates=num_gates)
    
    # Arrival rate in fans per minute -> 1/rate for interval
    # SimPy uses time units, let's say 1 unit = 1 minute
    # If rate is 20 fans/min, interval is 1/20 min
    
    def generator():
        while True:
            yield env.timeout(random.expovariate(arrival_rate_per_min))
            env.process(gate_sim.process_fan(env.now))

    env.process(generator())
    env.run(until=duration_minutes)
    
    if not gate_sim.wait_times:
        return {"avg_wait": 0, "max_wait": 0, "p95_wait": 0}
        
    return {
        "avg_wait": round(statistics.mean(gate_sim.wait_times), 2),
        "max_wait": round(max(gate_sim.wait_times), 2),
        "p95_wait": round(statistics.quantiles(gate_sim.wait_times, n=20)[18], 2), # approx 95th percentile
        "total_fans_processed": len(gate_sim.wait_times)
    }

if __name__ == "__main__":
    results = run_simulation(duration_minutes=60, arrival_rate_per_min=50, num_gates=3)
    print(f"Simulation Results: {results}")
