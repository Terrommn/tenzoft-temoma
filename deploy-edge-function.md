# Deploy Supabase Edge Function for User Deletion

## Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

## Deploy the Edge Function

1. Deploy the delete-user function:
   ```bash
   supabase functions deploy delete-user
   ```

2. Set environment variables (if needed):
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Function URL

After deployment, your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user
```

## Testing the Function

You can test the function using curl:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id-to-delete"}'
```

## Security Notes

- The function uses the service role key to have admin privileges
- Only authenticated users should be able to call this function
- Consider adding additional validation to ensure users can only delete their own accounts

## Troubleshooting

If the function doesn't work:
1. Check the function logs: `supabase functions logs delete-user`
2. Verify your service role key is set correctly
3. Make sure your database tables exist and have the correct structure
