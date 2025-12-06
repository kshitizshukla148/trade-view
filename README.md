# TradeHub - Modern Trading Platform (MERN Stack)

A full-stack trading platform with real-time stock data, TradingView charts, and MongoDB database.

## Features

- 🔐 User Authentication (JWT-based)
- 📊 Real-time Stock Data (Yahoo Finance API)
- 💼 Portfolio Management with MongoDB
- 📈 TradingView Charts (Lightweight Charts)
- 💰 Buy/Sell Trading Interface
- 🤖 AI-Powered Stock Analysis (ChartGPT API)
- 📱 Responsive Design
- 🎨 Modern UI with Dark Theme
- 🔄 Real-time Updates via WebSocket

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Lightweight Charts (TradingView)
- Socket.io Client
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Yahoo Finance API

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `server` directory:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trading-platform
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# ChartGPT API Configuration (Optional - for enhanced AI analysis)
# Get your API key from https://gptchart.ai/account/api-keys
CHARTGPT_API_KEY=your-chartgpt-api-key-here
CHARTGPT_API_URL=https://api.gptchart.ai
```

**Note:** The ChartGPT API key is optional. If not provided, the system will use local analysis algorithms. For enhanced AI-powered insights, sign up at [gptchart.ai](https://gptchart.ai) and add your API key.

4. Start MongoDB (if using local):
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:symbol` - Get single stock
- `GET /api/stocks/:symbol/history` - Get historical data
- `GET /api/stocks/:symbol/analyze` - Analyze stock performance (ChartGPT API)

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/buy` - Buy stock
- `POST /api/portfolio/sell` - Sell stock
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/analyze` - Analyze portfolio performance (ChartGPT API)

### User
- `GET /api/user/profile` - Get user profile

## Real-time Features

- Stock prices update every 2 seconds via WebSocket
- Portfolio updates in real-time
- Charts update automatically with new data

## Database Schema

### User
- name, email, password (hashed), balance

### Portfolio
- userId, symbol, quantity, avgPrice

### Transaction
- userId, type, symbol, quantity, price, total, createdAt

## AI Stock Analysis

The platform includes AI-powered stock analysis powered by ChartGPT API:

- **Individual Stock Analysis**: View detailed AI insights for any stock including:
  - Technical indicators (RSI, Moving Averages, Support/Resistance levels)
  - Trend analysis (Bullish/Bearish/Neutral)
  - Sentiment analysis
  - Buy/Sell/Hold recommendations
  - Key insights and market analysis

- **Portfolio Analysis**: Get comprehensive analysis of your entire portfolio:
  - Overall portfolio sentiment
  - Top performers and underperformers
  - Recommendations for portfolio optimization
  - Individual stock analysis for each holding

**To enable ChartGPT API:**
1. Sign up at [gptchart.ai](https://gptchart.ai/account/api-keys)
2. Generate an API key
3. Add `CHARTGPT_API_KEY` to your server `.env` file

**Without API Key:** The system will use local analysis algorithms that provide basic technical analysis and recommendations.

## Notes

- Stock data is fetched from Yahoo Finance API (free, no API key needed)
- Charts use TradingView Lightweight Charts library
- Real-time updates use Socket.io
- All prices are in Indian Rupees (₹)
- Indian stock symbols (BSE/NSE)
- AI analysis works with or without ChartGPT API key (local fallback available)

## License

MIT
