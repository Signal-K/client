up:
	docker-compose up

build:
	docker-compose build && yarn build

up-full:
	yarn && yarn build && supabase start && docker-compose up --build

down:
	docker-compose down

down-full:
	docker-compose build && yarn build && docker-compose down && supabase stop

deploy-test:
	docker-compose build && yarn build && vercel
