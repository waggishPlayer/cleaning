# PhonePe SDK Integration Guide

## Overview

This document provides a guide to the PhonePe SDK integration implemented in the cleaning service application. The integration supports two methods:

1. **Backend SDK Integration**: Uses the PhonePe Node.js SDK on the server side to create payment URLs and redirect users to the PhonePe payment page.
2. **Frontend SDK Integration**: Uses the PhonePe JavaScript SDK on the client side to create a seamless payment experience within the application.

## Installation

The PhonePe SDK is already installed as a dependency in the project. You can find it in the `package.json` file:

```json
"dependencies": {
  "pg-sdk-node": "git+https://github.com/PhonePe/pg-sdk-node.git"
}
```

## Backend SDK Integration

### Controller Implementation

The backend SDK integration is implemented in the `phonePeSdkController.js` file. This controller provides the following functions:

- `createPhonePeOrder`: Creates a payment order using the PhonePe SDK and returns a payment URL.
- `createSdkOrder`: Creates a token for the frontend SDK integration.
- `checkPhonePeStatus`: Checks the status of a PhonePe payment.
- `handlePhonePeCallback`: Handles callbacks from PhonePe after payment completion.
- `handlePhonePeRedirect`: Handles redirects from PhonePe after payment completion.

### API Routes

The following API routes are available for the PhonePe SDK integration:

- `POST /api/phonepe-sdk/create-order`: Creates a payment order using the PhonePe SDK.
- `POST /api/phonepe-sdk/create-sdk-order`: Creates a token for the frontend SDK integration.
- `GET /api/phonepe-sdk/status/:transactionId`: Checks the status of a PhonePe payment.
- `POST /api/phonepe-sdk/callback`: Handles callbacks from PhonePe.
- `GET /api/phonepe-sdk/redirect`: Handles redirects from PhonePe.

## Frontend SDK Integration

### Components

Two React components have been created for the PhonePe SDK integration:

1. `PhonePeSdkPayment.tsx`: A component for the backend SDK integration that redirects users to the PhonePe payment page.
2. `PhonePeFrontendSdkPayment.tsx`: A component for the frontend SDK integration that uses the PhonePe JavaScript SDK to create a seamless payment experience.

### API Service

The API service has been updated with the following methods for the PhonePe SDK integration:

- `createPhonePeSdkOrder`: Creates a payment order using the PhonePe SDK.
- `createPhonePeFrontendSdkOrder`: Creates a token for the frontend SDK integration.
- `checkPhonePeSdkStatus`: Checks the status of a PhonePe payment.

## Demo Page

A demo page has been created to showcase both PhonePe SDK payment options. You can access it at `/phonepe-sdk-demo`.

## Configuration

The PhonePe SDK is configured with the following environment variables:

- `PHONEPE_CLIENT_ID`: The PhonePe client ID.
- `PHONEPE_CLIENT_SECRET`: The PhonePe client secret.
- `PHONEPE_MERCHANT_ID`: The PhonePe merchant ID.

The SDK automatically determines the environment (sandbox or production) based on the `NODE_ENV` environment variable.

## Testing

For testing purposes, you can use the following test credentials:

- **Phone Number**: Any valid phone number
- **OTP**: Any valid OTP

## Troubleshooting

If you encounter any issues with the PhonePe SDK integration, check the following:

1. Ensure that the environment variables are correctly set.
2. Check the server logs for any error messages.
3. Verify that the PhonePe SDK is correctly installed.
4. Ensure that the frontend SDK script is loaded correctly.

## References

- [PhonePe Developer Documentation](https://developer.phonepe.com/docs)
- [PhonePe SDK GitHub Repository](https://github.com/PhonePe/pg-sdk-node)