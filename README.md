# Designwear Backend

Designwear Backend is the core API and CMS integration layer for the Designwear application. It leverages Next.js, Sanity CMS, Firebase Admin, and Razorpay for payments to deliver a scalable and robust e-commerce and content management platform.

## Features

- **Next.js App Router**: Optimized, server-rendered React applications.
- **Sanity CMS**: Structured content management.
- **Razorpay Integration**: Seamless payment processing.
- **Firebase Admin**: Authentication and secure server-to-server operations.
- **GenAI**: AI-powered features using `@google/genai`.
- **Winston**: Advanced structured logging.

## Prerequisites

- Node.js >= 20
- npm or yarn

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/kasinadhsarma1/designwear
   cd designwear-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with the required keys for Sanity, Firebase, and Razorpay.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

## Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint to check for code quality issues.

## Documentation

For more detailed information concerning the architecture, API design, and other specifications, please refer to the files in the `docs/` directory.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Security

Please refer to [SECURITY.md](./SECURITY.md) for vulnerability reporting guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
