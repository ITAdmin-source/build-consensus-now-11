
import asyncio
from typing import Dict, List, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class QueueManager:
    """Simple in-memory queue manager for clustering jobs"""
    
    def __init__(self):
        self.queue = []
        self.processing = {}
        self.lock = asyncio.Lock()

    async def add_job(self, poll_id: str, job_id: str, priority: int = 5):
        """Add a job to the processing queue"""
        async with self.lock:
            job = {
                'poll_id': poll_id,
                'job_id': job_id,
                'priority': priority,
                'created_at': datetime.utcnow(),
                'status': 'queued'
            }
            
            # Insert job in priority order (higher priority first)
            inserted = False
            for i, existing_job in enumerate(self.queue):
                if priority > existing_job['priority']:
                    self.queue.insert(i, job)
                    inserted = True
                    break
            
            if not inserted:
                self.queue.append(job)
            
            logger.info(f"Added job {job_id} to queue with priority {priority}")

    async def get_next_job(self):
        """Get the next job from the queue"""
        async with self.lock:
            if self.queue:
                job = self.queue.pop(0)
                self.processing[job['job_id']] = job
                job['status'] = 'processing'
                return job
            return None

    async def complete_job(self, job_id: str):
        """Mark a job as completed"""
        async with self.lock:
            if job_id in self.processing:
                del self.processing[job_id]
                logger.info(f"Job {job_id} completed and removed from processing")

    async def fail_job(self, job_id: str, error: str):
        """Mark a job as failed"""
        async with self.lock:
            if job_id in self.processing:
                job = self.processing[job_id]
                job['status'] = 'failed'
                job['error'] = error
                # Keep failed jobs for debugging
                logger.error(f"Job {job_id} failed: {error}")

    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        async with self.lock:
            return {
                'queued_jobs': len(self.queue),
                'processing_jobs': len(self.processing),
                'queue': [
                    {
                        'job_id': job['job_id'],
                        'poll_id': job['poll_id'],
                        'priority': job['priority'],
                        'created_at': job['created_at'].isoformat()
                    }
                    for job in self.queue
                ],
                'processing': [
                    {
                        'job_id': job_id,
                        'poll_id': job['poll_id'],
                        'status': job['status']
                    }
                    for job_id, job in self.processing.items()
                ]
            }
