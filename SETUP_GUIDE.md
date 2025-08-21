# Complete Setup Guide for Interactive Quiz Game with Multiplayer Games

## Overview
This guide will help you set up a complete interactive quiz platform with multiplayer Tic-Tac-Toe and Connect 4 games, user authentication, quiz creation system, and Google Sheets backend integration.

## 📋 Prerequisites
- Google account
- GitHub account (for hosting)
- Basic understanding of Google Sheets and Google Forms

## 🚀 Step-by-Step Setup

### 1. Google Sheets Setup

#### A. Create Main Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Quiz Game Database"
4. Copy the spreadsheet ID from the URL (between `/d/` and `/edit`)

#### B. Create Required Sheets
Create the following sheets in your spreadsheet:

**Sheet 1: topics**
- Columns: `id`, `name`, `created_at`
- Sample data:
  \`\`\`
  1 | General Knowledge | 2025-01-20
  2 | Sports | 2025-01-20
  3 | Science | 2025-01-20
  \`\`\`

**Sheet 2: quizzes**
- Columns: `id`, `topic_id`, `date`, `contributor`, `question`, `opt1`, `opt2`, `opt3`, `opt4`, `opt5`, `opt6`, `correct_index`, `explanation`, `order`, `created_at`
- Sample data:
  \`\`\`
  101 | 1 | 2025-01-20 | Admin | What is the capital of France? | London | Berlin | Paris | Madrid | | | 2 | Paris is the capital of France | 0 | 2025-01-20
  \`\`\`

**Sheet 3: Form responses 3**
- Columns: `Timestamp`, `Email address`, `quiz_id`, `selected_index`, `name`
- This will be populated by quiz responses

**Sheet 4: users**
- Columns: `id`, `name`, `email`, `role`, `verified`, `created_at`, `last_login`
- Will be populated by user registrations

**Sheet 5: pending_quizzes**
- Columns: `id`, `topic_id`, `contributor`, `question`, `opt1`, `opt2`, `opt3`, `opt4`, `correct_index`, `explanation`, `created_by`, `status`, `created_at`
- Will be populated by user-submitted quizzes

**Sheet 6: tictactoe_rooms**
- Columns: `room_id`, `player1`, `player2`, `game_state`, `current_turn`, `status`, `winner`, `created_at`, `last_updated`
- Will be managed by Google Apps Script

**Sheet 7: connect4_rooms**
- Columns: `room_id`, `player1`, `player2`, `game_state`, `current_turn`, `status`, `winner`, `created_at`, `last_updated`
- Will be managed by Google Apps Script

**Sheet 8: game_history**
- Columns: `id`, `room_id`, `game_type`, `player1`, `player2`, `winner`, `moves`, `duration`, `finished_at`
- Will store completed games

### 2. Google Apps Script Setup

#### A. Create Apps Script Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js`
4. Update `SHEET_CONFIG.SPREADSHEET_ID` with your spreadsheet ID
5. Save the project as "Quiz Game Backend"

#### B. Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Description: "Quiz Game API"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. Copy the web app URL

#### C. Set Up Triggers
1. In Apps Script, click "Triggers" (clock icon)
2. Click "Add Trigger"
3. Function: `setupBackend`
4. Event source: "Time-driven"
5. Type: "Minutes timer"
6. Interval: "Every minute"
7. Save (this will run once to initialize)

#### D. Initialize Backend
1. Run the `setupBackend` function manually once
2. This will create all required sheets and set up daily reset triggers

### 3. Google Forms Setup

Create separate Google Forms for different data types:

#### A. Quiz Response Form
1. Create form with fields:
   - Email address (Short answer)
   - Name (Short answer)
   - Quiz ID (Short answer)
   - Selected Index (Short answer)
2. Link responses to your spreadsheet
3. Get form URL and field entry IDs

#### B. User Registration Form
1. Create form with fields:
   - Name (Short answer)
   - Email (Short answer)
   - Role (Short answer)
   - Verified (Short answer)
   - Created At (Short answer)
2. Link to spreadsheet
3. Get form URL and entry IDs

#### C. Quiz Creation Form
1. Create form with fields:
   - Topic ID (Short answer)
   - Contributor (Short answer)
   - Question (Paragraph)
   - Option 1-4 (Short answer each)
   - Correct Index (Short answer)
   - Explanation (Paragraph)
   - Created By (Short answer)
   - Status (Short answer)
   - Created At (Short answer)
2. Link to spreadsheet
3. Get form URL and entry IDs

#### D. Game Rooms Form
1. Create form with fields:
   - Room ID (Short answer)
   - Game Type (Short answer)
   - Player 1 (Short answer)
   - Player 2 (Short answer)
   - Game State (Paragraph)
   - Current Turn (Short answer)
   - Status (Short answer)
   - Last Updated (Short answer)
   - Created At (Short answer)
2. Link to spreadsheet
3. Get form URL and entry IDs

### 4. Frontend Configuration

#### A. Update Configuration
In `script.js`, update the `CONFIG` object:

\`\`\`javascript
const CONFIG = {
  SHEETS_ID: "YOUR_SPREADSHEET_ID_HERE",
  
  // Update GIDs from your sheet URLs
  TOPICS_GID: "0", // First sheet
  QUIZZES_GID: "123456789", // Get from URL
  RESPONSES_GID: "987654321", // Get from URL
  
  // Add your Google Apps Script web app URL
  APPS_SCRIPT_URL: "YOUR_WEB_APP_URL_HERE",
  
  FORMS: {
    QUIZ_RESPONSES: {
      URL: "YOUR_QUIZ_FORM_URL",
      FIELDS: {
        email: "entry.123456789",
        name: "entry.987654321",
        quiz_id: "entry.456789123",
        selected_index: "entry.789123456"
      }
    },
    USER_REGISTRATION: {
      URL: "YOUR_USER_FORM_URL",
      FIELDS: {
        name: "entry.111111111",
        email: "entry.222222222",
        role: "entry.333333333",
        verified: "entry.444444444",
        created_at: "entry.555555555"
      }
    },
    PENDING_QUIZZES: {
      URL: "YOUR_QUIZ_CREATION_FORM_URL",
      FIELDS: {
        topic_id: "entry.666666666",
        contributor: "entry.777777777",
        question: "entry.888888888",
        opt1: "entry.999999999",
        opt2: "entry.101010101",
        opt3: "entry.111111112",
        opt4: "entry.121212121",
        correct_index: "entry.131313131",
        explanation: "entry.141414141",
        created_by: "entry.151515151",
        status: "entry.161616161",
        created_at: "entry.171717171"
      }
    },
    GAME_ROOMS: {
      URL: "YOUR_GAME_ROOMS_FORM_URL",
      FIELDS: {
        room_id: "entry.333333334",
        game_type: "entry.444444445",
        player1: "entry.555555556",
        player2: "entry.666666667",
        game_state: "entry.777777778",
        current_turn: "entry.888888889",
        status: "entry.999999990",
        last_updated: "entry.101010102",
        created_at: "entry.111111113"
      }
    }
  }
};
\`\`\`

#### B. Get Form Entry IDs
1. Open each Google Form
2. Right-click and "View Page Source"
3. Search for "entry." to find field IDs
4. Update the CONFIG object with actual entry IDs

#### C. Get Sheet GIDs
1. Open each sheet tab in your spreadsheet
2. Copy the number after `#gid=` in the URL
3. Update the CONFIG object with actual GIDs

### 5. GitHub Pages Deployment

#### A. Create Repository
1. Create new GitHub repository
2. Name it something like "interactive-quiz-game"
3. Make it public

#### B. Upload Files
Upload these files to your repository:
- `index.html`
- `style.css`
- `script.js`
- `README.md`

#### C. Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/ (root)"
6. Save

Your site will be available at: `https://yourusername.github.io/repository-name`

### 6. Testing and Verification

#### A. Test Quiz Functionality
1. Visit your GitHub Pages site
2. Try taking a quiz
3. Check if responses appear in Google Sheets

#### B. Test User System
1. Register a new user
2. Login with credentials
3. Check if user data appears in sheets

#### C. Test Games
1. Login and go to Games section
2. Start a Tic-Tac-Toe or Connect 4 game
3. Check room status updates
4. Test multiplayer functionality

#### D. Test Admin Features
1. Login as admin (admin@quiz.com / admin123)
2. Access admin panel
3. Test user verification
4. Test quiz approval system

### 7. Advanced Configuration

#### A. Custom Domain (Optional)
1. Purchase domain
2. Add CNAME file to repository
3. Configure DNS settings
4. Enable HTTPS in GitHub Pages settings

#### B. Analytics Integration
Add Google Analytics or similar tracking code to `index.html`

#### C. Performance Optimization
- Enable browser caching
- Optimize images
- Minify CSS/JS files

### 8. Maintenance

#### A. Regular Backups
- Export Google Sheets data regularly
- Keep backup of configuration

#### B. Monitor Usage
- Check Google Apps Script execution logs
- Monitor form submission rates
- Review game room utilization

#### C. Updates
- Keep sample data updated
- Add new quiz categories
- Monitor user feedback

## 🔧 Troubleshooting

### Common Issues

**Quiz not loading:**
- Check SHEETS_ID and GIDs in CONFIG
- Verify sheet permissions (public viewing)
- Check browser console for errors

**Forms not submitting:**
- Verify form URLs and entry IDs
- Check CORS settings
- Test forms manually

**Games not working:**
- Check Google Apps Script deployment
- Verify web app permissions
- Check trigger setup

**Authentication issues:**
- Clear browser localStorage
- Check user data format
- Verify admin user creation

### Support
For issues, check:
1. Browser developer console
2. Google Apps Script logs
3. Google Sheets data integrity
4. Form submission logs

## 🎉 Congratulations!

Your interactive quiz game with multiplayer functionality is now live! Users can:
- Take quizzes and see results
- Register and manage profiles
- Create and submit quizzes (verified users)
- Play multiplayer Tic-Tac-Toe and Connect 4
- Track statistics and achievements
- Admin can manage users and approve content

The system is fully integrated with Google Sheets for data persistence and real-time multiplayer gaming.
