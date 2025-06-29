
export async function updateJobStatus(supabase: any, jobId: string, status: string, updates: any = {}) {
  await supabase
    .from('polis_clustering_jobs')
    .update({
      status,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
      ...updates
    })
    .eq('job_id', jobId)
}
