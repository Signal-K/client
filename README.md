Setup:

```bash
docker compose up -d db
docker exec -it starsailors_db psql -U postgres
\l
docker compose build flaskapp
docker compose up -d flaskapp
```

<!--
Add     "@ducanh2912/next-pwa": "^10.2.9", back
-->