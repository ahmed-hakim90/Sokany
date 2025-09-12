-- Maintenance Management System (MMS) Seed Data
-- Version 3 with Service-Only support

-- Insert sample centers
INSERT INTO centers (name, address) VALUES
('Main Service Center', '123 Main Street, Downtown'),
('North Branch', '456 North Avenue, North District'),
('South Branch', '789 South Road, South District'),
('East Branch', '321 East Boulevard, East District'),
('West Branch', '654 West Street, West District');

-- Insert sample spare parts
INSERT INTO spare_parts (code, name, price, warranty) VALUES
('SP001', 'Samsung Galaxy S21 Screen', 150.00, true),
('SP002', 'iPhone 12 Battery', 80.00, true),
('SP003', 'MacBook Pro Charger', 120.00, true),
('SP004', 'Dell Laptop Keyboard', 45.00, false),
('SP005', 'HP Printer Cartridge', 25.00, false),
('SP006', 'Sony Headphone Cable', 15.00, false),
('SP007', 'Canon Camera Lens', 300.00, true),
('SP008', 'Nintendo Switch Joy-Con', 40.00, true),
('SP009', 'Xbox Controller', 60.00, true),
('SP010', 'PlayStation DualShock', 55.00, true),
('SP011', 'Generic USB Cable', 8.00, false),
('SP012', 'Power Bank 10000mAh', 35.00, true),
('SP013', 'Bluetooth Speaker', 75.00, true),
('SP014', 'Smart Watch Band', 20.00, false),
('SP015', 'Tablet Screen Protector', 12.00, false);

-- Insert sample customers
INSERT INTO customers (name, phone, address, type, created_by) VALUES
('Ahmed Hassan', '+966501234567', 'Riyadh, Saudi Arabia', 'consumer', NULL),
('Sara Al-Mansouri', '+966507654321', 'Jeddah, Saudi Arabia', 'consumer', NULL),
('Tech Solutions LLC', '+966112345678', 'Dammam, Saudi Arabia', 'distributor', NULL),
('Mohammed Al-Rashid', '+966509876543', 'Mecca, Saudi Arabia', 'consumer', NULL),
('Electronics Plus', '+966113456789', 'Medina, Saudi Arabia', 'distributor', NULL),
('Fatima Al-Zahra', '+966501112233', 'Taif, Saudi Arabia', 'consumer', NULL),
('Gadget World', '+966114567890', 'Khobar, Saudi Arabia', 'distributor', NULL),
('Omar Al-Sheikh', '+966502223344', 'Abha, Saudi Arabia', 'consumer', NULL),
('Tech Hub', '+966115678901', 'Tabuk, Saudi Arabia', 'distributor', NULL),
('Layla Al-Mutairi', '+966503334455', 'Hail, Saudi Arabia', 'consumer', NULL);

-- Insert sample devices
INSERT INTO devices (customer_id, name, serial_number, warranty, warranty_expiry, accessories, created_by) VALUES
(1, 'Samsung Galaxy S21', 'SN-S21-001', true, '2024-12-31', '["charger", "earphones", "case"]', NULL),
(1, 'iPhone 12 Pro', 'SN-IP12-001', true, '2024-06-15', '["charger", "case"]', NULL),
(2, 'MacBook Pro 13"', 'SN-MBP-001', true, '2025-03-20', '["charger", "mouse"]', NULL),
(2, 'iPad Air', 'SN-IPA-001', true, '2024-09-10', '["pencil", "keyboard"]', NULL),
(3, 'Dell XPS 15', 'SN-DXPS-001', false, NULL, '["charger"]', NULL),
(3, 'HP LaserJet Printer', 'SN-HP-001', true, '2024-11-30', '["cables", "manual"]', NULL),
(4, 'Sony WH-1000XM4', 'SN-SONY-001', true, '2024-08-25', '["cable", "case"]', NULL),
(4, 'Canon EOS R5', 'SN-CANON-001', true, '2025-01-15', '["lens", "battery", "memory card"]', NULL),
(5, 'Nintendo Switch', 'SN-NS-001', true, '2024-07-30', '["joy-cons", "dock"]', NULL),
(5, 'PlayStation 5', 'SN-PS5-001', true, '2025-02-28', '["controller", "cables"]', NULL);

-- Insert initial inventory for each center
INSERT INTO inventory (part_id, center_id, qty_added, qty_available, qty_sold, qty_reserved) VALUES
-- Main Service Center inventory
(1, 1, 50, 45, 5, 0),
(2, 1, 30, 25, 5, 0),
(3, 1, 20, 18, 2, 0),
(4, 1, 40, 35, 5, 0),
(5, 1, 100, 90, 10, 0),
(6, 1, 60, 55, 5, 0),
(7, 1, 15, 12, 3, 0),
(8, 1, 25, 20, 5, 0),
(9, 1, 30, 25, 5, 0),
(10, 1, 25, 20, 5, 0),
(11, 1, 200, 180, 20, 0),
(12, 1, 40, 35, 5, 0),
(13, 1, 20, 15, 5, 0),
(14, 1, 50, 45, 5, 0),
(15, 1, 100, 90, 10, 0),

-- North Branch inventory
(1, 2, 30, 25, 5, 0),
(2, 2, 20, 15, 5, 0),
(3, 2, 15, 12, 3, 0),
(4, 2, 25, 20, 5, 0),
(5, 2, 60, 50, 10, 0),
(6, 2, 40, 35, 5, 0),
(7, 2, 10, 8, 2, 0),
(8, 2, 15, 12, 3, 0),
(9, 2, 20, 15, 5, 0),
(10, 2, 15, 12, 3, 0),
(11, 2, 120, 100, 20, 0),
(12, 2, 25, 20, 5, 0),
(13, 2, 15, 10, 5, 0),
(14, 2, 30, 25, 5, 0),
(15, 2, 60, 50, 10, 0),

-- South Branch inventory
(1, 3, 25, 20, 5, 0),
(2, 3, 15, 10, 5, 0),
(3, 3, 12, 9, 3, 0),
(4, 3, 20, 15, 5, 0),
(5, 3, 50, 40, 10, 0),
(6, 3, 35, 30, 5, 0),
(7, 3, 8, 6, 2, 0),
(8, 3, 12, 9, 3, 0),
(9, 3, 15, 10, 5, 0),
(10, 3, 12, 9, 3, 0),
(11, 3, 100, 80, 20, 0),
(12, 3, 20, 15, 5, 0),
(13, 3, 12, 7, 5, 0),
(14, 3, 25, 20, 5, 0),
(15, 3, 50, 40, 10, 0),

-- East Branch inventory
(1, 4, 20, 15, 5, 0),
(2, 4, 12, 7, 5, 0),
(3, 4, 10, 7, 3, 0),
(4, 4, 15, 10, 5, 0),
(5, 4, 40, 30, 10, 0),
(6, 4, 30, 25, 5, 0),
(7, 4, 6, 4, 2, 0),
(8, 4, 10, 7, 3, 0),
(9, 4, 12, 7, 5, 0),
(10, 4, 10, 7, 3, 0),
(11, 4, 80, 60, 20, 0),
(12, 4, 15, 10, 5, 0),
(13, 4, 10, 5, 5, 0),
(14, 4, 20, 15, 5, 0),
(15, 4, 40, 30, 10, 0),

-- West Branch inventory
(1, 5, 15, 10, 5, 0),
(2, 5, 10, 5, 5, 0),
(3, 5, 8, 5, 3, 0),
(4, 5, 12, 7, 5, 0),
(5, 5, 30, 20, 10, 0),
(6, 5, 25, 20, 5, 0),
(7, 5, 5, 3, 2, 0),
(8, 5, 8, 5, 3, 0),
(9, 5, 10, 5, 5, 0),
(10, 5, 8, 5, 3, 0),
(11, 5, 60, 40, 20, 0),
(12, 5, 12, 7, 5, 0),
(13, 5, 8, 3, 5, 0),
(14, 5, 15, 10, 5, 0),
(15, 5, 30, 20, 10, 0);

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (customer_id, device_id, issue, under_warranty, service_only, service_fee, service_fee_type, status, created_by, assigned_to, center_id) VALUES
(1, 1, 'Screen cracked after drop', false, false, 0, 'free', 'new', NULL, NULL, 1),
(2, 3, 'Battery not holding charge', true, false, 0, 'free', 'assigned', NULL, NULL, 1),
(3, 5, 'Keyboard keys not responding', false, false, 0, 'free', 'in_progress', NULL, NULL, 2),
(4, 7, 'No sound from left earcup', true, false, 0, 'free', 'waiting_parts', NULL, NULL, 1),
(5, 9, 'Joy-Con drift issue', true, false, 0, 'free', 'fixed', NULL, NULL, 3),
(6, 2, 'Screen replacement needed', false, false, 0, 'free', 'delivered', NULL, NULL, 1),
(7, 4, 'Charging port not working', true, false, 0, 'free', 'cannot_repair', NULL, NULL, 2),
(8, 8, 'Lens autofocus not working', true, false, 0, 'free', 'closed', NULL, NULL, 1),
(9, 10, 'Controller not connecting', true, false, 0, 'free', 'new', NULL, NULL, 4),
(10, 6, 'Printer not printing', false, false, 0, 'free', 'assigned', NULL, NULL, 3),
-- Service-only requests
(1, 1, 'Software update and optimization', false, true, 50.00, 'paid', 'new', NULL, NULL, 1),
(2, 3, 'Data backup and transfer', false, true, 75.00, 'paid', 'assigned', NULL, NULL, 1),
(3, 5, 'System cleaning and maintenance', false, true, 30.00, 'paid', 'in_progress', NULL, NULL, 2),
(4, 7, 'Firmware update', true, true, 0, 'free', 'fixed', NULL, NULL, 1),
(5, 9, 'Data recovery service', false, true, 100.00, 'paid', 'new', NULL, NULL, 3);

-- Insert sample followups
INSERT INTO followups (request_id, technician_id, status, note) VALUES
(2, NULL, 'in_progress', 'Diagnosed battery issue, ordering replacement part'),
(3, NULL, 'in_progress', 'Cleaned keyboard contacts, testing individual keys'),
(4, NULL, 'waiting_parts', 'Left earcup needs replacement, part ordered'),
(5, NULL, 'fixed', 'Replaced Joy-Con analog stick, tested and working'),
(7, NULL, 'cannot_repair', 'Charging port severely damaged, device beyond repair'),
(8, NULL, 'fixed', 'Replaced autofocus motor, camera working perfectly'),
(10, NULL, 'in_progress', 'Cleaned print heads, testing print quality'),
(12, NULL, 'in_progress', 'Backing up data to external drive'),
(13, NULL, 'in_progress', 'Cleaning internal components and fans'),
(14, NULL, 'fixed', 'Firmware updated successfully, device working');

-- Insert sample stock movements
INSERT INTO stock_movements (part_id, center_id, type, quantity, created_by, related_request_id) VALUES
(1, 1, 'add', 50, NULL, NULL),
(2, 1, 'add', 30, NULL, NULL),
(3, 1, 'add', 20, NULL, NULL),
(4, 1, 'add', 40, NULL, NULL),
(5, 1, 'add', 100, NULL, NULL),
(1, 1, 'issue', 1, NULL, 1),
(2, 1, 'issue', 1, NULL, 2),
(4, 2, 'issue', 1, NULL, 3),
(6, 1, 'issue', 1, NULL, 4),
(8, 3, 'issue', 1, NULL, 5),
(1, 1, 'issue', 1, NULL, 6),
(3, 2, 'issue', 1, NULL, 7),
(7, 1, 'issue', 1, NULL, 8),
(9, 4, 'issue', 1, NULL, 9),
(5, 3, 'issue', 1, NULL, 10);

-- Insert sample sales
INSERT INTO sales (customer_id, part_id, price, discount, total, created_by, center_id) VALUES
(1, 1, 150.00, 10.00, 140.00, NULL, 1),
(2, 2, 80.00, 0.00, 80.00, NULL, 1),
(3, 4, 45.00, 5.00, 40.00, NULL, 2),
(4, 6, 15.00, 0.00, 15.00, NULL, 1),
(5, 8, 40.00, 0.00, 40.00, NULL, 3),
(6, 1, 150.00, 15.00, 135.00, NULL, 1),
(7, 3, 120.00, 0.00, 120.00, NULL, 2),
(8, 7, 300.00, 20.00, 280.00, NULL, 1),
(9, 9, 60.00, 0.00, 60.00, NULL, 4),
(10, 5, 25.00, 0.00, 25.00, NULL, 3);

-- Insert sample scrap parts
INSERT INTO scrap_parts (part_id, center_id, quantity, reason, related_request_id, created_by) VALUES
(1, 1, 2, 'Damaged during installation', 1, NULL),
(2, 1, 1, 'Defective battery cell', 2, NULL),
(4, 2, 1, 'Keyboard membrane torn', 3, NULL),
(6, 1, 1, 'Cable frayed and unusable', 4, NULL),
(8, 3, 1, 'Analog stick mechanism broken', 5, NULL);

-- Insert sample device replacements
INSERT INTO device_replacements (customer_id, old_device_id, new_device_id, reason, created_by, center_id) VALUES
(1, 1, 1, 'Screen replacement not cost-effective', NULL, 1),
(7, 7, 7, 'Charging port beyond repair', NULL, 2);

-- Insert sample service charges
INSERT INTO service_charges (request_id, amount, note, created_by) VALUES
(11, 50.00, 'Software update and device optimization service', NULL),
(12, 75.00, 'Data backup and transfer to new device', NULL),
(13, 30.00, 'System cleaning and maintenance service', NULL),
(15, 100.00, 'Data recovery from corrupted storage', NULL);

-- Insert sample activity log entries
INSERT INTO activity_log (user_id, action, entity, entity_id, meta) VALUES
(NULL, 'created', 'maintenance_requests', 1, '{"issue": "Screen cracked after drop", "customer_id": 1}'),
(NULL, 'created', 'maintenance_requests', 2, '{"issue": "Battery not holding charge", "customer_id": 2}'),
(NULL, 'created', 'maintenance_requests', 3, '{"issue": "Keyboard keys not responding", "customer_id": 3}'),
(NULL, 'assigned_request', 'maintenance_requests', 2, '{"technician_id": null}'),
(NULL, 'added_stock', 'inventory', 1, '{"center_id": 1, "quantity": 50}'),
(NULL, 'issued_stock', 'inventory', 1, '{"center_id": 1, "quantity": 1, "request_id": 1}'),
(NULL, 'created_sale', 'sales', 1, '{"customer_id": 1, "part_id": 1, "total": 140.00}'),
(NULL, 'marked_scrap', 'scrap_parts', 1, '{"center_id": 1, "quantity": 2, "reason": "Damaged during installation"}'),
(NULL, 'service_fee_charged', 'service_charges', 1, '{"request_id": 11, "amount": 50.00}'),
(NULL, 'created_device_replacement', 'device_replacements', 1, '{"customer_id": 1, "old_device_id": 1, "new_device_id": 1}');

-- Note: The super_admin user will be created automatically when they sign up through Supabase Auth
-- The user profile will be created via a trigger or application logic
-- This ensures the first user gets super_admin role automatically

-- Create a function to auto-assign super_admin role to first user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user (no other users exist)
    IF NOT EXISTS (SELECT 1 FROM users WHERE id != NEW.id) THEN
        -- First user gets super_admin role
        INSERT INTO users (id, name, role, created_at, updated_at)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Super Admin'), 'super_admin', NOW(), NOW());
    ELSE
        -- Subsequent users get customer role by default
        INSERT INTO users (id, name, role, created_at, updated_at)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 'customer', NOW(), NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;