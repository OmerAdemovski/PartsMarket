# PartsMarket

PartsMarket is a beginner-friendly full-stack marketplace for buying and selling used car parts. Users can create accounts, browse listings, upload part photos, and manage their own listings.

## Main features

- Registration, login, and logout
- JWT authentication stored in HTTP-only cookies
- MongoDB storage through Mongoose
- Create, view, edit, and delete used-part listings
- Local image uploads
- Search by title, car brand, or car model
- Category filtering
- Owner-only editing and deletion
- Individual and company account types
- Public company profiles and company profile management
- Responsive desktop and mobile interface
- Friendly handling when an authentication session expires

## Technologies

- React and Vite
- React Router
- Node.js and Express
- MongoDB and Mongoose
- Multer for image uploads
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Plain CSS

## Project structure

```text
PartsMarket/
├── client/
│   └── src/
│       ├── components/    Reusable interface components
│       ├── pages/         Main application pages
│       ├── utils/         Shared frontend helpers
│       └── App.jsx        Routes and application authentication state
├── server/
│   ├── config/            Database connection
│   ├── controllers/       Request handling logic
│   ├── middleware/        Authentication and upload checks
│   ├── models/            Mongoose User and Part models
│   ├── routes/             API route definitions
│   ├── utils/              JWT helper functions
│   ├── uploads/            Locally uploaded images
│   └── server.js           Express server entry point
├── AGENTS.md              Project instructions
└── README.md              Project documentation
```

## Setup

1. Clone or download the project.
2. Install the frontend dependencies:

   ```bash
   cd client
   npm install
   ```

3. Install the backend dependencies:

   ```bash
   cd ../server
   npm install
   ```

4. Create the server environment file:

   ```bash
   copy .env.example .env
   ```

   On macOS or Linux, use `cp .env.example .env` instead.

   The server requires these environment variable names:

   - `MONGO_URI` — MongoDB connection string. Add this to the copied file.
   - `JWT_SECRET` — a long random secret used to sign JWTs.
   - `CLIENT_URL` — frontend origin, normally `http://localhost:5173`.
   - `PORT` — backend port, normally `5000`; the server has this default if it is omitted.

   Use your own local values. Do not commit `server/.env`.

5. Start the backend in one terminal:

   ```bash
   cd server
   npm run dev
   ```

6. Start the frontend in a second terminal:

   ```bash
   cd client
   npm run dev
   ```

## Local URLs

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

The health endpoint reports whether the server is running and whether its MongoDB connection is active.

## API endpoints

Authentication uses the JWT cookie created by registration or login. Protected endpoints require that cookie.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account and start a session. |
| `POST` | `/api/auth/login` | Public | Log in and create a session. |
| `POST` | `/api/auth/logout` | Public | Clear the authentication cookie. |
| `GET` | `/api/auth/me` | Protected | Return the current user. |
| `GET` | `/api/parts` | Public | Return all listings. |
| `GET` | `/api/parts/:id` | Public | Return one listing. |
| `GET` | `/api/companies` | Public | Return company profiles. |
| `GET` | `/api/companies/:id` | Public | Return one company profile. |
| `GET` | `/api/companies/me` | Protected company account | Return the current company profile. |
| `PUT` | `/api/companies/me` | Protected company account | Create or update the current company profile. |
| `POST` | `/api/parts` | Protected | Create a listing, optionally with an image. |
| `PUT` | `/api/parts/:id` | Protected and owner-only | Edit a listing, optionally replacing its image. |
| `DELETE` | `/api/parts/:id` | Protected and owner-only | Delete a listing and its stored image. |
| `GET` | `/api/health` | Public | Check server and MongoDB status. |

Create and update requests use `multipart/form-data` when an image is included. Listing fields include title, description, price, category, condition, car brand, car model, location, and contact.

## React state with `useState`

The project uses `useState` for small, understandable pieces of page state:

- `App.jsx` stores the current user and initial authentication loading state.
- `Home.jsx` stores the homepage search text.
- `BrowseParts.jsx` stores listings, search text, category selection, loading, and errors.
- `Login.jsx` and `Register.jsx` store form fields, loading, errors, and messages.
- `PartForm.jsx` stores form values, selected image, preview, loading, and status messages.
- `EditPart.jsx` and `PartDetails.jsx` store loaded listing data and request status.
- `MyParts.jsx` stores the user’s listings, deletion state, modal state, and errors.
- `Account.jsx` stores whether the email address is visible.

## Image uploads

Images must be JPEG, PNG, or WebP files and must be no larger than 5 MB. The browser checks the selected file before submitting it. The server also checks the MIME type and the file’s actual signature or magic bytes, so renaming a non-image file is not enough to bypass validation. Rejected uploads are removed from `server/uploads`.

## How it works

The React frontend displays pages and collects user input. It sends requests to the Express API using `fetch`. Express validates requests, checks the JWT cookie for protected actions, and uses Mongoose to read and write users and part listings in MongoDB. Multer stores approved image files locally, while listing documents keep their image paths.

## Postman testing

1. Start MongoDB, the backend, and the frontend or backend as needed.
2. Send `POST /api/auth/register` or `POST /api/auth/login` with a JSON body.
3. Allow Postman to save cookies for `localhost:5000`.
4. Send `GET /api/auth/me` to confirm the session.
5. Use `POST /api/parts` with `multipart/form-data` to create a listing. Add an `image` file to test upload validation.
6. Use `GET /api/parts`, `GET /api/parts/:id`, `PUT /api/parts/:id`, and `DELETE /api/parts/:id` to test listing behavior.
7. Try editing or deleting a listing owned by another account to confirm the owner-only checks.
8. Send `GET /api/health` to check server and MongoDB status.

## Future improvements

- Add automated backend and frontend tests.
- Add pagination for larger numbers of listings.
- Add stronger image processing and thumbnails.
- Add account deletion and password-reset flows.
- Add a production deployment configuration.

## Files kept out of Git

`server/.env` contains local configuration and secrets, so it is intentionally ignored. Uploaded images in `server/uploads` are also intentionally ignored. Only `server/.env.example` and the `server/uploads/.gitkeep` placeholder are suitable for version control.
