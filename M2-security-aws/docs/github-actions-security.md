# Viewing Security Scan Results on GitHub

The FanOps project has automated security testing configured via GitHub Actions. Here's how to access the reports:

## Accessing Security Scan Results

1. **Navigate to the Repository**
   - Go to: https://github.com/MouhcineAGOUJIL/FanOps

2. **Open Actions Tab**
   - Click on the "Actions" tab at the top of the repository page

3. **Select Security Scan Workflow**
   - In the left sidebar, click on "Security Scan"
   - You'll see a list of all workflow runs

4. **View Results**
   - Click on any workflow run to see detailed results
   - Each job (SCA Backend, SCA Frontend, SAST Backend, SAST Frontend) will show:
     - ✅ Green checkmark: No issues found
     - ❌ Red X: Issues detected
     - Click on a job to see detailed logs

## Security Checks Performed

### SCA (Software Composition Analysis)
- **Tool**: `npm audit`
- **Checks**: Backend and Frontend dependencies for known vulnerabilities
- **Runs on**: Every push and pull request

### SAST (Static Application Security Testing)
- **Tool**: `eslint-plugin-security`
- **Checks**: Code for security anti-patterns (eval(), unsafe regex, etc.)
- **Runs on**: Every push and pull request

### DAST (Dynamic Application Security Testing)
- **Tool**: OWASP ZAP
- **Status**: Configured but commented out (requires staging environment URL)
- **Runs on**: Manual trigger (when enabled)

## Running Security Scans Locally

### Backend (M2-security-aws)
```bash
cd M2-security-aws
npm run audit:security  # Check for vulnerable dependencies
npm run lint:security   # Run ESLint security scan
```

### Frontend
```bash
cd frontend
npm audit --audit-level=high  # Check for vulnerable dependencies
npm run lint                  # Run ESLint (includes security rules)
```

## Interpreting Results

### npm audit
- **Severity Levels**: Low, Moderate, High, Critical
- **Recommendations**: Follow the suggested fixes (`npm audit fix`)
- **Note**: Some vulnerabilities may be in dev dependencies and acceptable

### ESLint Security
- **Errors**: Must be fixed (security-critical issues)
- **Warnings**: Should review (potential security concerns)

##Continuous Monitoring

- Workflow runs **automatically** on every push to `main` or `develop` branches
- Workflow runs on every **pull request**
- **Weekly scheduled runs** every Monday at 9am UTC
- Badge status visible in repository README (once configured)

## Need Help?

If security scans fail:
1. Review the detailed logs in GitHub Actions
2. Run the checks locally to debug
3. Fix reported issues
4. Push changes - workflow will re-run automatically
