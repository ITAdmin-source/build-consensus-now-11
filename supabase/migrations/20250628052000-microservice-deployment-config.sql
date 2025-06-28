
-- Update system settings for microservice deployment
UPDATE polis_system_settings 
SET 
  setting_value = 'https://your-clustering-microservice.railway.app',
  description = 'URL of the deployed clustering microservice (update after deployment)'
WHERE setting_key = 'clustering_microservice_url';

UPDATE polis_system_settings 
SET 
  setting_value = 'secure-token-' || substr(md5(random()::text), 1, 16),
  description = 'Authentication token for the microservice (update with your secure token)'
WHERE setting_key = 'clustering_microservice_token';

-- Add additional helpful settings
INSERT INTO polis_system_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('clustering_microservice_status', 'not_deployed', 'string', 'Deployment status: not_deployed, deploying, deployed, error'),
  ('clustering_microservice_last_check', '', 'string', 'Last successful health check timestamp')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;
