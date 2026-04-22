# Deploying to Netlify

This application is ready to be deployed as a Static Site (SPA) on Netlify.

## Deployment Steps

1. **Connect your Repository**: Connect your GitHub/GitLab/Bitbucket repo to Netlify.
2. **Build Settings**:
   - **Build Command**: `npm run build:frontend`
   - **Publish Directory**: `dist`
3. **Environment Variables**:
   - Make sure to add your `GEMINI_API_KEY` to the Netlify site settings under "Environment Variables".

## Important Architectural Notes

### 1. Backend & Persistence
Netlify is a **static hosting provider**. This means the custom `server.ts` Express backend will **not** run in the same way it does in the development environment.
- **In-Memory Data**: The current mock database for customers and transactions will reset if you refresh or if the browser loses state.
- **Socket.io**: Real-time Socket.io connections are not supported on Netlify's standard hosting. 

### 2. Recommended Production Path
For a production-ready deployment on Netlify, we recommend:
- **Database**: Use the **Firebase Integration** (run `set_up_firebase` in AI Studio) to move your data to Firestore.
- **Functions**: Convert your API routes to Netlify Functions or use Firebase Functions.
- **Real-time**: Use Firestore's `onSnapshot` for real-time updates instead of Socket.io.

## Routing
The application includes a `netlify.toml` and `public/_redirects` to ensure that client-side routing (React Router) works correctly when navigating or refreshing the page.
