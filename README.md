# OfficeGate Playwright Tests

Fresh Playwright setup ready for test recording and playback.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Tests with Codegen
```bash
npm run codegen
```

This opens a browser where you can:
- Click, type, and interact with the OfficeGate application
- Playwright automatically records your actions
- Test code is generated as you interact

### 3. Run Your Tests
```bash
npm test                  # Run all tests
npm run test:headed       # Run with visible browser
npm run test:debug        # Debug mode
npm run test:ui           # Interactive mode
npm run report            # View HTML report
```

## Project Structure
- `tests/` - Your test files
- `playwright.config.ts` - Test configuration
- `package.json` - Dependencies

## Recording Workflow

1. Run `npm run codegen`
2. Browser opens with the OfficeGate sign-in page
3. Perform your desired test workflow (login, navigation, etc.)
4. Playwright records all actions
5. Copy generated code to your test file
6. Run `npm test` to execute

For more info: https://playwright.dev/docs/codegen
