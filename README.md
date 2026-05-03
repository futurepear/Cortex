# Cortex

The AI operating system for companies.

# About:
The company brain / company AI operating system. This system glues together fragmented company data such as server logs, github issues, analytics, documentation, and user tickets/requests. Some of the fragmented data comes as a live feed (the server logs and user messages) so the AI can react to it in real time. An AI agent in a closed loop uses this data through tools and uses more tools to act on it to meet "promises" or goals that the company wants to uphold. Some of the tools include spinning instances of specialized coding agents to do coding work and reviews to react to issues or bugs from any source, or to analyze changes to the code and how it affects user retention or monthly active users. 

The system also has an observability dashboard so company stakeholders can view incoming data and how the system reacts to it in real time. 

## Structure

- `backend/` — Node.js + TypeScript (Express)
- `frontend/` — React + TypeScript + Tailwind CSS (Vite)

## Getting started

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:3001. Health check: `GET /health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173.


disclaimer; we used some ai tools to help with development.
