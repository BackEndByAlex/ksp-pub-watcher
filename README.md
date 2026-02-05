# KSP Pub Watcher 🍺

Automated Discord bot that monitors KSP Pub for new events and notifies via Discord webhooks.

## ✨ Features

- **Automated Monitoring:** Checks KSP Pub website for new events
- **Smart Caching:** Uses Redis to prevent duplicate notifications
- **Discord Notifications:** Rich Discord embeds with event details
- **Dual-Mode Deployment:** Optimized for Railway with Cron Schedule support

## 🏗️ Architecture

- **Language:** Node.js (ES Modules)
- **Scraping:** Axios + Cheerio
- **Database:** Redis (production) / In-memory cache (local development)
- **Notifications:** Discord Webhooks
- **Scheduling:** Daily checks (24-hour intervals)

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in the root directory:
   ```env
   # Discord Configuration
   DISCORD_WEBHOOK_URL=your_webhook_url_here
   
   # Redis (optional for local, required for production)
   # REDIS_URL=your_redis_url_here
   ```

3. **Start the Application**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run tests with coverage:
```bash
npm test
```

## ☁️ Deployment (Railway)

### 🎯 Dual-Mode Deployment

This application supports **two deployment modes** for optimal cost and reliability:

| Mode | Resource Usage | Cost | Use Case |
|------|---------------|------|----------|
| **Cron Schedule** ⭐ | Runs only when triggered | **Lowest** | Primary checking (recommended) |
| **Server Mode** | Always running | Higher | Backup + health endpoint |

---

### 📋 Setup Instructions

**1. Create a new project on [Railway](https://railway.app/)**

**2. Add a Redis database service to your project**
   - Click "New" → "Database" → "Add Redis"
   - `REDIS_URL` will be automatically set

**3. Deploy this repository to Railway**

**4. Configure the following environment variables:**
   - `REDIS_URL` - Automatically set when you link Redis service
   - `DISCORD_WEBHOOK_URL` - Your Discord webhook URL
   - `PORT` - (Optional) Defaults to `3000`

**5. Setup Railway Cron Schedule (Recommended)** ⭐
   - Navigate to your service settings → "Cron Schedule"
   - Click "Add Schedule"
   - **Cron expression:** `0 12 * * *` *(Daily at 12:00 UTC)*
   - **Custom command:** `CRON_MODE=true npm start`
   - Save the schedule
   
   > **💡 Runs once daily, most cost-effective for pub event monitoring**

   **Alternative Cron Schedules:**
   ```bash
   0 12 * * *       # Daily at 12:00 UTC (recommended)
   0 */12 * * *     # Every 12 hours
   0 9,18 * * *     # At 09:00 and 18:00 UTC
   0 10 * * 1-5     # Weekdays at 10:00 UTC
   ```

**6. Server Mode (Optional Backup)**
   - Your deployment already runs `npm start` by default
   - This provides continuous server + daily scheduler backup

---

## 📁 Project Structure

```
ksp-pub-watcher/
├── src/
│   ├── controller/          # Business logic
│   │   └── pubController.js
│   ├── Service/             # Scraping service
│   │   └── pubService.js
│   ├── storage/             # Redis cache
│   ├── scheduler/           # Scheduling logic
│   │   └── pubScheduler.js
│   ├── routers/             # API endpoints
│   ├── tests/               # Unit tests
│   └── server.js            # Main entry point
├── .env                     # Environment configuration
└── package.json
```

## 🔧 How It Works

1. **Scheduler** runs daily checks (or via Railway Cron Schedule)
2. **Service** scrapes KSP Pub website for events
3. **Controller** compares new events against Redis cache
4. **Discord Service** sends notifications for new events only
5. **Cache** stores previously seen events to prevent duplicates

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Web Scraping:** Axios, Cheerio
- **Database:** Redis (with in-memory fallback)
- **Notifications:** Discord Webhooks
- **Server:** Express.js
- **Security:** Helmet
- **Testing:** Vitest

## 📄 License

MIT License

---

**Created by Alexandru Antonescu**  
*Automated pub event monitoring made easy* 🍺
