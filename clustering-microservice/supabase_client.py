
import httpx
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Client for interacting with Supabase database"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.base_url = f"{supabase_url}/rest/v1"
        self.headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def create_clustering_job(self, poll_id: str, status: str = "pending") -> str:
        """Create a new clustering job record"""
        job_id = str(uuid.uuid4())
        
        job_data = {
            "job_id": job_id,
            "poll_id": poll_id,
            "status": status,
            "total_participants": 0,
            "total_votes": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/polis_clustering_jobs",
                headers=self.headers,
                json=job_data
            )
            response.raise_for_status()
        
        return job_id

    async def update_clustering_job(
        self,
        job_id: str,
        status: Optional[str] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        processing_time_ms: Optional[int] = None,
        groups_created: Optional[int] = None,
        consensus_points_found: Optional[int] = None,
        error_message: Optional[str] = None
    ):
        """Update clustering job record"""
        update_data = {}
        
        if status:
            update_data["status"] = status
        if started_at:
            update_data["started_at"] = started_at.isoformat()
        if completed_at:
            update_data["completed_at"] = completed_at.isoformat()
        if processing_time_ms is not None:
            update_data["processing_time_ms"] = processing_time_ms
        if groups_created is not None:
            update_data["groups_created"] = groups_created
        if consensus_points_found is not None:
            update_data["consensus_points_found"] = consensus_points_found
        if error_message:
            update_data["error_message"] = error_message
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/polis_clustering_jobs?job_id=eq.{job_id}",
                headers=self.headers,
                json=update_data
            )
            response.raise_for_status()

    async def get_poll_data(self, poll_id: str) -> Dict[str, Any]:
        """Get poll configuration and settings"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/polis_polls?poll_id=eq.{poll_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            
            if not data:
                raise Exception(f"Poll {poll_id} not found")
                
            return data[0]

    async def get_votes_data(self, poll_id: str) -> List[Dict[str, Any]]:
        """Get all votes for a poll"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/polis_votes?poll_id=eq.{poll_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def save_clustering_results(self, poll_id: str, clustering_result: Dict[str, Any]):
        """Save clustering results to database"""
        try:
            # Clear existing groups and stats for this poll
            await self._clear_existing_results(poll_id)
            
            # Save groups
            await self._save_groups(poll_id, clustering_result['groups'])
            
            # Save group statistics
            await self._save_group_statistics(clustering_result['group_stats'])
            
            # Save user group memberships
            await self._save_user_group_memberships(poll_id, clustering_result['groups'])
            
            # Save consensus points
            await self._save_consensus_points(poll_id, clustering_result['consensus_statements'])
            
            # Update statement scores
            await self._update_statement_scores(clustering_result['statement_scores'])
            
            logger.info(f"Successfully saved clustering results for poll {poll_id}")
            
        except Exception as e:
            logger.error(f"Error saving clustering results: {str(e)}")
            raise

    async def _clear_existing_results(self, poll_id: str):
        """Clear existing clustering results for a poll"""
        async with httpx.AsyncClient() as client:
            # Clear groups
            await client.delete(
                f"{self.base_url}/polis_groups?poll_id=eq.{poll_id}",
                headers=self.headers
            )
            
            # Clear group stats
            await client.delete(
                f"{self.base_url}/polis_group_statement_stats?poll_id=eq.{poll_id}",
                headers=self.headers
            )
            
            # Clear user group memberships
            await client.delete(
                f"{self.base_url}/polis_user_group_membership?poll_id=eq.{poll_id}",
                headers=self.headers
            )
            
            # Clear consensus points
            await client.delete(
                f"{self.base_url}/polis_consensus_points?poll_id=eq.{poll_id}",
                headers=self.headers
            )

    async def _save_groups(self, poll_id: str, groups: List[Dict]):
        """Save group information"""
        group_data = []
        
        for i, group in enumerate(groups):
            group_data.append({
                "group_id": str(uuid.uuid4()),
                "poll_id": poll_id,
                "name": group['name'],
                "member_count": group['member_count'],
                "color": group['color'],
                "created_at": datetime.utcnow().isoformat()
            })
        
        if group_data:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/polis_groups",
                    headers=self.headers,
                    json=group_data
                )
                response.raise_for_status()

    async def _save_group_statistics(self, group_stats: List[Dict]):
        """Save group statement statistics"""
        if group_stats:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/polis_group_statement_stats",
                    headers=self.headers,
                    json=group_stats
                )
                response.raise_for_status()

    async def _save_user_group_memberships(self, poll_id: str, groups: List[Dict]):
        """Save user group memberships"""
        membership_data = []
        
        for i, group in enumerate(groups):
            group_id = f"group_{i}"  # This should match the group_id from clustering
            
            for member in group['members']:
                membership_data.append({
                    "poll_id": poll_id,
                    "group_id": group_id,
                    "user_id": member if member.startswith('user_') else None,
                    "session_id": member if not member.startswith('user_') else None
                })
        
        if membership_data:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/polis_user_group_membership",
                    headers=self.headers,
                    json=membership_data
                )
                response.raise_for_status()

    async def _save_consensus_points(self, poll_id: str, consensus_statements: List[str]):
        """Save consensus points"""
        if consensus_statements:
            consensus_data = [
                {
                    "poll_id": poll_id,
                    "statement_id": stmt_id,
                    "detected_at": datetime.utcnow().isoformat()
                }
                for stmt_id in consensus_statements
            ]
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/polis_consensus_points",
                    headers=self.headers,
                    json=consensus_data
                )
                response.raise_for_status()

    async def _update_statement_scores(self, statement_scores: Dict[str, float]):
        """Update statement scores"""
        # Note: This would need to be implemented based on your statement score storage strategy
        # For now, we'll skip this as it might require updating the statements table
        logger.info(f"Statement scores calculated: {len(statement_scores)} statements")

    async def update_poll_clustering_status(self, poll_id: str, status: str):
        """Update poll clustering status"""
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/polis_polls?poll_id=eq.{poll_id}",
                headers=self.headers,
                json={"clustering_status": status, "last_clustered_at": datetime.utcnow().isoformat()}
            )
            response.raise_for_status()
