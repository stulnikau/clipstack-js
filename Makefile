.PHONY: frontend backend

frontend:
	cd frontend && npm start

backend:
	cd backend && PORT=3001 npm start

app:
	make frontend &
	make backend
