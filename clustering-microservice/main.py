
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime
import asyncio
import httpx
from clustering_engine import ClusteringEngine
from supabase_client import SupabaseClient
from queue_manager import QueueManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Polis Clustering Microservice", version="1.0.0")
security = HTTPBearer()

# Initialize components
clustering_engine = ClusteringEngine()
queue_manager = QueueManager()

class ClusteringRequest(BaseModel):
    poll_id: str
    force_recalculate: bool = False
    supabase_url: str
    supabase_key: str

class ClusteringResponse(BaseModel):
    success: bool
    job_id: str
    message: str
    processing_time_ms: Optional[int] = None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    expected_token = os.getenv("CLUSTERING_TOKEN", "secure-token-123")
    if credentials.credentials != expected_token:
        raise HTTPException(status_code=403, detail="Invalid authentication token")
    return credentials.credentials

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/cluster", response_model=ClusteringResponse)
async def cluster_poll(
    request: ClusteringRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Main clustering endpoint called by the database trigger"""
    try:
        logger.info(f"Received clustering request for poll {request.poll_id}")
        
        # Initialize Supabase client for this request
        supabase_client = SupabaseClient(request.supabase_url, request.supabase_key)
        
        # Create clustering job record
        job_id = await supabase_client.create_clustering_job(
            poll_id=request.poll_id,
            status="pending"
        )
        
        # Add to queue for processing
        await queue_manager.add_job(request.poll_id, job_id, priority=5)
        
        # Start background processing
        background_tasks.add_task(
            process_clustering_job,
            job_id,
            request.poll_id,
            supabase_client,
            request.force_recalculate
        )
        
        return ClusteringResponse(
            success=True,
            job_id=job_id,
            message="Clustering job queued successfully"
        )
        
    except Exception as e:
        logger.error(f"Error processing clustering request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_clustering_job(
    job_id: str,
    poll_id: str,
    supabase_client: SupabaseClient,
    force_recalculate: bool = False
):
    """Background task to process clustering job"""
    start_time = datetime.utcnow()
    
    try:
        logger.info(f"Starting clustering job {job_id} for poll {poll_id}")
        
        # Update job status to running
        await supabase_client.update_clustering_job(job_id, status="running", started_at=start_time)
        
        # Get poll data
        poll_data = await supabase_client.get_poll_data(poll_id)
        votes_data = await supabase_client.get_votes_data(poll_id)
        
        if not votes_data:
            raise Exception("No votes found for this poll")
        
        # Process clustering
        clustering_result = await clustering_engine.process_poll(
            poll_id=poll_id,
            votes_data=votes_data,
            poll_settings=poll_data,
            force_recalculate=force_recalculate
        )
        
        # Save results to database
        await supabase_client.save_clustering_results(poll_id, clustering_result)
        
        # Calculate processing time
        processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Update job as completed
        await supabase_client.update_clustering_job(
            job_id,
            status="completed",
            completed_at=datetime.utcnow(),
            processing_time_ms=processing_time,
            groups_created=clustering_result.get("groups_count", 0),
            consensus_points_found=clustering_result.get("consensus_points", 0)
        )
        
        # Update poll clustering status
        await supabase_client.update_poll_clustering_status(poll_id, "completed")
        
        logger.info(f"Clustering job {job_id} completed successfully in {processing_time}ms")
        
    except Exception as e:
        logger.error(f"Error in clustering job {job_id}: {str(e)}")
        
        # Update job as failed
        await supabase_client.update_clustering_job(
            job_id,
            status="failed",
            completed_at=datetime.utcnow(),
            error_message=str(e)
        )
        
        # Update poll clustering status
        await supabase_client.update_poll_clustering_status(poll_id, "failed")

@app.get("/queue/status")
async def get_queue_status(token: str = Depends(verify_token)):
    """Get current queue status"""
    try:
        status = await queue_manager.get_queue_status()
        return status
    except Exception as e:
        logger.error(f"Error getting queue status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str, token: str = Depends(verify_token)):
    """Get status of a specific clustering job"""
    try:
        # This would typically query the database for job status
        # For now, return a placeholder response
        return {"job_id": job_id, "status": "completed"}
    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
