# Python Virtual Environment Setup for M4-sponsor-gcp

## Step-by-Step Commands

### 1. Navigate to the M4-sponsor-gcp directory
```bash
cd /home/red/Documents/S5/Cloud/FanOps/M4-sponsor-gcp
```

### 2. Create a virtual environment
```bash
python3 -m venv venv
```

### 3. Activate the virtual environment
```bash
source venv/bin/activate
```
You should see `(venv)` appear in your terminal prompt.

### 4. Install required packages
If there's a `requirements.txt`:
```bash
pip install -r requirements.txt
```

If no `requirements.txt`, install common GCP packages:
```bash
pip install google-cloud-storage google-cloud-firestore flask flask-cors
```

### 5. Deactivate when done
```bash
deactivate
```

## Quick One-Liner (for future use)
```bash
cd M4-sponsor-gcp && python3 -m venv venv && source venv/bin/activate && pip install google-cloud-storage google-cloud-firestore flask flask-cors
```

## Verify Installation
After installing, verify with:
```bash
python -c "import google.cloud.storage; print('✓ GCP packages installed')"
```

## Notes
- The `venv` directory will be created inside `M4-sponsor-gcp/`
- Always activate the venv before running Python scripts: `source venv/bin/activate`
- The venv is isolated and won't affect your system Python
