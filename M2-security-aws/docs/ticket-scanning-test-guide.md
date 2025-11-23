# 🎫 Ticket Scanning Test Guide

## ✅ Fixed Issues
1. **JWT_SECRET mismatch** - Updated seed script to match handler
2. **Page reverted** - French UI restored with audio playback
3. **Valid tickets generated** - 3 test tickets created

## 📋 Testing Steps

### Step 1: Copy a Valid Ticket JWT

Use one of these **freshly generated** tickets (valid for 24h):

**Ticket 1 - Standard Seat A-42:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTM5MiIsInRpY2tldElkIjoiM2Y4MmM5MzQtMmRiNi00MDY5LWEyYjQtMGMzZDVjN2FlYTE5Iiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiIyNDRhMzYxMC00ZWU2LTRhMjMtODNkNC1jNDM4ZTUxNmY1MTEiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiQS00MiIsInR5cGUiOiJTVEFOREFSRCIsImlhdCI6MTc2MzkxMTY5OCwiZXhwIjoxNzYzOTk4MDk4fQ.EYbADFPA0A57eRhjwrVC4dw7NLe0cw2uiLhTihpcyxI
```

**Ticket 2 - VIP Seat VIP-10:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTg2NyIsInRpY2tldElkIjoiZGJhNGQwZjYtOTFhZS00NjhmLTliMjItMGI4OWM1ZTQ0M2VmIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI3ZmIwOGI0Yi0zZjM2LTQyOTEtOThkZC1hYzM1ZWQ2OWJlZWIiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiVklQLTEwIiwidHlwZSI6IlZJUCIsImlhdCI6MTc2MzkxMTY5OCwiZXhwIjoxNzYzOTk4MDk4fQ.1yPrwCBl6JTooFYG8ugERNjPuqns6PTLGpNmnRA1pUw
```

**Ticket 3 - Standard Seat B-12:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTk0NyIsInRpY2tldElkIjoiOTYzNWI3N2QtMjA2MS00MDhjLWJmOWQtZTZjMzk4ODk0MTcwIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI5YmFkMjM5MS0yYTNiLTRlZTktOGRkMS02NjIxM2UzZDcyNDYiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiQi0xMiIsInR5cGUiOiJTVEFOREFSRCIsImlhdCI6MTc2MzkxMTY5OCwiZXhwIjoxNzYzOTk4MDk4fQ.XJ202kYQAMloFNwFiTktzvilYHiZ0fD4R6VqIG7YuCo
```

### Step 2: Test in Browser

1. **Login as Gatekeeper:**
   - Open http://localhost:5173/login
   - Username: `gatekeeper1`
   - Password: `gate123`
   - Should redirect to `/gatekeeper/scan`

2. **Scan a Ticket:**
   - Paste one of the JWT tokens above into the textarea
   - Click "VÉRIFIER LE BILLET"
   - Should see:
     - ✅ **"ACCÈS AUTORISÉ"** (green success message)
     - 🎵 **Audio plays** ("Dima Maghrib")
     - Ticket details displayed (seat, match ID)

3. **Test Replay Attack:**
   - Try scanning the same ticket again
   - Should see:
     - ❌ **"ACCÈS REFUSÉ"** (red error)
     - Error: "Token déjà utilisé (replay attack detected)"
     - ❌ **No audio**

### Step 3: Test via Command Line

```bash
cd M2-security-aws

# Test valid ticket
curl -X POST http://localhost:3000/dev/security/verifyTicket \
  -H "Content-Type: application/json" \
  -d '{
    "jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTM5MiIsInRpY2tldElkIjoiM2Y4MmM5MzQtMmRiNi00MDY5LWEyYjQtMGMzZDVjN2FlYTE5Iiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiIyNDRhMzYxMC00ZWU2LTRhMjMtODNkNC1jNDM4ZTUxNmY1MTEiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiQS00MiIsInR5cGUiOiJTVEFOREFSRCIsImlhdCI6MTc2MzkxMTY5OCwiZXhwIjoxNzYzOTk4MDk4fQ.EYbADFPA0A57eRhjwrVC4dw7NLe0cw2uiLhTihpcyxI",
    "gateId":"G1",
    "deviceId":"scanner-01",
    "gatekeeperId":"GK-001"
  }'

# Expected response:
# {"ok":true,"message":"Billet valide - Accès autorisé","seatNumber":"A-42","matchId":"CAN2025-MAR-G1"}
```

### Step 4: Generate Fresh Tickets (if needed)

If tickets expire (after 24h), regenerate them:

```bash
cd M2-security-aws
node scripts/seedSoldTickets.js

# Copy the JWT tokens from output
# Look for lines like:
#    JWT: eyJhbGci...
```

## 🔧 Troubleshooting

### Issue: "Connection error" or "Erreur de connexion"

**Solution:**
1. Check backend is running:
   ```bash
   ps aux | grep "serverless offline"
   ```

2. If not running, start it:
   ```bash
   cd M2-security-aws
   npm run offline
   ```

3. Verify it's listening:
   ```bash
   curl http://localhost:3000/dev/auth/login -I
   # Should return HTTP 405 (Method Not Allowed) which means it's running
   ```

### Issue: "Token JWT invalide ou expiré"

**Solutions:**
1. **Tickets expired** - Regenerate with `node scripts/seedSoldTickets.js`
2. **Wrong JWT format** - Make sure you copied the entire token (starts with `eyJ...`)
3. **JWT_SECRET mismatch** - Already fixed, but verify with:
   ```bash
   grep JWT_SECRET M2-security-aws/src/handlers/verifyTicket.js
   grep JWT_SECRET M2-security-aws/scripts/seedSoldTickets.js
   ```

### Issue: Audio doesn't play

**Solution:**
- Browser may block autoplay
- Check browser console for errors
- Make sure `frontend/src/assets/DimaMaghriboutput.mp3` exists
- Try clicking somewhere on the page first (browsers require user interaction for audio)

## 📊 Expected Behavior Summary

| Action | Result | Audio |
|--------|--------|-------|
| Scan valid ticket (first time) | ✅ ACCÈS AUTORISÉ | 🎵 Plays |
| Scan same ticket again | ❌ ACCÈS REFUSÉ (replay) | ❌ Silent |
| Scan expired ticket | ❌ ACCÈS REFUSÉ (expired) | ❌ Silent |
| Scan invalid JWT | ❌ ACCÈS REFUSÉ (invalid) | ❌ Silent |
| Backend offline | ❌ Erreur de connexion | ❌ Silent |

## ✨ Features

- ✅ **French UI** - "Scanner de Billets", "VÉRIFIER LE BILLET"
- ✅ **Audio on success** - Celebratory sound when ticket is valid
- ✅ **Replay protection** - Same ticket can't be used twice
- ✅ **Real-time validation** - Checks JWT signature and database
- ✅ **Offline mode** - Uses file-based database for local testing
