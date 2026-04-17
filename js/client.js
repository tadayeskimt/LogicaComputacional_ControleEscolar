if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
        "https://ycmucwymnikkqctzqtyo.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbXVjd3ltbmlra3FjdHpxdHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTMxODgsImV4cCI6MjA5MTg2OTE4OH0.0kRDHDaWx-VGj_y49sQPf4wqydDtH6yCNfGbz25F41A"
    );
}

window.supabase = window.supabaseClient;