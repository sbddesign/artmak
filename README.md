# Artmak - Multiplayer Blob Game

A fun multiplayer web game where players control colorful blob characters with smiley faces. Click or tap anywhere on the screen to move your blob around and interact with other players in real-time!

## Features

- 🎮 **Real-time Multiplayer**: See other players' blobs moving around in real-time
- 🎨 **Colorful Characters**: Each player gets a unique colored blob with a smiley face
- 📱 **Mobile Friendly**: Works on both desktop and mobile devices
- ⚡ **Smooth Movement**: Gentle, smooth movement animations
- 🌐 **Web-based**: No downloads required, just open in your browser

## Tech Stack

- **Client**: React + TypeScript + Vite
- **Server**: Node.js + TypeScript + Socket.io
- **Package Manager**: pnpm
- **Deployment**: Netlify (client) + Digital Ocean (server)

## Project Structure

```
artmak/
├── packages/
│   ├── client/          # React frontend
│   └── server/          # Node.js backend
├── package.json         # Root package.json with workspaces
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd artmak
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development servers:
```bash
pnpm dev
```

This will start:
- Client on http://localhost:3000 (or next available port)
- Server on http://localhost:3002

### Environment Variables

#### Client (packages/client)
Create a `.env` file:
```env
VITE_SERVER_URL=http://localhost:3002
```

#### Server (packages/server)
Create a `.env` file:
```env
PORT=3002
CLIENT_URL=http://localhost:3000
```

## How to Play

1. Open the game in your browser
2. You'll see your blob character appear at a random location
3. Click or tap anywhere on the screen to move your blob there
4. Watch as other players join and move their blobs around
5. Each player has a unique color and you can see all players in real-time

## Deployment

### Client (Netlify)

1. Connect your repository to Netlify
2. Set build settings:
   - Build command: `cd packages/client && pnpm build`
   - Publish directory: `packages/client/dist`
3. Set environment variable:
   - `VITE_SERVER_URL`: Your server URL (e.g., `https://your-server.com`)

### Server (Digital Ocean)

1. Create a Digital Ocean droplet with Docker support
2. Copy the server files to your droplet
3. Update the `CLIENT_URL` environment variable in `docker-compose.yml`
4. Run:
```bash
docker-compose up -d
```

The server will be available on port 3002.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages
pnpm build

# Clean build artifacts
pnpm clean
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `pnpm dev`
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or building your own games!