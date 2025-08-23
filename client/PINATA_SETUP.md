# Pinata IPFS Setup Guide

## **Required Environment Variables**

To enable file uploads to IPFS, you need to create a `.env` file in the `client` directory with the following variables:

```bash
# Pinata IPFS Configuration
# Get these from https://app.pinata.cloud/
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_API_SECRET=your_pinata_secret_api_key_here
REACT_APP_PINATA_JWT=your_pinata_jwt_token_here
```

## **How to Get Pinata Credentials**

1. **Sign up at [Pinata](https://app.pinata.cloud/)**
2. **Go to API Keys section**
3. **Create a new API key**
4. **Copy the API Key, Secret, and JWT token**

## **File Structure**

```
client/
├── .env                    # Create this file with your credentials
├── .env.example           # This template file
└── src/
    └── services/
        └── pinata.js      # Uses the environment variables
```

## **Important Notes**

- The `REACT_APP_` prefix is **REQUIRED** for Create React App
- Restart your development server after creating the `.env` file
- Never commit your actual credentials to version control
- The `.env` file should be in your `.gitignore`

## **Testing File Uploads**

Once configured, you can test file uploads in:
- **Patient Dashboard**: Upload medical records
- **Diagnostic Dashboard**: Upload diagnostic reports
- **Doctor Dashboard**: Create consultation reports

## **Troubleshooting**

If you see "Pinata credentials not configured" error:
1. Check that `.env` file exists in `client/` directory
2. Verify all three variables are set
3. Restart the development server
4. Check browser console for any additional errors
