# TVApp2 IPTV Streaming Setup Guide

## Overview
This guide will help you set up authentic IPTV streaming for your WeParlay platform using TVApp2 Docker container integration.

## Prerequisites
- Docker and Docker Compose installed
- Access to M3U playlist sources for authentic sports content
- Server or local environment to run the TVApp2 container

## Quick Setup

### Step 1: Run the Setup Script
```bash
./docker-tvapp2-setup.sh
```

This creates the necessary Docker configuration and directories.

### Step 2: Start TVApp2 Container
```bash
docker-compose -f docker-compose-tvapp2.yml up -d
```

### Step 3: Configure TVApp2
1. Open your browser to `http://localhost:5004`
2. Access the TVApp2 admin interface
3. Navigate to "Playlist Management"
4. Add your M3U playlist URLs for sports content
5. Configure channel categories (Sports, Esports, etc.)

### Step 4: Connect to WeParlay
Add these environment variables in your Replit secrets:
- `TVAPP2_HOST=localhost` (or your server IP)
- `TVAPP2_PORT=5004`

## M3U Playlist Sources

For authentic sports streaming, you'll need M3U playlists containing:
- Live sports channels (ESPN, Fox Sports, NBC Sports, etc.)
- International sports networks
- Esports streaming channels
- Regional sports networks

### Sample M3U Format
```m3u
#EXTM3U
#EXTINF:-1,ESPN
http://your-stream-url/espn.m3u8
#EXTINF:-1,Fox Sports 1
http://your-stream-url/fs1.m3u8
#EXTINF:-1,NBC Sports
http://your-stream-url/nbcsports.m3u8
```

## Tier-Based Quality Configuration

The system automatically provides quality based on user tiers:
- **Bronze/Silver**: 30-second preview + SD quality
- **Gold**: Unlimited SD streaming
- **Platinum**: Unlimited HD streaming + multi-game viewing
- **Diamond**: Unlimited 4K streaming + exclusive content

## API Endpoints

Once configured, these endpoints become active:
- `GET /api/streaming/status` - Check configuration status
- `GET /api/streaming/sports` - Get live sports streams
- `GET /api/streaming/esports` - Get live esports streams
- `GET /api/streaming/stream/:eventId` - Access specific stream with tier validation

## Troubleshooting

### Container Not Starting
```bash
# Check container logs
docker logs weparlay-tvapp2 -f

# Restart container
docker-compose -f docker-compose-tvapp2.yml restart
```

### Stream Not Loading
1. Verify M3U playlist URLs are accessible
2. Check TVApp2 web interface for channel status
3. Ensure TVAPP2_HOST and TVAPP2_PORT are correctly set in secrets

### Port Conflicts
If port 5004 is in use, modify the docker-compose file:
```yaml
ports:
  - "5005:5004"  # Use port 5005 instead
```

Then update `TVAPP2_PORT=5005` in your secrets.

## Security Considerations

- Use HTTPS for M3U playlist URLs when possible
- Implement proper authentication for TVApp2 admin interface
- Consider VPN or private network for production deployments
- Regularly update TVApp2 container for security patches

## Production Deployment

For production environments:
1. Use dedicated server for TVApp2
2. Configure SSL/TLS certificates
3. Set up proper firewall rules
4. Implement monitoring and logging
5. Use managed Docker orchestration (Docker Swarm or Kubernetes)

## Support

If you encounter issues:
1. Check the container logs first
2. Verify network connectivity between WeParlay and TVApp2
3. Ensure M3U playlists are valid and accessible
4. Test streaming endpoints using the provided test script