# clipstack-js

Search hundreds of movies on Clipstack

## Running locally

Prerequisites:
1. Node
2. MySQL installed with backend tables and data loaded (TODO: add example DB dump)
3. SSL certificate and private key in `backend/selfsigned.crt` and `backend/selfsigned.key` respectively
4. `backend/.env` file containing `JWT_SECRET`, `ENCRYPTION_KEY` for encrypting refresh tokens, and your MySQL `DB_PASSWORD`

To install Node packages, use:
```shell
cd frontend && npm install
cd backend && npm install
```

To run, use:
```shell
make app
```

This will run the frontend on `0.0.0.0:3000` and backend on `localhost:3001`.
