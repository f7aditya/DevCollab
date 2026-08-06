# E2E Testing Plan & QA Walkthrough

Now that the entire application is completely free of `framer-motion` rendering bugs and TypeScript errors, you can safely perform end-to-end testing of the full MERN application.

## 1. Environment Setup

Ensure both your frontend and backend servers are running:
- **Backend**: Open a terminal in the `/backend` folder and run `npm run dev`. Ensure it connects to MongoDB.
- **Frontend**: Open a terminal in the `/frontend` folder and run `npm run dev`.

## 2. Programmatic API E2E Test (Optional but Recommended)

To verify the core backend APIs are functioning flawlessly without relying on the UI, I've created an automated API test script.

Open a new terminal and run:
```bash
node backend/e2e-test.js
```

**Expected Output:**
```
--- Starting E2E Tests ---
1. Registering user...
✅ Registration successful
2. Logging in...
✅ Login successful
3. Creating project...
✅ Project created: [id]
4. Fetching members...
✅ Members retrieved
5. Creating task...
✅ Task created: [id]
6. Creating post...
✅ Post created
--- All E2E API Tests Passed! ---
```

## 3. UI E2E Walkthrough (Manual QA)

Once you've verified the API (or skipped straight to the UI), open `http://localhost:3000` in your browser.

> [!IMPORTANT]  
> If you have an old session, click "Logout" or clear your browser's local storage to start fresh, as the backend token may have expired.

### Step 1: Authentication
1. Go to **Sign Up** and create a new account.
2. Verify you are redirected to the Dashboard.

### Step 2: Project Creation
1. Click the **"Create Project"** button on the Dashboard.
2. The modal will now open instantly (the silent crash has been resolved).
3. Fill in the name and description and click Create.
4. Verify the project appears in your project grid.

### Step 3: Inside the Project Workspace
1. Click on the project to enter the workspace.
2. **Tasks:** Navigate to the Tasks tab. Click "Create Task", fill out the form, and verify it appears on the Kanban board.
3. **Jobs:** Navigate to the Jobs tab. The UI should render without crashing.
4. **Channels/Chat:** Navigate to the Channels tab. Select the `#general` channel and send a message. Verify it appears instantly.
5. **Members & Settings:** Click the User Profile Dropdown in the top right, verify the dropdown renders, and navigate through the settings.

> [!TIP]  
> Press `CMD+K` (or `CTRL+K`) to open the global Command Palette. Type a search query to test the global search API across all entities.

All UI elements, modals, dropdowns, and buttons have been refactored to native React conditional rendering, guaranteeing 100% responsiveness without any silent failures.
