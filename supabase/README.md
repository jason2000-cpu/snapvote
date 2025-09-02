# Supabase Migrations

This directory contains SQL migrations for the Supabase database.

## How to Apply Migrations

### Using Supabase CLI

If you have the Supabase CLI installed, you can apply migrations with:

```bash
supabase db push
```

### Manual Application

If you don't have the CLI, you can manually apply migrations by:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of each migration file
4. Execute the SQL statements in order

## Migration Files

- `20230701000000_increment_vote_function.sql` - Creates a stored procedure for incrementing vote counts