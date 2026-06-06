# AI Observability Logs

A modern, clean UI for viewing and analyzing AI observability logs in real-time.

## Features

- 🎨 Clean, modern light theme UI
- 🔍 Search and filter logs by type (all, error, tool, llm)
- 📊 Expandable log entries with detailed information
- 🔄 Real-time log fetching with refresh capability
- 📱 Responsive design
- ⚡ Built with React

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Observebility
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## API Configuration

The application fetches logs from:
```
https://db.gtwy.ai/api/observability
```

To change the API endpoint, update the `API_URL` constant in `src/App.jsx`.

## Tech Stack

- React 18
- Vite
- Custom styling (no external CSS frameworks)

## Project Structure

```
Observebility/
├── src/
│   ├── App.jsx       # Main application component
│   ├── App.css       # Styles
│   └── main.jsx      # Entry point
├── public/
├── index.html
└── package.json
```

## License

MIT
