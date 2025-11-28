# 🧪 Local Testing Guide - M1 Monitoring Service

## Prerequisites

- ✅ Python 3.9+
- ✅ Virtual environment tools
- ✅ Azure Storage connection (will use Azurite for local dev)

---

## Step 1: Setup Environment

### 1.1 Navigate to monitoring service
```bash
cd M1-flow-azure/monitoring-service
```

### 1.2 Create virtual environment
```bash
python -m venv venv
```

### 1.3 Activate virtual environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 1.4 Install dependencies
```bash
pip install -r requirements.txt
```

---

## Step 2: Configure Environment

### 2.1 Create .env file
```bash
cp .env.example .env
```

### 2.2 Edit .env
**For local testing with Azurite:**
```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
TABLE_NAME_GATES=gatestatus
TABLE_NAME_AI_DECISIONS=aidecisions
TABLE_NAME_INVESTIGATION_LOGS=investigationlogs
STADIUM_ID=AGADIR
LOG_LEVEL=INFO
```

**For testing against Azure Production:**
```env
AZURE_STORAGE_CONNECTION_STRING=<your_production_connection_string>
TABLE_NAME_GATES=gatestatus
STADIUM_ID=AGADIR
LOG_LEVEL=INFO
```

---

## Step 3: Start Azurite (Local Azure Storage Emulator)

### Option 1: If you have Azurite running already
✅ Skip this step - it's already running on port 10002

### Option 2: Start Azurite
**New terminal window:**
```bash
azurite --silent --inMemoryPersistence
```

---

## Step 4: Start Monitoring Service

### 4.1 Run the service
```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8080
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
🚀 Starting M1 Monitoring Service...
✅ Connected to Azure Table: gatestatus
🔄 Stream processor started
📊 Metrics aggregator started
✅ M1 Monitoring Service started successfully
INFO:     Application startup complete.
```

---

## Step 5: Test the Service

### 5.1 Health Check
**Open browser:** http://localhost:8080/

**Or use curl:**
```bash
curl http://localhost:8080/
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "M1 Monitoring",
  "version": "1.0.0"
}
```

### 5.2 Get Gate Status (HTTP)
```bash
curl http://localhost:8080/api/realtime/gates?stadiumId=AGADIR
```

**Expected response:**
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 3.8,
      "state": "green",
      "anomaly": false,
      "anomalyScore": 2.44
    }
  ],
  "timestamp": "2025-11-26T10:12:00.123456"
}
```

### 5.3 Test WebSocket (Browser Console)

**Open browser dev tools (F12) → Console:**
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080/ws/gates?stadiumId=AGADIR');

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📊 Gate Update:', data);
};

// Connection opened
ws.onopen = () => {
  console.log('✅ WebSocket Connected');
};

// Connection closed
ws.onclose = () => {
  console.log('❌ WebSocket Disconnected');
};

// Send refresh command
ws.send('refresh');
```

---

## Step 6: Send Test Data

### 6.1 Make sure Azure Functions is running
**New terminal:**
```bash
cd M1-flow-azure
func start
```

### 6.2 Send gate data
```bash
curl -X POST http://localhost:7071/api/flow/ingest \
  -H "Content-Type: application/json" \
  -d "{
    \"stadiumId\": \"AGADIR\",
    \"gateId\": \"G1\",
    \"ts\": \"2025-11-26T10:00:00Z\",
    \"perMinuteCount\": 50,
    \"avgProcessingTime\": 4.0,
    \"queueLength\": 150
  }"
```

### 6.3 Verify WebSocket received update
Check browser console - should see new data within 2-5 seconds!

---

## Step 7: Test Metrics Endpoint
```bash
curl http://localhost:8080/api/metrics?stadiumId=AGADIR&period=1h
```

---

## Common Issues

### Issue 1: "Failed to connect to Azure Table"
**Solution:** Make sure Azurite is running or use production connection string

### Issue 2: "No data available"
**Solution:** Send gate data using Functions API first (Step 6.2)

### Issue 3: WebSocket won't connect
**Solution:** Check if port 8080 is already in use:
```bash
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/Mac
```

### Issue 4: Module not found
**Solution:** Make sure virtual environment is activated:
```bash
# Should show (venv) in prompt
# If not:
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

---

## Development Tips

### Hot Reload
The `--reload` flag auto-restarts on code changes. Edit any `.py` file and save!

### View Logs
All logs appear in the terminal where uvicorn is running. Look for:
- 🚀 Startup messages
- 🔄 Stream processor updates
- ✅ WebSocket connections
- ❌ Errors

### Debug Mode
Edit `config.py`:
```python
LOG_LEVEL: str = "DEBUG"  # More verbose logging
```

### Stop Service
Press `Ctrl+C` in the terminal running uvicorn

---

## Full Test Workflow

Here's a complete test from scratch:

```bash
# Terminal 1: Start Azurite
azurite --silent --inMemoryPersistence

# Terminal 2: Start Azure Functions
cd M1-flow-azure
func start

# Terminal 3: Start Monitoring Service
cd M1-flow-azure/monitoring-service
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Terminal 4: Send test data
curl -X POST http://localhost:7071/api/flow/ingest \
  -H "Content-Type: application/json" \
  -d '{"stadiumId":"AGADIR","gateId":"G1","ts":"2025-11-26T10:00:00Z","perMinuteCount":50,"avgProcessingTime":4.0,"queueLength":150}'

# Browser: Test WebSocket
# Open http://localhost:8080 in browser
# Open DevTools (F12) → Console
# Paste WebSocket code from Step 5.3
```

---

## Ready for Azure VM?

Once local testing works, you're ready to deploy to Azure VM using:
```bash
cd iaas-deployment
./deploy-vm.sh
```

See `IAAS_IMPLEMENTATION_GUIDE.md` for deployment steps.
