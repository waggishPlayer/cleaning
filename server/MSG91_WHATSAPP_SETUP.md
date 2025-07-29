# MSG91 WhatsApp OTP Integration Setup

This project uses MSG91's WhatsApp API for sending OTP messages during user registration and authentication. This guide will help you set up the integration.

## Prerequisites

1. **MSG91 Account**: Sign up at [https://control.msg91.com/](https://control.msg91.com/)
2. **WhatsApp Business API**: Ensure your MSG91 account has WhatsApp API enabled
3. **Environment Variables**: Configure the required environment variables

## Setup Steps

### 1. Get MSG91 Credentials

1. **API Key**:
   - Log in to your MSG91 dashboard
   - Go to `Settings` → `API Keys`
   - Copy your API key

2. **WhatsApp Integration**:
   - Contact MSG91 support to enable WhatsApp API for your account
   - Get your WhatsApp business number verified
   - Optionally create a WhatsApp message template for OTP

### 2. Environment Configuration

Add these variables to your `.env` file:

```env
# MSG91 WhatsApp Configuration
MSG91_API_KEY=your_msg91_api_key_here
MSG91_WHATSAPP_TEMPLATE_ID=your_whatsapp_template_id_here (optional)
MSG91_WHATSAPP_NUMBER=your_whatsapp_business_number_here (optional)
```

**Required:**
- `MSG91_API_KEY`: Your MSG91 API authentication key

**Optional:**
- `MSG91_WHATSAPP_TEMPLATE_ID`: If you have a pre-approved WhatsApp template
- `MSG91_WHATSAPP_NUMBER`: Your WhatsApp business number (defaults to 'MSG91')

### 3. Testing the Integration

1. **Test File**: Use the provided test file to verify your setup:
   ```bash
   node test-msg91-whatsapp.js
   ```

2. **Update Test Phone**: Replace the test phone number in the file with your actual number

3. **Run Test**: Uncomment the test function call and run the test

### 4. How It Works

#### Frontend
- Users enter their phone number on the registration page
- Clicking "Send WhatsApp OTP" calls the API
- Users receive OTP on WhatsApp and enter it for verification

#### Backend
- `/send-otp` endpoint generates a 6-digit OTP
- Uses MSG91 WhatsApp API to send the message
- Falls back to console logging if WhatsApp fails (development mode)
- `/verify-otp` endpoint validates the OTP and proceeds with registration

#### API Endpoints Used
- **Send WhatsApp OTP**: `https://control.msg91.com/api/v5/whatsapp/send`
- **Verify OTP**: Internal database verification (OTP model)

## Message Format

The default OTP message sent via WhatsApp:
```
Your verification code is: {OTP}. Do not share this code with anyone.
```

## Error Handling

The system includes comprehensive error handling:

1. **WhatsApp API Failures**: Falls back to console logging in development
2. **Invalid Credentials**: Clear error messages for debugging
3. **Rate Limiting**: Prevents OTP spam with built-in cooldown
4. **OTP Expiry**: OTPs expire after a set time period

## Production Deployment

### Environment Variables for Production
Update your production environment with:
```env
MSG91_API_KEY=your_production_api_key
MSG91_WHATSAPP_TEMPLATE_ID=your_approved_template_id
MSG91_WHATSAPP_NUMBER=your_verified_business_number
```

### Security Considerations
- Never expose your MSG91 API key in client-side code
- Use HTTPS for all API communications
- Implement proper rate limiting
- Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **401 Unauthorized**:
   - Check your MSG91_API_KEY is correct
   - Verify the API key is active in MSG91 dashboard

2. **403 Forbidden**:
   - WhatsApp API not enabled for your account
   - Contact MSG91 support to enable WhatsApp features

3. **400 Bad Request**:
   - Invalid phone number format
   - Check template ID if using templates
   - Verify WhatsApp integration is properly set up

4. **Messages Not Received**:
   - Ensure the phone number has WhatsApp installed
   - Check if the number is blocked or has privacy settings
   - Verify the WhatsApp Business API is approved

### Debug Mode
In development, if WhatsApp fails, the OTP will be logged to the console:
```
🔥 DEVELOPMENT/FALLBACK OTP 🔥
📱 Phone: +919876543210
🔐 OTP Code: 123456
```

## Cost Considerations

- MSG91 charges per WhatsApp message sent
- Monitor your usage in the MSG91 dashboard
- Consider implementing caching to prevent duplicate OTPs
- Set up billing alerts to avoid unexpected charges

## Support

For MSG91-specific issues:
- MSG91 Support: [https://help.msg91.com/](https://help.msg91.com/)
- WhatsApp API Documentation: Available in MSG91 dashboard

For implementation issues:
- Check the test file: `test-msg91-whatsapp.js`
- Review server logs for detailed error messages
- Ensure all environment variables are properly set
