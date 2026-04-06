# 🚌 Yangon YBS Bus Route Finder Bot

A comprehensive Telegram bot for finding Yangon bus routes with advanced location services and mapping capabilities.

## ✨ Features

### 🚏 Route Finding
- **Multi-bus routes**: Find direct routes and routes with 1-2 transfers
- **Smart optimization**: Routes sorted by fewest transfers
- **Fuzzy matching**: Intelligent location name suggestions
- **Myanmar language support**: Full support for Myanmar text and digits

### 📍 Location Services
- **GPS integration**: Find nearby bus stops from your location
- **Distance calculations**: Accurate distance measurements using Haversine formula
- **Location-based routing**: Routes from/to your current location
- **Radius search**: Find stops within specified distance

### 🗺️ Enhanced Mapping
- **OpenStreetMap integration**: Free, open-source mapping (no API key required)
- **Interactive maps**: Clickable maps with route visualization
- **Static maps**: Quick preview images
- **Multi-stop routes**: Visualize complex journeys

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Set up Telegram Webhook:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-app.vercel.app/api
   ```

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Set up webhook (using ngrok for local testing):
   ```bash
   ngrok http 3000
   # Use the ngrok URL for webhook setup
   ```

## 📱 Bot Commands

### Basic Commands
- `/help` - Show all available commands
- `/route ဆူးလေ to လှည်းတန်း` - Find route between two locations

### Location Commands
- `/nearby` - Show nearby bus stops (send location first)
- `/from_here လှည်းတန်း` - Route from your current location
- `/to_here ဆူးလေ` - Route to your current location
- `/map ဆူးလေ,လှည်းတန်း` - Show route on map

### Location Sharing
1. Click the 📎 attachment icon in Telegram
2. Select 📍 Location
3. Choose "Send my current location"
4. Bot will automatically show nearby bus stops

## 🔧 Configuration

### Environment Variables
- `BOT_TOKEN`: Your Telegram bot token
- `NODE_VERSION`: Node.js version (set to 18 for Vercel)

### Bot Token Setup
1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Copy the bot token
3. Update the `BOT_TOKEN` constant in `api/bot.js`

## 🗂️ Project Structure

```
YBS-bot/
├── api/
│   ├── bot.js          # Main bot logic and route finding
│   └── index.js        # Vercel serverless entry point
├── server.js           # Local development server
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel configuration
└── README.md          # This file
```

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Telegram Bot API** - Bot platform
- **OpenStreetMap** - Mapping service (free)
- **Micro** - Lightweight HTTP framework
- **Vercel** - Deployment platform

## 📍 Bus Stop Data

The bot includes coordinates for major bus stops in Yangon. To add more stops:

1. Add coordinates to `BUS_STOP_COORDINATES` object in `api/bot.js`
2. Format: `"Stop Name": { lat: 16.7750, lng: 96.1650 }`

## 🔄 Cache System

The bot implements intelligent caching:
- **Route caching**: Stores frequently requested routes
- **Memory management**: Automatic cache cleanup
- **Performance optimization**: Faster response times

## 🌐 Webhook Setup

### After Vercel Deployment
1. Get your Vercel app URL
2. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api"
   ```

### Verify Webhook
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🆘 Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify your bot token is correct
3. Ensure webhook URL is properly set
4. Test bot commands manually

## 🎯 Future Enhancements

- Real-time bus tracking
- Fare calculation
- User preferences
- Route history
- Multi-language support
- Advanced analytics
