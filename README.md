# YBS Telegram Bot

This Telegram bot helps commuters in Yangon navigate the YBS (Yangon Bus Service) network by providing bus routes, live status updates, and information about nearby bus stops.

## Features

*   **Route Finding:** Find direct and transfer routes between any two YBS bus stops. The bot will suggest the best route with the fewest transfers.
*   **Live Status Crowdsourcing:** Users can report the real-time status of buses (e.g., delayed, normal, crowded) at specific bus stops. This helps other commuters get up-to-date information.
*   **Nearby Stops & Bus Numbers:** By sharing their live location, users can discover nearby bus stops within a 500-meter radius and see which YBS bus numbers serve those stops, along with the distance to each stop.

## Usage

### 1. Start the Bot

Search for the bot on Telegram and start a chat.

### 2. Find Bus Routes

To find a bus route between two stops, use the following format:

```
/route <From Stop Name> to <To Stop Name>
```

**Example:**

`ဆူးလေ to လှည်းတန်း`

or

`/route ဆူးလေ to လှည်းတန်း`

The bot will respond with the recommended bus numbers and transfer points, if any.

### 3. Report Live Bus Status

When the bot suggests a route, it may include an option to report the live status of a bus at a specific stop. Click the "📢 လက်ရှိအခြေအနေ သတင်းပို့ရန်" button and follow the prompts to report if a bus is delayed, normal, or crowded.

### 4. Find Nearby Bus Stops

To find bus stops near your current location, simply share your **Live Location** with the bot. The bot will list the closest bus stops, their distance from you, and the YBS bus numbers that stop there.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Micro (for serverless function deployment)
*   **Database:** Turso DB (via `@libsql/client`) for storing live bus status reports.
*   **API Client:** `node-fetch` for interacting with the Telegram Bot API.
*   **Data:** Custom JSON files for YBS bus routes and bus stop metadata (including geographical coordinates).

## Development

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/hidecard/YBS-bot.git
    cd YBS-bot
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Ensure `api/stops.json` has correct `lat` and `lng` values (latitude and longitude are correctly mapped).

### Deployment

This bot is designed to be deployed as a serverless function, for example, on Vercel or a similar platform that supports Node.js microservices.

### Environment Variables

*   `BOT_TOKEN`: Your Telegram Bot API token.
*   `TURSO_URL`: URL for your Turso database.
*   `TURSO_TOKEN`: Authentication token for your Turso database.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests for improvements, bug fixes, or new features.

## License

This project is licensed under the ISC License. See the `LICENSE.md` file for details.
