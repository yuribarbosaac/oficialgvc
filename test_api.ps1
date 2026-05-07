$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnJkZ29odndua3BmbG54dm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTU0ODcsImV4cCI6MjA5MzIzMTQ4N30.ozuzley4uHObAajdjc3qLDRtJ8nQXE-xPlw-TiCycho"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnJkZ29odndua3BmbG54dm55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTU0ODcsImV4cCI6MjA5MzIzMTQ4N30.ozuzley4uHObAajdjc3qLDRtJ8nQXE-xPlw-TiCycho"
}

$response = Invoke-RestMethod -Uri "https://iirrdgohvwnkpflnxvny.supabase.co/rest/v1/?select=table_name" -Method Get -Headers $headers -ContentType "application/json"
$response | ConvertTo-Json -Depth 10