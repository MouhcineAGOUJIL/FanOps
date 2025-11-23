# 🎫 Test Tickets for M2 Scanner

Run this command to see all available tickets:
```bash
./scripts/printTestTickets.sh
```

Or get tickets directly:
```bash
aws dynamodb scan \
  --table-name can2025-secure-gates-sold-tickets-dev \
  --region eu-west-1 | jq -r '.Items[].jwt.S'
```

---

## Quick Test Tickets (Copy & Paste)

### Ticket 1 - Standard Seat C-55
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTcwOSIsInRpY2tldElkIjoiOWRhZGJlMTAtMDNlNy00ZDExLWIzYTctYTUxNDYwNDkzMGJhIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI1ZGI2NjNmYy1hNWE3LTQxOTgtOTNkYi01OWFmYmY5OWQxMDUiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiQy01NSIsInR5cGUiOiJTVEFOREFSRCIsImlhdCI6MTc2MzkzMjk1NiwiZXhwIjoxNzY0MDE5MzU2fQ.4MJMK7oXrJNDsUhf60eUFINWiX-Xr6J5wMV8WJM1xfg
```

### Ticket 2 - VIP Seat VIP-10
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTY0OSIsInRpY2tldElkIjoiMDY5MzliMDAtYmM4Ni00OWFkLTkwZjAtMzQ1OTA4MDFjZGNkIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI5YjhmMWRkNi1lZjg3LTRjMTgtOWY0ZC05ODY1NzMxMWMyNzgiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiVklQLTEwIiwidHlwZSI6IlZJUCIsImlhdCI6MTc2MzkzMjkxNCwiZXhwIjoxNzY0MDE5MzE0fQ.Nw9yirL1I7X9Td3Pn_C2THnJfK2p4ptdsY_hYhF6TPQ
```

### Ticket 3 - VIP Seat VIP-5
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTE3NCIsInRpY2tldElkIjoiZjg1ZGQwOGMtMmVlYy00Yjg0LTljMDItM2NkNjE0MTZiOWNjIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI3ODE5YmVjNS1jMGJjLTRiY2YtYWUxZi0xZDYyNjVlNGIxNjIiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiVklQLTUiLCJ0eXBlIjoiVklQIiwiaWF0IjoxNzYzOTMyOTE5LCJleHAiOjE3NjQwMTkzMTl9.5buh2wGmYNLigJ7rXoepAB9FINFa9ivSUxbK9pcCxbs
```

### Ticket 4 - VIP Seat VIP-5 (Another)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTcxIiwidGlja2V0SWQiOiJlOGZlOTJkZC0wM2Y0LTQwZjQtODM5Yi04ODdhZTk5NGVlMDMiLCJzY29wZXMiOlsiZmFuIl0sImp0aSI6ImVmYmY5ZjNkLWY3YjEtNDQzYS05MTEwLTJjY2EwOTdmZjYwNCIsIm1hdGNoSWQiOiJDQU4yMDI1LU1BUi1HMSIsInNlYXROdW1iZXIiOiJWSVAtNSIsInR5cGUiOiJWSVAiLCJpYXQiOjE3NjM5MzI5NTcsImV4cCI6MTc2NDAxOTM1N30.4hfq1V9ql3zA_BEpIxJZ-hn1Ge-mernUBp2tKd4KuX8
```

### Ticket 5 - VIP Seat VIP-10 (Another)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTIyMiIsInRpY2tldElkIjoiNTc2YjhmNDYtNzAzZC00OGI4LTg0YmYtODRlZTNhYmYxMGU2Iiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI1NWI1NjY5OS05ZGUzLTRkMGYtYjNiOS1lNGFhZGQxM2Q1ZWUiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiVklQLTEwIiwidHlwZSI6IlZJUCIsImlhdCI6MTc2MzkzMjk1MiwiZXhwIjoxNzY0MDE5MzUyfQ.DnYmo7m9KdxYuXHPiJ7J8T6ulqYhOtb3LhhS8e9fSVo
```

---

## 🧪 How to Test

### From UI (Gatekeeper Scanner):
1. Login: `gatekeeper1` / `gate123`  
2. Go to: `/gatekeeper/scan`
3. Paste any JWT from above
4. Click "Verify Ticket"

### From API (curl):
```bash
curl -X POST "https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket" \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "PASTE_JWT_HERE",
    "gateId": "G1",
    "deviceId": "scanner-001"
  }'
```

---

## ⚠️ Important Notes

- Each ticket can only be used **once** (anti-replay protection)
- Tickets expire in **24 hours** from creation
- Get fresh tickets: `./scripts/printTestTickets.sh`
- Total available: **10 tickets**

---

## 🔄 Generate More Tickets

```bash
cd M2-security-aws
node scripts/seedTicketsAWS.js
```

This will create 5 new tickets in the database.
