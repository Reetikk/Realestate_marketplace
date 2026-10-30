# Real Estate Marketplace — SD-1 friendly project

A React + Vite frontend connected to an Express + MongoDB backend. This project is based on the supplied Real_Estate_MarketPlace codebase; the original feature structure and UI have been retained, while local setup and API startup have been made explicit and a few property access checks were tightened.

## Stack
- Frontend: React, Vite, React Router, CSS Modules
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Optional integrations: Cloudinary (property/avatar images), Razorpay (payments), Google Maps, email notifications

## Folder structure
```
client/   React frontend
server/   Express API, models, controllers, routes
```

## Requirements
Install Node.js LTS and npm. You also need a MongoDB database (local MongoDB or MongoDB Atlas). Image uploads require Cloudinary credentials. Payment, maps, and email features require their own credentials and may remain unavailable until configured.

## 1. Configure backend
Open a terminal in `server/`:

```bash
npm install
```

The supplied `server/.env` is configured for local development. If it is missing, copy `server/.env.example` to `server/.env` and fill in at least:

```env
MONGO_URI=mongodb://127.0.0.1:27017/real_estate
PORT=8000
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Set the Cloudinary, email, Razorpay, and Google Maps variables only when using those features. Never commit `.env` files or real credentials.

Start the API:

```bash
npm run dev
```

Check `http://localhost:5001/api/health`. You should receive JSON confirming the API is running. The server also needs to print `MongoDB connected`.

## 2. Configure frontend
Open a second terminal in `client/`:

```bash
npm install
```

The supplied `client/.env` is configured for local development. If it is missing, copy `client/.env.example` to `client/.env` and set:

```env
VITE_BASE_URL=http://localhost:5001
```

Start React:

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 3. Test the main flow
1. Register a user with a valid 10-digit phone number and 6-digit postal code.
2. Log in; the frontend stores the JWT token and uses it for protected API requests.
3. Open Search to load properties from `GET /api/property/all`.
4. Open Dashboard → Add Property. Image upload needs valid Cloudinary credentials.
5. Confirm the created listing appears in Search and in the user's dashboard.
6. Try bookmarks, property details, and messages after signing in.

## Frontend/backend contract
- The browser sends requests to `VITE_BASE_URL`.
- Express serves API routes under `/api`: `/api/users`, `/api/property`, `/api/chat`, `/api/recommendations`, `/api/payment`, `/api/map`, and `/api/admin`.
- Login returns `{ success, token, data }`; protected requests send `Authorization: Bearer <token>`.
- Property image uploads use `multipart/form-data` with the field name `image`.
- `GET /api/health` is a simple server health check; it does not prove third-party services are configured.

## Useful commands
In `client/`: `npm run dev`, `npm run build`, `npm run lint`.
In `server/`: `npm run dev`, `npm start`.

## Notes before deployment
- Set `CLIENT_URL` to the deployed frontend origin and `VITE_BASE_URL` to the deployed API URL.
- Add environment variables in the hosting dashboard, not in source code.
- Use a strong, unique `JWT_SECRET`; rotate any credentials that were ever committed or shared.
- Payment processing must be verified on the backend; never trust a payment success state reported only by the browser.
- Review admin registration and user-management authorization before exposing this app publicly.
- Some integrations depend on external credentials and are not expected to work until configured.

### Google Maps setup (optional)

To use the embedded map on Features → Google Map:
1. Create a Google Maps Platform API key and enable the Maps Embed API for its project.
2. Add `VITE_GOOGLE_MAPS_API_KEY=your_key` to `client/.env`, then restart Vite.
3. Restrict the key to your website origins and the Maps Embed API. The key is included in frontend requests, so do not use an unrestricted key.

Without a key, the map page still lets visitors open each selected listing in Google Maps.
