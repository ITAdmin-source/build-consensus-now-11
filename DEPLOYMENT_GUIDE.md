
# Clustering Microservice Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up/login and create a new project
3. Connect your GitHub repository
4. Railway will auto-detect the Dockerfile in `clustering-microservice/`
5. Set environment variable: `CLUSTERING_TOKEN=your-secure-token-123`
6. Deploy and copy the public URL

### Option 2: Render
1. Go to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set:
   - Build Command: `cd clustering-microservice && docker build -t clustering .`
   - Start Command: `cd clustering-microservice && docker run -p 10000:8000 clustering`
   - Environment: `CLUSTERING_TOKEN=your-secure-token-123`

### Option 3: Google Cloud Run
```bash
cd clustering-microservice
docker build -t gcr.io/YOUR-PROJECT/clustering-microservice .
docker push gcr.io/YOUR-PROJECT/clustering-microservice
gcloud run deploy --image gcr.io/YOUR-PROJECT/clustering-microservice --platform managed
```

### Option 4: DigitalOcean App Platform
1. Go to DigitalOcean Apps
2. Create app from GitHub
3. Select the `clustering-microservice` folder
4. Set environment: `CLUSTERING_TOKEN=your-secure-token-123`

## After Deployment

1. Copy your deployed URL (e.g., `https://your-app.railway.app`)
2. Update the system settings in the admin panel:
   - Clustering Microservice URL: `https://your-app.railway.app`
   - Authentication Token: `your-secure-token-123`
3. Test the connection using the "Check Connection" button
4. Manually trigger clustering for existing polls

## Environment Variables

- `CLUSTERING_TOKEN`: Authentication token for the microservice
- `PORT`: Port to run on (default: 8000)

## Health Check

Your deployed service should respond to:
- `GET /health` - Returns service status
- `POST /cluster` - Main clustering endpoint (requires auth)
- `GET /queue/status` - Queue status (requires auth)
