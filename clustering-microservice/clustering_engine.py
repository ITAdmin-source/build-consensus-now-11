
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from typing import Dict, List, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ClusteringEngine:
    """Advanced clustering engine for processing poll data"""
    
    def __init__(self):
        self.min_participants = 3
        self.max_groups = 8
        self.min_group_size = 2
        
    async def process_poll(
        self,
        poll_id: str,
        votes_data: List[Dict],
        poll_settings: Dict,
        force_recalculate: bool = False
    ) -> Dict[str, Any]:
        """Main clustering processing method"""
        
        logger.info(f"Processing clustering for poll {poll_id} with {len(votes_data)} votes")
        
        try:
            # Convert votes to matrix format
            vote_matrix, user_ids, statement_ids = self._prepare_vote_matrix(votes_data)
            
            if vote_matrix.shape[0] < self.min_participants:
                raise Exception(f"Not enough participants ({vote_matrix.shape[0]}) for clustering")
            
            # Perform clustering
            clustering_result = self._perform_clustering(vote_matrix, user_ids)
            
            # Calculate group statistics
            group_stats = self._calculate_group_statistics(
                vote_matrix, statement_ids, clustering_result['labels']
            )
            
            # Detect consensus points
            consensus_points = self._detect_consensus_points(
                group_stats, poll_settings
            )
            
            # Calculate statement scores
            statement_scores = self._calculate_statement_scores(group_stats)
            
            result = {
                'poll_id': poll_id,
                'groups_count': clustering_result['n_clusters'],
                'groups': clustering_result['groups'],
                'group_stats': group_stats,
                'consensus_points': len(consensus_points),
                'consensus_statements': consensus_points,
                'statement_scores': statement_scores,
                'clustering_metrics': clustering_result['metrics'],
                'participant_count': len(user_ids),
                'vote_count': len(votes_data)
            }
            
            logger.info(f"Clustering completed: {result['groups_count']} groups, {result['consensus_points']} consensus points")
            return result
            
        except Exception as e:
            logger.error(f"Error in clustering process: {str(e)}")
            raise

    def _prepare_vote_matrix(self, votes_data: List[Dict]) -> Tuple[np.ndarray, List[str], List[str]]:
        """Convert vote data to matrix format for clustering"""
        
        # Create DataFrame from votes
        df = pd.DataFrame(votes_data)
        
        # Get unique users and statements
        users = df['user_id'].fillna(df['session_id']).unique()
        statements = df['statement_id'].unique()
        
        # Create vote matrix (users x statements)
        vote_matrix = np.zeros((len(users), len(statements)))
        
        user_to_idx = {user: idx for idx, user in enumerate(users)}
        stmt_to_idx = {stmt: idx for idx, stmt in enumerate(statements)}
        
        for _, vote in df.iterrows():
            user_key = vote['user_id'] if pd.notna(vote['user_id']) else vote['session_id']
            user_idx = user_to_idx[user_key]
            stmt_idx = stmt_to_idx[vote['statement_id']]
            
            # Convert vote values to numeric: support=1, oppose=-1, unsure=0
            if vote['vote_value'] == 'support':
                vote_matrix[user_idx, stmt_idx] = 1
            elif vote['vote_value'] == 'oppose':
                vote_matrix[user_idx, stmt_idx] = -1
            else:  # unsure
                vote_matrix[user_idx, stmt_idx] = 0
        
        return vote_matrix, list(users), list(statements)

    def _perform_clustering(self, vote_matrix: np.ndarray, user_ids: List[str]) -> Dict[str, Any]:
        """Perform clustering analysis on vote matrix"""
        
        # Standardize the data
        scaler = StandardScaler()
        scaled_matrix = scaler.fit_transform(vote_matrix)
        
        # Try different numbers of clusters
        best_score = -1
        best_k = 2
        best_labels = None
        
        max_k = min(self.max_groups, len(user_ids) // 2)
        
        for k in range(2, max_k + 1):
            try:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                labels = kmeans.fit_predict(scaled_matrix)
                
                # Calculate silhouette score
                score = silhouette_score(scaled_matrix, labels)
                
                # Check minimum group size constraint
                unique, counts = np.unique(labels, return_counts=True)
                if np.min(counts) >= self.min_group_size and score > best_score:
                    best_score = score
                    best_k = k
                    best_labels = labels
                    
            except Exception as e:
                logger.warning(f"Clustering failed for k={k}: {str(e)}")
                continue
        
        if best_labels is None:
            # Fallback: create two groups
            logger.warning("Clustering optimization failed, using fallback")
            kmeans = KMeans(n_clusters=2, random_state=42)
            best_labels = kmeans.fit_predict(scaled_matrix)
            best_k = 2
            best_score = 0
        
        # Create group information
        groups = []
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
        
        for i in range(best_k):
            group_members = [user_ids[j] for j, label in enumerate(best_labels) if label == i]
            groups.append({
                'group_id': f"group_{i}",
                'name': f"קבוצה {i + 1}",
                'members': group_members,
                'member_count': len(group_members),
                'color': colors[i % len(colors)]
            })
        
        return {
            'n_clusters': best_k,
            'labels': best_labels,
            'groups': groups,
            'metrics': {
                'silhouette_score': float(best_score),
                'cluster_balance': float(np.std([len(g['members']) for g in groups])),
                'avg_cluster_size': float(np.mean([len(g['members']) for g in groups]))
            }
        }

    def _calculate_group_statistics(
        self, 
        vote_matrix: np.ndarray, 
        statement_ids: List[str], 
        labels: np.ndarray
    ) -> List[Dict[str, Any]]:
        """Calculate voting statistics for each group on each statement"""
        
        group_stats = []
        n_groups = len(np.unique(labels))
        
        for group_idx in range(n_groups):
            group_mask = labels == group_idx
            group_votes = vote_matrix[group_mask]
            
            for stmt_idx, statement_id in enumerate(statement_ids):
                stmt_votes = group_votes[:, stmt_idx]
                
                # Count votes
                support_count = np.sum(stmt_votes == 1)
                oppose_count = np.sum(stmt_votes == -1)
                unsure_count = np.sum(stmt_votes == 0)
                total_votes = len(stmt_votes)
                
                # Calculate percentages
                support_pct = (support_count / total_votes * 100) if total_votes > 0 else 0
                oppose_pct = (oppose_count / total_votes * 100) if total_votes > 0 else 0
                unsure_pct = (unsure_count / total_votes * 100) if total_votes > 0 else 0
                
                group_stats.append({
                    'group_id': f"group_{group_idx}",
                    'statement_id': statement_id,
                    'support_pct': float(support_pct),
                    'oppose_pct': float(oppose_pct),
                    'unsure_pct': float(unsure_pct),
                    'total_votes': int(total_votes)
                })
        
        return group_stats

    def _detect_consensus_points(
        self, 
        group_stats: List[Dict], 
        poll_settings: Dict
    ) -> List[str]:
        """Detect statements that achieve consensus across all groups"""
        
        # Get consensus thresholds from poll settings
        min_support = poll_settings.get('min_support_pct', 50)
        max_opposition = poll_settings.get('max_opposition_pct', 50)
        min_votes_per_group = poll_settings.get('min_votes_per_group', 1)
        
        # Group statistics by statement
        statement_groups = {}
        for stat in group_stats:
            stmt_id = stat['statement_id']
            if stmt_id not in statement_groups:
                statement_groups[stmt_id] = []
            statement_groups[stmt_id].append(stat)
        
        consensus_points = []
        
        for statement_id, groups in statement_groups.items():
            is_consensus = True
            
            for group_stat in groups:
                # Check if this group meets consensus criteria
                if (group_stat['support_pct'] < min_support or 
                    group_stat['oppose_pct'] > max_opposition or
                    group_stat['total_votes'] < min_votes_per_group):
                    is_consensus = False
                    break
            
            if is_consensus:
                consensus_points.append(statement_id)
        
        return consensus_points

    def _calculate_statement_scores(self, group_stats: List[Dict]) -> Dict[str, float]:
        """Calculate overall scores for statements based on group support"""
        
        statement_scores = {}
        statement_groups = {}
        
        # Group statistics by statement
        for stat in group_stats:
            stmt_id = stat['statement_id']
            if stmt_id not in statement_groups:
                statement_groups[stmt_id] = []
            statement_groups[stmt_id].append(stat)
        
        # Calculate weighted average score for each statement
        for statement_id, groups in statement_groups.items():
            total_weighted_score = 0
            total_weight = 0
            
            for group_stat in groups:
                weight = group_stat['total_votes']  # Weight by number of votes
                score = group_stat['support_pct']   # Use support percentage as base score
                
                total_weighted_score += score * weight
                total_weight += weight
            
            if total_weight > 0:
                statement_scores[statement_id] = round(total_weighted_score / total_weight, 2)
            else:
                statement_scores[statement_id] = 0.0
        
        return statement_scores
