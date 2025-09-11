# Maintenance Management System (MMS) v3.0

A comprehensive fullstack maintenance management system with Service-Only support, built with React (Vite), Supabase (PostgreSQL + Auth), and deployed on Vercel.

## Features

### Core Features
- **Maintenance Request Management** - Create, assign, track, and manage maintenance requests
- **Service-Only Support** - Handle service-only maintenance with fee management
- **Inventory Management** - Track spare parts, stock levels, and movements
- **Customer Management** - Manage customer information and device tracking
- **User Management** - Role-based access control (Super Admin, Center Manager, Receptionist, Technician, Storekeeper, Customer)
- **Multi-Center Support** - Manage multiple service centers/branches

### Advanced Features
- **Global Search** - Search across requests, customers, and spare parts
- **Import/Export** - CSV import/export for bulk data management
- **Scrap Parts Management** - Track and manage scrapped parts
- **Device Replacements** - Handle device replacement workflows
- **Activity Logging** - Comprehensive audit trail
- **Reports & Analytics** - Generate various reports and insights
- **Print Templates** - Printable receipts, invoices, and reports
- **PWA Support** - Progressive Web App with offline capabilities

### Technical Features
- **Dark/Light Theme** - User preference with system detection
- **Responsive Design** - Mobile-first responsive design
- **Accessibility** - WCAG compliant accessibility features
- **Real-time Updates** - Live data updates using Supabase
- **Role-Based Security** - Row Level Security (RLS) policies
- **Transaction Safety** - Database transactions with rollback support

## Tech Stack

- **Frontend**: React 18, Vite, Styled Components, React Router
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel
- **Database**: PostgreSQL with RLS policies
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Charts**: Recharts
- **CSV Processing**: Papa Parse

## Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### 1. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the following files in order:
   - `schema.sql` - Creates all tables, indexes, and RLS policies
   - `rpc.sql` - Creates stored procedures and triggers
   - `seed.sql` - Inserts sample data and creates first super admin

3. Enable Row Level Security on all tables (already included in schema.sql)

### 2. Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd mms-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

### 3. Environment Variables

Create `.env.local` in the frontend directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. First Login

After running the seed data, the first user to sign up will automatically get `super_admin` role. You can then:

1. Create additional users through the Users page
2. Set up service centers
3. Import sample data using the Import/Export page

## Database Schema

### Core Tables
- `users` - System users with role-based access
- `centers` - Service centers/branches
- `customers` - Customer information
- `devices` - Customer devices with warranty tracking
- `maintenance_requests` - Maintenance requests with Service-Only support
- `followups` - Technician follow-up notes
- `spare_parts` - Spare parts catalog
- `inventory` - Stock levels per center
- `stock_movements` - Audit trail of all stock movements
- `sales` - Sales transactions
- `activity_log` - System activity audit trail

### Service-Only Tables
- `service_charges` - Service-only maintenance charges
- `scrap_parts` - Scrapped parts tracking
- `device_replacements` - Device replacement history

## API Functions

### RPC Functions (Stored Procedures)
- `assign_request()` - Assign request to technician
- `close_request()` - Close maintenance request
- `add_stock()` - Add stock to inventory
- `issue_stock()` - Issue stock from inventory
- `return_stock()` - Return stock to inventory
- `mark_scrap()` - Mark parts as scrap
- `create_sale()` - Create sales transaction
- `create_device_replacement()` - Handle device replacement
- `create_service_only_charge()` - Create service charges
- `get_request_details()` - Get detailed request information
- `search_requests()` - Search maintenance requests
- `get_dashboard_stats()` - Get dashboard statistics

## User Roles & Permissions

### Super Admin
- Full system access
- User management
- Center management
- All CRUD operations

### Center Manager
- Manage their center's data
- View reports and analytics
- Assign requests to technicians
- Manage inventory

### Receptionist
- Create customers and requests
- View center requests
- Basic customer management

### Technician
- View assigned requests
- Add follow-up notes
- Update request status
- Request parts

### Storekeeper
- Full inventory management
- Stock movements
- Spare parts management
- Sales transactions

### Customer
- View own requests and devices
- Basic profile management

## Import/Export

### Supported Formats
- CSV import/export for all major entities
- Template generation for easy data entry
- Validation and preview before import
- Bulk operations with error handling

### Example CSV Files
- `spare_parts.csv` - Spare parts catalog
- `customers_seed.csv` - Customer data
- `inventory_seed.csv` - Inventory levels

## Print Templates

### Available Templates
- Maintenance Receipt - Service completion receipt
- Sales Invoice - Parts sales invoice
- Stock In Voucher - Inventory receipt
- Stock Out Voucher - Inventory issue
- Item Movement Report - Stock movement history

### Print Features
- QR codes for tracking
- Professional formatting
- Print-optimized layouts
- Company branding support

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Development

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components
│   │   ├── common/          # Reusable components
│   │   ├── requests/        # Request-specific components
│   │   └── inventory/       # Inventory components
│   ├── pages/               # Page components
│   ├── lib/                 # Supabase client
│   ├── utils/               # Utility functions
│   └── theme.js             # Theme configuration
├── public/                  # Static assets
└── package.json
```

### Key Components
- `ThemeProvider` - Dark/light theme management
- `AppLayout` - Main application layout
- `Table` - Reusable data table with search/filter
- `Modal` - Reusable modal component
- `DashboardWidget` - Dashboard statistics widget
- `CSVUploader` - CSV import functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Changelog

### v3.0.0
- Added Service-Only maintenance support
- Enhanced import/export functionality
- Improved UI/UX with dark/light themes
- Added PWA support
- Enhanced security with RLS policies
- Added comprehensive audit logging
- Improved mobile responsiveness

### v2.0.0
- Multi-center support
- Enhanced inventory management
- Improved user roles and permissions
- Added global search functionality

### v1.0.0
- Initial release
- Basic maintenance request management
- Customer and device management
- Inventory tracking
- User authentication