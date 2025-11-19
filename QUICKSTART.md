# Xtractic AI UI - Quick Start Guide

## Getting Started

### 1. Install Dependencies
```bash
cd ui
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your backend API URL
# Default: VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Key Features to Explore

### 📊 Dashboard
Navigate to the home page to view:
- Total workflow statistics
- Running, completed, and failed workflows
- System health metrics
- Workflow activity charts

### 🔄 Workflow Orchestration
Click "Workflow Orchestration" to:
- View all configured ETL workflows
- Create new workflows for:
  - PDF document processing
  - Database ETL operations
  - API data collection
  - Cloud storage integration
- Start/pause/delete workflows
- View detailed execution history

### 🔍 Data Explorer
Click "Data Explorer" to:
- Browse processed datasets
- Search and filter data
- Export data in various formats
- Use AI assistant for natural language queries

### 🤖 AI Assistant (Ant Design X)
In the Data Explorer, use the AI chat to:
- Ask questions about your data
- Get insights and statistics
- Query datasets using natural language
- Example: "Show me the latest data" or "How many records do we have?"

## Architecture

```
┌─────────────────────────────────────────────┐
│           React Frontend (Port 3000)         │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Dashboard  │ │ Workflows  │ │ Explorer │ │
│  └────────────┘ └────────────┘ └──────────┘ │
└───────────────────┬─────────────────────────┘
                    │ Axios API Client
                    ▼
┌─────────────────────────────────────────────┐
│      Backend API (Port 8000)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  ETL     │ │  Spark   │ │  PostgreSQL  │ │
│  │  Agent   │ │  Engine  │ │  Database    │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────┘
```

## Next Steps

1. **Backend Setup**: Ensure your Python backend is running on port 8000
2. **Database**: Configure PostgreSQL connection in the backend
3. **Data Sources**: Add PDF files or configure database connections
4. **Run Workflows**: Create and execute your first ETL workflow
5. **Explore Data**: Use the Data Explorer to query your processed data

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Cannot Connect to Backend
- Check that backend is running on `http://localhost:8000`
- Verify `VITE_API_BASE_URL` in `.env` file
- Check CORS settings in backend

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Vercel Deployment

The fastest way to deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable for your backend API
vercel env add VITE_API_BASE_URL production
# Enter your backend API URL when prompted

# Deploy to production
vercel --prod
```

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## Learn More

- [Ant Design Documentation](https://ant.design)
- [Ant Design X Documentation](https://x.ant.design)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
