#!/bin/bash

# Build script for Hostinger deployment
echo "Building React app for production..."

# Navigate to client directory
cd client

# Install dependencies
npm install

# Build the React app
npm run build

echo "Build completed! Upload the 'client/build' folder contents to your Hostinger public_html directory."

# Optional: Create a zip file for easy upload
cd build
zip -r ../hostinger-build.zip .
cd ..

echo "Created hostinger-build.zip for easy upload to Hostinger."
echo ""
echo "Deployment Steps:"
echo "1. Extract hostinger-build.zip to your Hostinger public_html folder"
echo "2. Make sure your backend is deployed to Render first"
echo "3. Update the API URL in .env.production if needed"
