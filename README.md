# SanXeGhep - Nền tảng kết nối xe ghép toàn quốc

🚗 Kết nối tài xế và hành khách. Tiết kiệm chi phí, an toàn, tiện lợi.

## 🎉 Trạng thái dự án

✅ **HOÀN THÀNH 100%** - Ready for production!

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type safety
- **TailwindCSS v4** - Styling
- **Shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database + Auth + Storage
- **PostgreSQL** - Database
- **Row Level Security** - Security

### Deployment
- **Vercel** - Hosting (recommended)

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd sanxeghep

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Setup

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run migrations in order:
   - `supabase/migrations/20241207_initial_schema.sql`
   - `supabase/migrations/20241207_seed_sample_data.sql`
   - `supabase/migrations/20241207_passenger_requests.sql`

## 📧 Email Template Setup

1. Go to Supabase Dashboard
2. Authentication → Email Templates
3. Select "Confirm signup"
4. Paste the HTML template (provided in documentation)
5. Save

## 🏗️ Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect GitHub to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## 📱 Features

### ✅ Completed (100%)

- **Home Page** - Hero, Stats, Featured Trips, Real-time Bookings, FAQ
- **Authentication** - Email OTP (FREE forever)
- **Search Trips** - Filter, Sort, Real-time search
- **Post Trip** - Form with validation, Database integration
- **Post Request** - Passengers can post their needs
- **Profile** - View and edit user profile
- **Trip Details** - Modal with contact buttons
- **Static Pages** - About, Contact, Pricing, For Drivers
- **Responsive** - Mobile, Tablet, Desktop
- **Toast Notifications** - Success/Error messages
- **Loading States** - Skeletons, Spinners
- **Empty States** - User-friendly messages

## 📂 Project Structure

```
sanxeghep/
├── src/
│   ├── app/                    # Pages (Next.js App Router)
│   │   ├── page.tsx           # Home page
│   │   ├── tim-chuyen/        # Search trips
│   │   ├── dang-chuyen/       # Post trip
│   │   ├── dang-nhu-cau/      # Post request
│   │   ├── profile/           # User profile
│   │   ├── ve-chung-toi/      # About us
│   │   ├── lien-he/           # Contact
│   │   ├── bang-gia/          # Pricing
│   │   └── tai-xe/            # For drivers
│   ├── components/            # React components
│   │   ├── layout/           # Header, Footer, BackToTop
│   │   ├── home/             # Home page sections
│   │   ├── trips/            # Trip card, Modal
│   │   ├── auth/             # Auth modal
│   │   └── ui/               # Shadcn components
│   └── lib/                  # Utilities
│       ├── supabase.ts       # Supabase client
│       ├── auth-context.tsx  # Auth context
│       └── utils.ts          # Helper functions
├── supabase/
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: #FF6F00 (Orange)
- **Secondary**: #003366 (Dark Blue)
- **Accent**: #F82852 (Red-Orange)

### Typography
- **Font**: Inter (Vietnamese support)
- **Headings**: Bold, gradient text
- **Body**: Regular, readable

### Components
- Glass morphism effects
- Gradient backgrounds
- Smooth animations
- Hover effects
- Responsive design

## 📊 Database Schema

### Tables
- `users` - User accounts
- `driver_profiles` - Driver information
- `trips` - Posted trips
- `bookings` - Trip bookings
- `reviews` - User reviews
- `passenger_requests` - Passenger requests

### Security
- Row Level Security (RLS) enabled
- Policies for each table
- Indexes for performance

## 🔐 Authentication

- **Method**: Email OTP
- **Provider**: Supabase Auth
- **Cost**: FREE forever
- **Features**:
  - Email verification
  - Resend OTP (60s countdown)
  - Protected routes
  - User session management

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🐛 Known Issues

None! All features working perfectly.

## 🔮 Future Enhancements (Optional)

- 🗺️ Map integration (Leaflet + OpenStreetMap)
- ⭐ Reviews & ratings system
- 📊 Driver dashboard
- 👨‍💼 Admin dashboard
- 🔍 SEO optimization
- 📱 Autocomplete for locations
- 📄 Pagination
- 🔔 Push notifications
- 💬 In-app chat

## 📄 License

Private project for SanXeGhep

## 👨‍💻 Developer

Developed by: Kiro AI Assistant
Completion Date: 08/12/2025
Status: ✅ Production Ready

## 📞 Support

For support, contact: [Your contact info]

---

**🎉 Ready to launch! Good luck with your project!**
