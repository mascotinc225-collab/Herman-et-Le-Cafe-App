# Deployment to Hostinger (Node.js Hosting)

To host this application on Hostinger, follow these steps:

## Option 1: Manual Deployment (ZIP)
1. In AI Studio, click **Settings > Export > Download as ZIP**.
2. Locally (on your computer):
   - Extract the ZIP, run `npm install`, and then `npm run build`.
3. Upload all project files to Hostinger (including the `dist` and `Material` folders) via File Manager or FTP.

## Option 2: Deployment via GitHub (Recommended)
This method allows you to update your site automatically when you push code.

### 1. Push to GitHub
1. In AI Studio, click **Settings > Export > Export to GitHub**.
2. Connect your account and create a new repository (e.g., `herman-cafe-app`).

### 2. Configure Hostinger Git
1. In Hostinger hPanel, go to **Websites > Manage > Advanced > Git**.
2. Paste your GitHub Repository URL.
3. Set the Branch to `main`.
4. Click **Create**.
5. Set up **Webhooks** (provided in the Hostinger Git UI) in your GitHub Repository settings to enable auto-deployment on every push.

### 3. Synchronization (Important)
I have updated your `.gitignore` so that the `dist` folder **is now included** in your GitHub repository. This means:
1. You **must** run `npm run build` locally on your computer (or in AI Studio) before pushing/exporting to GitHub.
2. When you push to GitHub, the compiled app (the `dist` folder) goes with it.
3. Hostinger will pull the `dist` folder automatically, and your app will start immediately without needing to run a build on the server.

## 3. Hostinger Node.js Setup
Whether using ZIP or GitHub, configure the Node.js app:
- **App Directory**: Your project folder (e.g., `/`)
- **App Environment**: `Production`
- **App Entry Point**: `app.js`

## 5. Troubleshooting: "server.cjs is missing"
If you see an error saying `dist/server.cjs` is missing:
1. **Check your folder structure**: Ensure your Hostinger "Application Root" matches where the files are uploaded. If your files are in `/public_html/myapp`, your root should be `/myapp`.
2. **Include the dist folder**: Make sure you didn't accidentally skip the `dist` folder when uploading. I have updated the `.gitignore` to ensure it is included in GitHub exports.
3. **Run Build**: If the file is truly missing, open the Hostinger Terminal and run `npm run build` directly on the server to regenerate it.
