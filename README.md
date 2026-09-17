Setup:

```bash
docker compose up -d db
docker exec -it starsailors_db psql -U postgres
\l
docker compose build flaskapp
docker compose up -d flaskapp
```