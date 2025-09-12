-- Maintenance Management System (MMS) Database Schema
-- Version 3 with Service-Only support

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create centers table
CREATE TABLE centers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL CHECK(role IN ('super_admin','center_manager','receptionist','technician','storekeeper','customer')),
    center_id INTEGER NULL REFERENCES centers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    type TEXT CHECK(type IN ('distributor','consumer')) DEFAULT 'consumer',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create devices table
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    name TEXT NOT NULL,
    serial_number TEXT UNIQUE,
    warranty BOOLEAN DEFAULT FALSE,
    warranty_expiry DATE NULL,
    accessories JSONB DEFAULT '[]'::jsonb,
    status TEXT CHECK(status IN ('active','replaced','archived')) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create maintenance_requests table with Service-Only support
CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    device_id INTEGER REFERENCES devices(id),
    issue TEXT NOT NULL,
    under_warranty BOOLEAN DEFAULT FALSE,
    -- Service-Only support fields
    service_only BOOLEAN DEFAULT FALSE,
    service_fee NUMERIC DEFAULT 0,
    service_fee_type TEXT CHECK(service_fee_type IN ('free','paid')) DEFAULT 'free',
    -- End service fields
    status TEXT CHECK(status IN ('new','assigned','in_progress','waiting_parts','fixed','cannot_repair','delivered','closed')) DEFAULT 'new',
    created_by UUID REFERENCES users(id),
    assigned_to UUID NULL REFERENCES users(id),
    center_id INTEGER REFERENCES centers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create followups table
CREATE TABLE followups (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id),
    status TEXT CHECK(status IN ('in_progress','waiting_parts','fixed','cannot_repair')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spare_parts table
CREATE TABLE spare_parts (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    warranty BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES spare_parts(id) ON DELETE CASCADE,
    center_id INTEGER REFERENCES centers(id),
    qty_added INTEGER DEFAULT 0,
    qty_available INTEGER DEFAULT 0,
    qty_sold INTEGER DEFAULT 0,
    qty_reserved INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(part_id, center_id)
);

-- Create stock_movements table
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES spare_parts(id),
    center_id INTEGER REFERENCES centers(id),
    type TEXT CHECK(type IN ('add','issue','return','scrap')),
    quantity INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    related_request_id INTEGER NULL REFERENCES maintenance_requests(id),
    meta JSONB NULL
);

-- Create sales table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    part_id INTEGER REFERENCES spare_parts(id),
    price NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    created_by UUID REFERENCES users(id),
    center_id INTEGER REFERENCES centers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER NULL,
    meta JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scrap_parts table
CREATE TABLE scrap_parts (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES spare_parts(id),
    center_id INTEGER REFERENCES centers(id),
    quantity INTEGER NOT NULL,
    reason TEXT,
    related_request_id INTEGER NULL REFERENCES maintenance_requests(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device_replacements table
CREATE TABLE device_replacements (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    old_device_id INTEGER REFERENCES devices(id),
    new_device_id INTEGER REFERENCES devices(id),
    reason TEXT,
    created_by UUID REFERENCES users(id),
    center_id INTEGER REFERENCES centers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_charges table for Service-Only billing
CREATE TABLE service_charges (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES maintenance_requests(id),
    amount NUMERIC NOT NULL,
    note TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_center_id ON maintenance_requests(center_id);
CREATE INDEX idx_maintenance_requests_created_at ON maintenance_requests(created_at);
CREATE INDEX idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_spare_parts_code ON spare_parts(code);
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_inventory_part_center ON inventory(part_id, center_id);
CREATE INDEX idx_stock_movements_part_id ON stock_movements(part_id);
CREATE INDEX idx_stock_movements_center_id ON stock_movements(center_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_scrap_parts_created_at ON scrap_parts(created_at);
CREATE INDEX idx_device_replacements_created_at ON device_replacements(created_at);

-- Create function to get current user's center
CREATE OR REPLACE FUNCTION current_user_center()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT center_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_replacements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Super admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center managers can view users in their center" ON users
    FOR SELECT USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'super_admin'))
    );

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Customers policies
CREATE POLICY "Super admin can manage all customers" ON customers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage customers" ON customers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'receptionist', 'super_admin'))
    );

-- Devices policies
CREATE POLICY "Super admin can manage all devices" ON devices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage devices" ON devices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'receptionist', 'technician', 'super_admin'))
    );

-- Maintenance requests policies
CREATE POLICY "Super admin can manage all requests" ON maintenance_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage requests in their center" ON maintenance_requests
    FOR ALL USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'receptionist', 'technician', 'super_admin'))
    );

CREATE POLICY "Technicians can view assigned requests" ON maintenance_requests
    FOR SELECT USING (
        assigned_to = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'technician')
    );

-- Followups policies
CREATE POLICY "Super admin can manage all followups" ON followups
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Technicians can manage their followups" ON followups
    FOR ALL USING (
        technician_id = auth.uid() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'technician')
    );

-- Spare parts policies
CREATE POLICY "All authenticated users can view spare parts" ON spare_parts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admin and storekeepers can manage spare parts" ON spare_parts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'storekeeper'))
    );

-- Inventory policies
CREATE POLICY "Super admin can manage all inventory" ON inventory
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Storekeepers can manage inventory in their center" ON inventory
    FOR ALL USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('storekeeper', 'center_manager', 'super_admin'))
    );

-- Stock movements policies
CREATE POLICY "Super admin can view all stock movements" ON stock_movements
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can view stock movements in their center" ON stock_movements
    FOR SELECT USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'storekeeper', 'technician', 'super_admin'))
    );

-- Sales policies
CREATE POLICY "Super admin can manage all sales" ON sales
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage sales in their center" ON sales
    FOR ALL USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'receptionist', 'storekeeper', 'super_admin'))
    );

-- Activity log policies
CREATE POLICY "Super admin can view all activity logs" ON activity_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center managers can view activity logs in their center" ON activity_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'super_admin'))
    );

-- Scrap parts policies
CREATE POLICY "Super admin can manage all scrap parts" ON scrap_parts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage scrap parts in their center" ON scrap_parts
    FOR ALL USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'storekeeper', 'technician', 'super_admin'))
    );

-- Device replacements policies
CREATE POLICY "Super admin can manage all device replacements" ON device_replacements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage device replacements in their center" ON device_replacements
    FOR ALL USING (
        center_id = current_user_center() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'technician', 'super_admin'))
    );

-- Service charges policies
CREATE POLICY "Super admin can manage all service charges" ON service_charges
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Center staff can manage service charges in their center" ON service_charges
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('center_manager', 'receptionist', 'super_admin'))
    );

-- Comments for documentation
COMMENT ON TABLE centers IS 'Service centers/branches in the system';
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE customers IS 'Customer information and type classification';
COMMENT ON TABLE devices IS 'Customer devices with warranty and accessory information';
COMMENT ON TABLE maintenance_requests IS 'Maintenance requests with Service-Only support for fee-based services';
COMMENT ON TABLE followups IS 'Technician follow-up notes and status updates';
COMMENT ON TABLE spare_parts IS 'Spare parts catalog with pricing and warranty info';
COMMENT ON TABLE inventory IS 'Stock levels per center for each spare part';
COMMENT ON TABLE stock_movements IS 'Audit trail of all stock movements (add, issue, return, scrap)';
COMMENT ON TABLE sales IS 'Sales transactions for spare parts';
COMMENT ON TABLE activity_log IS 'System activity audit trail';
COMMENT ON TABLE scrap_parts IS 'Scrapped parts with reasons and tracking';
COMMENT ON TABLE device_replacements IS 'Device replacement tracking and history';
COMMENT ON TABLE service_charges IS 'Service-only maintenance charges and fees';