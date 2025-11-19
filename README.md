# Xtractic AI - Frontend

Modern React frontend for Xtractic AI workflow orchestration platform, built with Ant Design X for AI-powered data exploration and ETL management.

## 🚀 Features

- **Dashboard**: Real-time workflow statistics and system health monitoring
- **Workflow Orchestration**: Manage ETL workflows from multiple data sources (PDFs, databases, APIs)
- **Data Explorer**: Interactive data visualization with AI-powered query assistant using Ant Design X
- **AI Chat Interface**: Natural language queries for data exploration using Ant Design X components

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Ant Design 5** for UI components
- **Ant Design X** for AI-powered conversational UI
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see main project README)

## 🔧 Installation

1. Navigate to the UI directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
```

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
ui/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx          # Main dashboard with stats
│   │   ├── WorkflowOrchestration.tsx  # Workflow management
│   │   └── DataExplorer.tsx       # Data visualization & AI chat
│   ├── services/
│   │   └── api.ts                 # API client and services
│   ├── App.tsx                    # Main app component
│   ├── App.css                    # Global styles
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Base styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🔌 API Integration

The frontend communicates with the backend API through the services layer:

- **Workflow Service**: Manage and monitor ETL workflows
- **Data Service**: Query and export datasets
- **ETL Service**: Run and monitor ETL jobs
- **AI Service**: Natural language chat interface

Configure the API base URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🎨 Key Features

### 1. Dashboard
- Real-time workflow statistics
- System health monitoring (CPU, Memory, Storage)
- Recent workflow activity
- Visual charts and graphs

### 2. Workflow Orchestration
- Create and manage ETL workflows
- Support for multiple data sources:
  - PDF document processing
  - Database ETL
  - API integrations
  - Cloud storage
- Schedule workflows with cron expressions
- Monitor workflow execution status
- View detailed execution history

### 3. Data Explorer
- Browse and search datasets
- Interactive table with sorting and filtering
- Export data in multiple formats
- AI-powered query assistant using **Ant Design X**
- Natural language data queries
- Real-time data insights

### 4. AI Assistant (Ant Design X)
The Data Explorer includes an AI assistant powered by Ant Design X components:

- **Welcome Screen**: Guided onboarding with suggested queries
- **Bubble Chat**: Conversational interface for data queries
- **Sender Component**: Smart input with loading states
- Natural language understanding
- Context-aware responses

## 🔒 Environment Variables

Create a `.env` file in the `ui/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: Enable debug mode
VITE_DEBUG=false
```

## 🧪 Development

### Code Style
This project uses TypeScript for type safety. Run linting:

```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy this application is with Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ui
vercel

# Add environment variable
vercel env add VITE_API_BASE_URL production

# Deploy to production
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Other Hosting Options
After building, deploy the `dist/` directory to:
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- GitHub Pages

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is licensed under the Apache License 2.0.

## 🔗 Related

- [Main Project Repository](../)
- [Ant Design Documentation](https://ant.design)
- [Ant Design X Documentation](https://x.ant.design)
- [React Documentation](https://react.dev)
