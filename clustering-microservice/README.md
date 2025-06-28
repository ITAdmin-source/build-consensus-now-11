
# Polis Clustering Microservice

A dedicated high-performance clustering microservice for the Polis platform, designed to handle large-scale opinion clustering with 200,000+ votes.

## Features

- **High Performance**: Built with FastAPI and scikit-learn for efficient processing
- **Scalable Architecture**: Can handle large datasets with streaming processing
- **Advanced Clustering**: Multiple algorithms (K-Means, DBSCAN) with automatic optimization
- **Queue Management**: Background job processing with priority queues
- **Real-time Integration**: Seamless integration with Supabase database
- **Robust Error Handling**: Comprehensive logging and error recovery

## Architecture

```
Database Trigger → Microservice → Clustering Engine → Results → Database
```

## Quick Start

### Local Development

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   ```bash
   export CLUSTERING_TOKEN=secure-token-123
   ```

3. **Run the Service**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Docker Deployment

1. **Build and Run**:
   ```bash
   docker-compose up -d
   ```

2. **Check Status**:
   ```bash
   curl http://localhost:8000/health
   ```

## API Endpoints

### Main Endpoints

- `POST /cluster` - Main clustering endpoint (called by database trigger)
- `GET /health` - Health check
- `GET /queue/status` - Queue status
- `GET /jobs/{job_id}` - Job status

### Authentication

All endpoints (except `/health`) require Bearer token authentication:

```bash
curl -H "Authorization: Bearer secure-token-123" http://localhost:8000/queue/status
```

## Configuration

Update the microservice URL in your Supabase admin panel:

1. Go to System Settings
2. Update `clustering_microservice_url` to your deployed service URL
3. Update `clustering_microservice_token` with a secure token

## Deployment Options

### 1. Railway
```bash
# Connect to Railway and deploy
railway login
railway init
railway up
```

### 2. Render
- Connect your repository
- Use Docker deployment
- Set environment variables

### 3. Google Cloud Run
```bash
gcloud run deploy clustering-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Performance

The microservice is designed to handle:
- **200,000+ votes** efficiently
- **10,000+ participants** with proper clustering
- **Real-time processing** with smart debouncing
- **Multiple concurrent polls** with queue management

## Monitoring

- Check `/health` endpoint for service status
- Monitor `/queue/status` for processing queue
- View logs for detailed operation information
- Use database clustering_jobs table for job history

## Integration

The microservice integrates with your existing Polis system:

1. **Database triggers** automatically call the microservice
2. **Results are saved** directly to Supabase
3. **Real-time UI updates** work seamlessly
4. **No changes needed** to existing frontend code

## Scaling

For high-volume deployments:

1. **Horizontal Scaling**: Deploy multiple instances behind a load balancer
2. **Redis Queue**: Add Redis for distributed job queues
3. **Database Optimization**: Use read replicas for vote data
4. **Caching**: Implement clustering result caching

## Troubleshooting

Common issues and solutions:

- **Connection errors**: Check Supabase URL and keys
- **Authentication failures**: Verify token configuration
- **Clustering failures**: Check minimum participant requirements
- **Performance issues**: Monitor memory usage and consider scaling
