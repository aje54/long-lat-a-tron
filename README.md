
  
## Developer Set Up

### Install dependencies
```npm install```

### Install shadcn/ui
```npx shadcn@latest init```
```npx shadcn@latest add card button badge alert```

### Install additional packages
```npm install @googlemaps/react-wrapper```
```npm install @types/google.maps```
```npm install tailwindcss-animate class-variance-authority clsx tailwind-merge```
```npm install lucide-react```
```npm install geolib @types/geolib```


### Create local env var for Google API key

echo "REACT_APP_GOOGLE_MAPS_API_KEY=nsert-your-key-here" > .env.local

### Verify it was created correctly
cat .env.local

### Test locally
npm start
### Should now show "🔑 API Key: LOADED" in developer tools

### Deploy
npm run deploy


### Setting up GitHub Pages to host the app

### Overview
This guide shows how to deploy your React GPS tracking app to GitHub Pages with proper API key security.

### Prerequisites
- React app in a GitHub repository
- Google Maps API key

### Step 1: Secure Your API Key

### 1.1 Remove Hardcoded API Key
Replace any hardcoded API keys in your code:
```javascript
// Before (hardcoded - not secure)
const GOOGLE_MAPS_API_KEY = 'xxxxxxxxxxxxx';

// After (environment variable - secure)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
```

### 1.2 Create Environment File
Create a `.env.local` file in your project root:
```bash
echo "REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE" > .env.local
```

**Replace `YOUR_API_KEY_HERE` with your actual Google Maps API key.**

### 1.3 Update .gitignore
Ensure your `.gitignore` includes environment files:
```bash
echo ".env.local" >> .gitignore
echo ".env.development.local" >> .gitignore
echo ".env.test.local" >> .gitignore
echo ".env.production.local" >> .gitignore
```

### 1.4 Test Locally
Verify the environment variable works:
```bash
npm start
```
Check browser console - should show API key is loaded, not empty.

### Step 2: Configure Google Maps API Key

### 2.1 Add GitHub Pages to Allowed Referrers
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **Application restrictions**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `https://yourusername.github.io/*`
     - `https://*.github.io/*`
4. **Save changes**

### 2.2 Enable Required APIs
In Google Cloud Console, ensure these APIs are enabled:
- Maps JavaScript API
- Geocoding API (recommended)

### Step 3: Set Up GitHub Pages Deployment

### 3.1 Install gh-pages
```bash
npm install --save-dev gh-pages
```

### 3.2 Update package.json
Add homepage and deployment scripts to your `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/your-repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Replace:**
- `yourusername` with your GitHub username
- `your-repo-name` with your repository name

### 3.3 Commit Security Changes
```bash
git add .
git commit -m "Secure API key with environment variables"
git push origin main
```

**Note:** The `.env.local` file should NOT be committed (gitignore prevents this).

### Step 4: Deploy to GitHub Pages

### 4.1 Deploy Your App
```bash
npm run deploy
```

This command will:
1. Build your app with the API key from `.env.local`
2. Create a `gh-pages` branch
3. Deploy to GitHub Pages

### 4.2 Enable GitHub Pages (if needed)
1. Go to your GitHub repository
2. **Settings** > **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages`
5. **Folder**: `/ (root)`
6. Click **Save**

### Step 5: Verify Deployment

### 5.1 Your App URL
Your app will be available at:
```
https://yourusername.github.io/your-repo-name
```

### 5.2 Test on Mobile
- Open the URL on your mobile device
- Allow location permissions when prompted
- Verify GPS tracking and manual plotting work
- Check that there's no "For development purposes only" watermark

### Step 6: Future Updates

### 6.1 Update and Redeploy
When you make changes:
```bash
# No need to push to main branch first
npm run deploy
```

The deployment uses your local code and `.env.local` file.

### 6.2 Update Source Code (Optional)
To also update your main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Troubleshooting

### API Key Issues
- **"For development purposes only"**: Enable billing in Google Cloud Console
- **Maps don't load**: Check API key restrictions and referrers
- **Console shows "NoApiKeys"**: Verify `.env.local` file exists and has correct format

### Environment Variable Issues
- **API key shows as empty**: Check `.env.local` file exists in project root
- **File format**: Must be exactly `REACT_APP_GOOGLE_MAPS_API_KEY=your_key` (no spaces, no quotes)

### Deployment Issues
- **404 error**: Wait a few minutes for GitHub Pages to process
- **Old version showing**: Clear browser cache
- **Changes not deploying**: Check that `npm run deploy` completed successfully

### Security Notes
- ✅ API key is not stored in your repository
- ✅ API key is restricted to your GitHub Pages domain
- ✅ Environment file is ignored by git
- ✅ Built files contain the API key (this is normal for client-side apps)

### Example Commands Summary
```bash
# Initial setup
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env.local
npm install --save-dev gh-pages

# Deploy
npm run deploy

# Update and redeploy
npm run deploy
```


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
