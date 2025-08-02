# Ping Service for Render Cooldown Prevention

This implementation prevents your Render free tier application from going into cooldown by keeping the server active with regular pings.

## How it Works

The ping service uses a dual approach to keep your server active:

1. **Self-Ping**: Every 10 minutes, the server pings its own health endpoint
2. **External Ping**: Every 15 minutes, the server makes an external request to keep it active

## Features

- ✅ Automatic startup in production mode
- ✅ Disabled in development mode
- ✅ Configurable ping intervals
- ✅ Error handling and logging
- ✅ Status monitoring endpoint
- ✅ Manual control endpoints

## Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Ping Service Status
```
GET /api/ping-status
```
Returns the current status of the ping service including:
- Whether it's running
- Last ping time
- Next scheduled pings

### Manual Control
```
POST /api/ping-control
Body: { "action": "start" | "stop" }
```
Manually start or stop the ping service.

## External Ping Service

If you want to run the ping service externally (as a backup), you can use the `externalPing.js` script:

```bash
npm run ping
```

This script can be run on:
- A separate Render service
- A cron job
- Any external server
- GitHub Actions (free tier)

## Configuration

The ping service automatically detects the environment:

- **Production**: Automatically starts the ping service
- **Development**: Ping service is disabled

## Monitoring

You can monitor the ping service by:

1. Checking the server logs for ping messages
2. Using the `/api/ping-status` endpoint
3. Setting up external monitoring

## Logs

The service logs all ping attempts:
- ✅ Successful pings with timestamps
- ❌ Failed pings with error messages

## Troubleshooting

If the ping service isn't working:

1. Check if it's running: `GET /api/ping-status`
2. Manually start it: `POST /api/ping-control` with `{"action": "start"}`
3. Check server logs for error messages
4. Verify the server URL is correct in `pingService.js`

## Alternative Solutions

If you need additional reliability, consider:

1. **UptimeRobot**: Free uptime monitoring service
2. **Cron-job.org**: Free cron job service
3. **GitHub Actions**: Free CI/CD with scheduled workflows
4. **Render Pro**: Upgrade to avoid cooldown entirely

## Cost Considerations

- Self-ping: No additional cost
- External ping: Minimal bandwidth usage
- Render free tier: 750 hours/month (enough for continuous operation)

The ping service is designed to be lightweight and cost-effective while ensuring your application stays active. 