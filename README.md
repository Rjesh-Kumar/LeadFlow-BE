# LeadFlow API
Sales CRM backend for managing agents, leads, comments, tags, and reports. Node.js + Express + MongoDB API with full CRUD operations.

## Tech Stack
**Runtime:** Node.js  
**Framework:** Express  
**Database:** MongoDB with Mongoose ODM  
**Other:** CORS, dotenv, Nodemon  

## Features
- **Sales Agents:** CRUD operations with lead assignment validation  
- **Leads:** Create/track/update with agent population, status, priority, tags  
- **Comments:** Threaded discussions per lead with author population  
- **Tags:** Dynamic tagging system  
- **Reports:** Weekly closed leads, pipeline stats, agent performance  

## Live Deployment
Hosted on **Vercel** as a backend API. https://anvaya-be.vercel.app/

## Getting Started
### Prerequisites
- Node.js (LTS recommended)  
- MongoDB database (local or MongoDB Atlas)  

### Installation
git clone https://github.com/Rjesh-Kumar/LeadFlow-BE.git

cd leadflow-api

npm install

### Environment Variables
Create `.env` file:

MONGODB=your-mongodb-connection-string

PORT=3000
### Running the Server
npm run dev

**Base URL:** `http://localhost:3000`

## API Endpoints
**Base URL (local):** `http://localhost:3000`  
**Base URL (production):** `https://anvaya-be.vercel.app/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET/POST/PUT/DELETE` | `/agents` | Sales agents CRUD |
| `GET/POST/PUT/DELETE` | `/leads` | Leads with agent population |
| `GET/POST/PUT/DELETE` | `/comments` | Lead comments with author |
| `GET/POST` | `/tags` | Dynamic tags |
| `GET` | `/report/last-week` | Closed leads last 7 days |
| `GET` | `/report/pipeline` | Open leads count |
| `GET` | `/report/closed-by-agent` | Agent performance |

**Sample Response (Leads):**
{
"_id": "...",
"name": "John Doe",
"salesAgent": { "name": "Agent Name", "email": "..." },
"status": "New",
"priority": "High",
"tags": ["hot", "urgent"]
}


## Contact
For bugs or feature requests: rajeshkumarrour40@gmail.com
