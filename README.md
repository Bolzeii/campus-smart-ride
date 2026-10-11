# Campus Smart Ride

Campus Smart Ride is a full-stack web application designed to facilitate peer-to-peer ride-sharing among university students. The platform allows students to share commutes, reduce carbon footprints, and split travel costs. It features secure user authentication, interactive ride posting, and a booking management dashboard tailored for a college ecosystem.Tech Stack & FeaturesThis project utilizes a modern React ecosystem for the frontend and a Cloud PostgreSQL database for the backend.Frontend Framework: React 18 with TypeScript for type safety.Build Tool: Vite for fast hot-module replacement and optimized production builds.Styling: Tailwind CSS for responsive, utility-first component design.Backend & Database: Supabase (PostgreSQL) for user authentication, data storage, and row-level security.Core Capabilities:Secure student registration and session management.Interactive ride creation (specifying origin, destination, time, and available seats).Ride discovery system with booking capabilities.Personalized user dashboard to track offered rides and active bookings.Local Development SetupFollow these steps to run the project locally on your machine.Install Node.js: Ensure you have Node.js (version 18 or higher) installed on your system.Install Dependencies: Open your terminal in the root directory of the project and run:Bashnpm install
Environment Variables: Create a .env file in the root directory and add your Supabase connection details:Code snippetVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Database Migration: Run the provided SQL scripts located in the supabase/migrations/ folder inside your Supabase SQL editor to generate the required tables (profiles, rides, bookings).   Start the Server: Launch the Vite development server:Bashnpm run dev
View the Application: Open [http://localhost:5173](http://localhost:5173) in your web browser.

## Project Structure

The repository is organized to separate UI components, page routes, and backend configurations:

```plaintext
campus-smart-ride/

├── src/
│   ├── components/      # Reusable UI elements (AppLayout, Navbar, RideCard)
│   ├── lib/             # Utility functions and Supabase client configuration
│   ├── pages/           # Main application views (Dashboard, FindRide, etc.)
│   ├── App.tsx          # Main React router setup
│   └── main.tsx         # Application entry point
├── supabase/
│   └── migrations/      # SQL schemas for the database
├── index.html           # Main HTML document
└── package.json         # Project metadata and dependency tree
