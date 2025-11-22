# OWASP ZAP DAST Configuration

This document explains how to configure and run Dynamic Application Security Testing (DAST) using OWASP ZAP.

## Overview

OWASP ZAP (Zed Attack Proxy) is an open-source web application security scanner that finds vulnerabilities in running applications by simulating real attacks.

## Configuration

### GitHub Secrets/Variables

To run DAST scans, configure these GitHub repository variables:

1. Go to: `Settings` → `Secrets and variables` → `Actions` → `Variables`
2. Add the following variables:

| Variable Name | Example Value | Description |
|---------------|---------------|-------------|
| `FRONTEND_STAGING_URL` | `https://staging.fanops.com` | Frontend staging URL |
| `M2_STAGING_URL` | `https://api-staging.fanops.com/dev` | M2 Security API staging URL |
| `M3_STAGING_URL` | `https://admin-staging.fanops.com` | M3 Admin API staging URL |

### When DAST Runs

DAST scans are **computationally expensive** and may take 10-30 minutes. They run:
- ⏰ **Weekly** (Mondays at 9am UTC)
- 🖱️ **Manual trigger** (via GitHub Actions UI)
- ❌ **NOT** on every push (to save resources)

### Manual Trigger

1. Go to `Actions` → `Security Scan` workflow
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow" button

## Scan Types

### 1. Baseline Scan (Frontend)
- **Target**: Web application UI
- **Action**: `zaproxy/action-baseline`
- **Checks**: XSS, CSRF, clickjacking, etc.
- **Duration**: ~5-10 minutes

### 2. API Scan (Backend)
- **Target**: REST APIs
- **Action**: `zaproxy/action-api-scan`
- **Checks**: Injection, authentication, authorization
- **Duration**: ~10-20 minutes

## ZAP Rules Configuration

Rules are defined in `.zap/rules.tsv`:

```tsv
<rule-id>  <action>  [comment]
```

**Actions**:
- `FAIL`: Build fails if vulnerability found
- `WARN`: Warning only, doesn't fail build
- `IGNORE`: Skip this check
- `INFO`: Informational only

**Examples**:
```tsv
40012  FAIL   # XSS (Reflected) - Critical
10049  WARN   # CSP Header Missing - Warning only
10015  IGNORE # Cache-control - Ignore in dev
```

## Running Locally

### Prerequisites
```bash
docker pull owasp/zap2docker-stable
```

### Quick Scan
```bash
# Frontend baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5173 \
  -r zap-report.html

# API scan (requires OpenAPI spec)
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://your-api.com/dev \
  -f openapi \
  -r zap-api-report.html
```

### Full Scan (Slower)
```bash
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:5173 \
  -r zap-full-report.html
```

## Interpreting Results

### Severity Levels
- **🔴 High**: Critical vulnerabilities (SQL injection, XSS, etc.)
- **🟠 Medium**: Significant issues (CSRF, weak auth, etc.)
- **🟡 Low**: Minor issues (info disclosure, etc.)
- **🔵 Informational**: Best practice recommendations

### Common Findings

#### False Positives
- Content-Type options missing (low risk in dev)
- CSP header not set (configure properly first)
- X-Powered-By header (info disclosure, low risk)

#### Real Issues to Fix
- ❌ Missing authentication on endpoints
- ❌ SQL injection vulnerabilities
- ❌ XSS vulnerabilities
- ❌ Insecure direct object references
- ❌ Sensitive data exposure

## Best Practices

1. **Run regularly**: Weekly scans catch new vulnerabilities
2. **Fix critical first**: Prioritize High severity issues
3. **Update rules**: Customize `.zap/rules.tsv` for your needs
4. **Test in staging**: Never run against production
5. **Review reports**: Don't ignore warnings

## Troubleshooting

### Scan Fails Immediately
- Check target URL is accessible
- Verify GitHub variables are set correctly
- Check ZAP rules aren't too strict

### Too Many False Positives
- Update `.zap/rules.tsv` to WARN or IGNORE
- Consider context-specific rules

### Scan Takes Too Long
- Limit scan scope with ZAP context files
- Use baseline scan instead of full scan
- Reduce `-j` recursion depth

## References

- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [ZAP GitHub Actions](https://github.com/zaproxy/action-baseline)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
