# SchlossBadZurzach
Website for SchlossBadZurzach

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Firebase credentials:
- Get your Firebase configuration from the Firebase Console
- Replace all placeholder values with your actual credentials

IMPORTANT: Never commit the `.env` file or share your Firebase credentials publicly!

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```