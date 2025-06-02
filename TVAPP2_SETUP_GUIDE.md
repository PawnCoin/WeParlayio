# TVApp2 Integration Setup Guide for WeParlay

This guide will help you set up TVApp2 (IPTV streaming service) with your WeParlay sports betting platform to provide authentic global sports streaming with tier-based access control.

## What is TVApp2?

TVApp2 is a self-hosted Docker container that retrieves M3U playlists and EPG guide data from numerous online IPTV services. It provides comprehensive sports coverage including traditional sports and esports.

Repository: https://github.com/TheBinaryNinja/tvapp2

## Prerequisites

- Docker installed on your server
- Basic understanding of Docker containers
- Access to your Replit environment variables/secrets

## Step 1: Set Up TVApp2 Docker Container

### Option A: Docker Run (Quick Setup)

```bash
docker run -d \
  --name tvapp2 \
  -p 5004:5004 \
  -v /path/to/config:/app/config \
  -v /path/to/data:/app/data \
  --restart unless-stopped \
  ghcr.io/thebinaryninja/tvapp2:latest
```

### Option B: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  tvapp2:
    image: ghcr.io/thebinaryninja/tvapp2:latest
    container_name: tvapp2
    ports:
      - "5004:5004"
    volumes:
      - ./config:/app/config
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=5004
```

Run with:
```bash
docker-compose up -d
```

## Step 2: Configure WeParlay Environment Variables

Add these environment variables to your Replit secrets:

### Required Variables:
- `TVAPP2_HOST` - Your TVApp2 server IP/hostname (e.g., "192.168.1.100" or "tvapp2.yourdomain.com")
- `TVAPP2_PORT` - TVApp2 service port (default: "5004")

### Setting Up in Replit:
1. Go to your Replit project
2. Click on "Secrets" tab (🔒 icon)
3. Add the following secrets:
   - Key: `TVAPP2_HOST`, Value: `your-tvapp2-server-ip`
   - Key: `TVAPP2_PORT`, Value: `5004`

## Step 3: Verify Integration

Once configured, you can test the integration using these API endpoints:

### Check TVApp2 Status:
```
GET /api/streaming/status
```

Expected response when configured:
```json
{
  "configured": true,
  "host": "your-tvapp2-server-ip",
  "port": "5004",
  "message": "TVApp2 service configured"
}
```

### Test Sports Streams:
```
GET /api/streaming/sports
```

### Test Esports Streams:
```
GET /api/streaming/esports
```

## Step 4: Configure M3U Sources in TVApp2

TVApp2 requires M3U playlist sources. You can configure these through:

1. **Web Interface**: Access `http://your-tvapp2-host:5004` 
2. **Configuration Files**: Edit configuration files in the mounted config volume
3. **API**: Use TVApp2's configuration API

### Common M3U Sources:
- Sports-focused IPTV providers
- Free sports streaming lists
- Regional sports networks

## Step 5: Tier-Based Streaming Features

Your WeParlay integration includes:

### Bronze/Silver Users:
- 30-second preview of streams
- Automatic upgrade prompts
- SD quality (when available)

### Gold Users:
- Unlimited streaming access
- SD quality streams
- Basic sports coverage

### Platinum Users:
- Unlimited streaming access
- HD quality streams
- Multi-game viewing
- Enhanced sports coverage

### Diamond Users:
- Unlimited streaming access
- 4K quality streams (when available)
- Exclusive content access
- Premium sports coverage

## Step 6: Testing the Integration

### Test Stream Access:
```
GET /api/streaming/stream/:eventId
```

This endpoint will:
- Check user authentication
- Verify user tier
- Return appropriate stream access based on tier
- Provide 30-second preview for Bronze/Silver users

### Frontend Integration:

The streaming is already integrated into your Live Sports pages:
- `/live-sports` - User-facing streaming
- `/system/live-sports` - Admin management

## Troubleshooting

### Common Issues:

1. **"TVApp2 service not available"**
   - Verify Docker container is running
   - Check `TVAPP2_HOST` and `TVAPP2_PORT` environment variables
   - Ensure firewall allows port 5004

2. **"No streams found"**
   - Verify M3U sources are configured in TVApp2
   - Check TVApp2 logs: `docker logs tvapp2`
   - Ensure M3U playlists contain sports content

3. **"Connection refused"**
   - Verify TVApp2 is accessible from your Replit environment
   - Check network connectivity between services
   - Confirm correct host/port configuration

### Logs and Debugging:

Check TVApp2 logs:
```bash
docker logs tvapp2
```

Check WeParlay streaming logs in your Replit console for:
- "TVApp2 connection error"
- "TVApp2 service not available"

## Security Considerations

- Keep TVApp2 behind a firewall
- Use HTTPS when possible
- Regularly update TVApp2 container
- Monitor for unauthorized access
- Ensure M3U sources are legitimate

## Alternative Configuration

If you cannot set up TVApp2, the system will fall back to:
- Authentic mock sports data
- Tier-based preview system still functions
- All other WeParlay features remain available

## Support

For TVApp2-specific issues, refer to:
- TVApp2 Documentation: https://github.com/TheBinaryNinja/tvapp2
- TVApp2 Discord: Available in their repository

For WeParlay integration issues, the streaming service provides fallback functionality to ensure your platform remains operational.

## Next Steps

1. Set up TVApp2 Docker container
2. Configure Replit environment variables
3. Test the `/api/streaming/status` endpoint
4. Verify stream access with different user tiers
5. Configure M3U sources for your target sports coverage

Your WeParlay platform is now ready for comprehensive global sports streaming with tier-based access control and 30-second preview functionality.