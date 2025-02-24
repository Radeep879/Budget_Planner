# Budget Planner

## Description

Budget Planner is a web application designed to help users manage their personal finances by tracking expenses and categorizing them. Users can add, edit, and delete budget items, filter expenses by time period, and view totals by category. The app also includes a chatbot feature for user assistance.

## Features

- User authentication with Firebase
- Add, edit, and delete budget items
- Filter expenses by week, month, year, or all history
- View expenses grouped by category with totals
- Integrated chatbot for user assistance

## Setup Instructions

To run the app locally, follow these steps:

1. **Clone the Repository**: Clone the repository from GitHub using the following command: `git clone https://github.com/Radeep879/Budget_Planner.git`. Navigate into the project directory with `cd Budget_Planner`.

2. **Set Up a Local Server**: 
   - **Using Visual Studio Code**: Install the Live Server extension. Open your project in Visual Studio Code, right-click on `index.html`, and select "Open with Live Server" to start a local server.
   - **Using Python's HTTP Server**: Open a terminal in your project directory and run `python -m http.server` for Python 3.x. This will start a local server at `http://localhost:8000`.

3. **Configure Firebase**: 
   - Create a Firebase project in the Firebase Console.
   - Navigate to Project Settings and locate your Firebase configuration details.
   - Replace the Firebase configuration in `script.js` with your project's specific details, including `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, and `measurementId`.

4. **Run the App**: Open your browser and navigate to the local server URL (e.g., `http://localhost:8000`) to view and interact with the app.

5. **Deploy to GitHub Pages**: Ensure your changes are committed and pushed to the correct branch (usually `gh-pages` for project sites). Go to your repository on GitHub, click on "Settings," and scroll down to the "Pages" section to ensure the correct branch is selected for GitHub Pages.

## Live Site

Check out the live version of the app on GitHub Pages: [Budget Planner Live](https://radeep879.github.io/Budget_Planner/)



