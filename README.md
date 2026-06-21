# Banana Gym

Brooke's Banana Gym is a browser-based Bananagrams training app with a three-minute daily workout, focused practice drills, and time trials.

It is a static web app. Open `index.html` directly or serve this folder with any static file server.

## Global high scores

Banana Gym can use Supabase for lightweight global top-10 boards while keeping personal bests in local browser storage.

1. Create a Supabase project.
2. Run `supabase/banana_gym_scores.sql` in the Supabase SQL editor.
3. In Supabase, copy the project URL and public anon key.
4. Add them to `leaderboard-config.js`.
5. Deploy/push the app.
6. In the app, open Settings and enable Global high scores.

The anon key is intended to be public when Row Level Security is configured. Do not put a service-role key in this static app.
