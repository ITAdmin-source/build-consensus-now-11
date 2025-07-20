import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MigrationRequest {
  session_id: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { session_id, user_id }: MigrationRequest = await req.json();

    if (!session_id || !user_id) {
      throw new Error('Missing required parameters: session_id and user_id');
    }

    console.log(`Starting migration for session ${session_id} to user ${user_id}`);

    // Call the database migration function
    const { data: migrationResult, error: migrationError } = await supabase
      .rpc('migrate_guest_to_user', {
        p_session_id: session_id,
        p_user_id: user_id
      });

    if (migrationError) {
      console.error('Migration error:', migrationError);
      throw migrationError;
    }

    console.log('Migration completed successfully:', migrationResult);

    // If migration was successful and data was migrated, generate insights
    if (migrationResult.success && migrationResult.votes_migrated > 0) {
      console.log('Generating insights for migrated user...');
      
      try {
        // Call the survey insight function to generate insights for all polls the user participated in
        const { data: polls } = await supabase
          .from('polis_votes')
          .select('poll_id')
          .eq('user_id', user_id)
          .not('poll_id', 'is', null);

        if (polls && polls.length > 0) {
          const uniquePollIds = [...new Set(polls.map(p => p.poll_id))];
          
          for (const pollId of uniquePollIds) {
            await supabase.functions.invoke('survey_insight', {
              body: { 
                poll_id: pollId,
                user_id: user_id
              }
            });
          }

          // Update audit record to indicate insights were generated
          await supabase
            .from('polis_migration_audit')
            .update({ insights_generated: true })
            .eq('id', migrationResult.audit_id);
        }
      } catch (insightError) {
        console.error('Failed to generate insights:', insightError);
        // Don't fail the migration if insight generation fails
      }
    }

    return new Response(
      JSON.stringify(migrationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Migration function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});