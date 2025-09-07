# SnapVote - Polling App with QR Code Sharing

A modern polling application built with Next.js, Supabase, and TypeScript that allows users to create polls, vote, and share them via QR codes.

## Features

- 🗳️ Create and manage polls with multiple options
- 📊 Real-time voting and results
- 🔐 User authentication and session management
- 📱 QR code generation for easy poll sharing
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- ⚡ Built with Next.js 15 and React 19
- 🧪 Comprehensive testing with Jest

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Supabase account** and project setup

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd snapvote
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations (if needed)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### How to get Supabase credentials:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys** → **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API Keys** → **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (if needed)

### 4. Database Setup

Run the database migrations (if any) in your Supabase project:

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migration files from `supabase/migrations/` directory
3. Or use the Supabase CLI if you have it set up:

```bash
supabase db push
```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode

## Testing

Run the test suite:

```bash
npm run test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Project Structure

```
snapvote/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── polls/             # Poll-related pages and actions
│   ├── profile/           # User profile page
│   └── settings/          # User settings page
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── context/              # React context providers
├── lib/                  # Utility functions and configurations
├── supabase/            # Database migrations
└── public/              # Static assets
```

## Key Features

### Authentication
- User registration and login
- Session management with configurable timeouts
- Protected routes and authorization

### Poll Management
- Create polls with multiple options
- Edit existing polls (with proper authorization)
- Real-time vote counting
- QR code generation for sharing

### User Interface
- Responsive design with Tailwind CSS
- Modern UI components from shadcn/ui
- Form validation with Zod schemas
- Toast notifications for user feedback

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms

This Next.js application can be deployed on any platform that supports Node.js:

- **Netlify**
- **Railway**
- **Render**
- **AWS**
- **Google Cloud Platform**
- **Azure**

Make sure to:
1. Set the build command to `npm run build`
2. Set the start command to `npm run start`
3. Configure all required environment variables

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

---

**Happy Polling! 🗳️**
