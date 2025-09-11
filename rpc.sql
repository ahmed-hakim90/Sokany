-- Maintenance Management System (MMS) RPC Functions and Triggers
-- Version 3 with Service-Only support

-- Function to assign a maintenance request to a technician
CREATE OR REPLACE FUNCTION assign_request(
    request_id INTEGER,
    technician_id UUID,
    manager_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    request_exists BOOLEAN;
    technician_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF request_id IS NULL OR technician_id IS NULL OR manager_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    -- Check if request exists
    SELECT EXISTS(SELECT 1 FROM maintenance_requests WHERE id = request_id) INTO request_exists;
    IF NOT request_exists THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Check if technician exists and has correct role
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE id = technician_id AND role = 'technician'
    ) INTO technician_exists;
    IF NOT technician_exists THEN
        RETURN json_build_object('success', false, 'error', 'Invalid technician');
    END IF;

    -- Start transaction
    BEGIN
        -- Update the request
        UPDATE maintenance_requests 
        SET assigned_to = technician_id, 
            status = 'assigned',
            updated_at = NOW()
        WHERE id = request_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            manager_id, 
            'assigned_request', 
            'maintenance_requests', 
            request_id,
            json_build_object('technician_id', technician_id)
        );

        result := json_build_object('success', true, 'message', 'Request assigned successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close a maintenance request
CREATE OR REPLACE FUNCTION close_request(
    request_id INTEGER,
    manager_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    request_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF request_id IS NULL OR manager_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    -- Check if request exists
    SELECT EXISTS(SELECT 1 FROM maintenance_requests WHERE id = request_id) INTO request_exists;
    IF NOT request_exists THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Start transaction
    BEGIN
        -- Update the request
        UPDATE maintenance_requests 
        SET status = 'closed',
            updated_at = NOW()
        WHERE id = request_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            manager_id, 
            'closed_request', 
            'maintenance_requests', 
            request_id,
            json_build_object('closed_at', NOW())
        );

        result := json_build_object('success', true, 'message', 'Request closed successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add stock to inventory
CREATE OR REPLACE FUNCTION add_stock(
    part_id INTEGER,
    center_id INTEGER,
    qty INTEGER,
    user_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    part_exists BOOLEAN;
    center_exists BOOLEAN;
    current_qty INTEGER;
BEGIN
    -- Validate inputs
    IF part_id IS NULL OR center_id IS NULL OR qty IS NULL OR user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF qty <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
    END IF;

    -- Check if part exists
    SELECT EXISTS(SELECT 1 FROM spare_parts WHERE id = part_id) INTO part_exists;
    IF NOT part_exists THEN
        RETURN json_build_object('success', false, 'error', 'Part not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Start transaction
    BEGIN
        -- Insert stock movement
        INSERT INTO stock_movements (part_id, center_id, type, quantity, created_by)
        VALUES (part_id, center_id, 'add', qty, user_id);

        -- Update or insert inventory
        INSERT INTO inventory (part_id, center_id, qty_added, qty_available, updated_at)
        VALUES (part_id, center_id, qty, qty, NOW())
        ON CONFLICT (part_id, center_id)
        DO UPDATE SET
            qty_added = inventory.qty_added + qty,
            qty_available = inventory.qty_available + qty,
            updated_at = NOW();

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'added_stock', 
            'inventory', 
            part_id,
            json_build_object('center_id', center_id, 'quantity', qty)
        );

        result := json_build_object('success', true, 'message', 'Stock added successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to issue stock from inventory
CREATE OR REPLACE FUNCTION issue_stock(
    part_id INTEGER,
    center_id INTEGER,
    qty INTEGER,
    user_id UUID,
    request_id INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    available_qty INTEGER;
    part_exists BOOLEAN;
    center_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF part_id IS NULL OR center_id IS NULL OR qty IS NULL OR user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF qty <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
    END IF;

    -- Check if part exists
    SELECT EXISTS(SELECT 1 FROM spare_parts WHERE id = part_id) INTO part_exists;
    IF NOT part_exists THEN
        RETURN json_build_object('success', false, 'error', 'Part not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Check available quantity
    SELECT COALESCE(qty_available, 0) INTO available_qty
    FROM inventory 
    WHERE part_id = issue_stock.part_id AND center_id = issue_stock.center_id;

    IF available_qty < qty THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient stock available');
    END IF;

    -- Start transaction
    BEGIN
        -- Insert stock movement
        INSERT INTO stock_movements (part_id, center_id, type, quantity, created_by, related_request_id)
        VALUES (part_id, center_id, 'issue', qty, user_id, request_id);

        -- Update inventory
        UPDATE inventory 
        SET qty_available = qty_available - qty,
            qty_sold = qty_sold + qty,
            updated_at = NOW()
        WHERE part_id = issue_stock.part_id AND center_id = issue_stock.center_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'issued_stock', 
            'inventory', 
            part_id,
            json_build_object('center_id', center_id, 'quantity', qty, 'request_id', request_id)
        );

        result := json_build_object('success', true, 'message', 'Stock issued successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to return stock to inventory
CREATE OR REPLACE FUNCTION return_stock(
    part_id INTEGER,
    center_id INTEGER,
    qty INTEGER,
    user_id UUID,
    request_id INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    part_exists BOOLEAN;
    center_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF part_id IS NULL OR center_id IS NULL OR qty IS NULL OR user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF qty <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
    END IF;

    -- Check if part exists
    SELECT EXISTS(SELECT 1 FROM spare_parts WHERE id = part_id) INTO part_exists;
    IF NOT part_exists THEN
        RETURN json_build_object('success', false, 'error', 'Part not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Start transaction
    BEGIN
        -- Insert stock movement
        INSERT INTO stock_movements (part_id, center_id, type, quantity, created_by, related_request_id)
        VALUES (part_id, center_id, 'return', qty, user_id, request_id);

        -- Update inventory
        UPDATE inventory 
        SET qty_available = qty_available + qty,
            qty_sold = qty_sold - qty,
            updated_at = NOW()
        WHERE part_id = return_stock.part_id AND center_id = return_stock.center_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'returned_stock', 
            'inventory', 
            part_id,
            json_build_object('center_id', center_id, 'quantity', qty, 'request_id', request_id)
        );

        result := json_build_object('success', true, 'message', 'Stock returned successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark parts as scrap
CREATE OR REPLACE FUNCTION mark_scrap(
    part_id INTEGER,
    center_id INTEGER,
    qty INTEGER,
    reason TEXT,
    related_request_id INTEGER DEFAULT NULL,
    user_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    available_qty INTEGER;
    part_exists BOOLEAN;
    center_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF part_id IS NULL OR center_id IS NULL OR qty IS NULL OR user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF qty <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
    END IF;

    -- Check if part exists
    SELECT EXISTS(SELECT 1 FROM spare_parts WHERE id = part_id) INTO part_exists;
    IF NOT part_exists THEN
        RETURN json_build_object('success', false, 'error', 'Part not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Check available quantity
    SELECT COALESCE(qty_available, 0) INTO available_qty
    FROM inventory 
    WHERE part_id = mark_scrap.part_id AND center_id = mark_scrap.center_id;

    IF available_qty < qty THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient stock available');
    END IF;

    -- Start transaction
    BEGIN
        -- Insert scrap record
        INSERT INTO scrap_parts (part_id, center_id, quantity, reason, related_request_id, created_by)
        VALUES (part_id, center_id, qty, reason, related_request_id, user_id);

        -- Insert stock movement
        INSERT INTO stock_movements (part_id, center_id, type, quantity, created_by, related_request_id)
        VALUES (part_id, center_id, 'scrap', qty, user_id, related_request_id);

        -- Update inventory
        UPDATE inventory 
        SET qty_available = qty_available - qty,
            updated_at = NOW()
        WHERE part_id = mark_scrap.part_id AND center_id = mark_scrap.center_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'marked_scrap', 
            'scrap_parts', 
            part_id,
            json_build_object('center_id', center_id, 'quantity', qty, 'reason', reason, 'request_id', related_request_id)
        );

        result := json_build_object('success', true, 'message', 'Parts marked as scrap successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a sale
CREATE OR REPLACE FUNCTION create_sale(
    customer_id INTEGER,
    part_id INTEGER,
    price NUMERIC,
    discount NUMERIC DEFAULT 0,
    user_id UUID,
    center_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_amount NUMERIC;
    customer_exists BOOLEAN;
    part_exists BOOLEAN;
    center_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF customer_id IS NULL OR part_id IS NULL OR price IS NULL OR user_id IS NULL OR center_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF price <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Price must be positive');
    END IF;

    -- Check if customer exists
    SELECT EXISTS(SELECT 1 FROM customers WHERE id = customer_id) INTO customer_exists;
    IF NOT customer_exists THEN
        RETURN json_build_object('success', false, 'error', 'Customer not found');
    END IF;

    -- Check if part exists
    SELECT EXISTS(SELECT 1 FROM spare_parts WHERE id = part_id) INTO part_exists;
    IF NOT part_exists THEN
        RETURN json_build_object('success', false, 'error', 'Part not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Calculate total
    total_amount := price - COALESCE(discount, 0);

    -- Start transaction
    BEGIN
        -- Create sale record
        INSERT INTO sales (customer_id, part_id, price, discount, total, created_by, center_id)
        VALUES (customer_id, part_id, price, discount, total_amount, user_id, center_id);

        -- Issue stock (assuming 1 quantity for now, can be parameterized)
        PERFORM issue_stock(part_id, center_id, 1, user_id, NULL);

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'created_sale', 
            'sales', 
            (SELECT id FROM sales WHERE created_by = user_id ORDER BY created_at DESC LIMIT 1),
            json_build_object('customer_id', customer_id, 'part_id', part_id, 'total', total_amount)
        );

        result := json_build_object('success', true, 'message', 'Sale created successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create device replacement
CREATE OR REPLACE FUNCTION create_device_replacement(
    customer_id INTEGER,
    old_device_id INTEGER,
    new_device_meta JSONB,
    reason TEXT,
    created_by UUID,
    center_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    new_device_id INTEGER;
    customer_exists BOOLEAN;
    old_device_exists BOOLEAN;
    center_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF customer_id IS NULL OR old_device_id IS NULL OR new_device_meta IS NULL OR created_by IS NULL OR center_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    -- Check if customer exists
    SELECT EXISTS(SELECT 1 FROM customers WHERE id = customer_id) INTO customer_exists;
    IF NOT customer_exists THEN
        RETURN json_build_object('success', false, 'error', 'Customer not found');
    END IF;

    -- Check if old device exists
    SELECT EXISTS(SELECT 1 FROM devices WHERE id = old_device_id) INTO old_device_exists;
    IF NOT old_device_exists THEN
        RETURN json_build_object('success', false, 'error', 'Old device not found');
    END IF;

    -- Check if center exists
    SELECT EXISTS(SELECT 1 FROM centers WHERE id = center_id) INTO center_exists;
    IF NOT center_exists THEN
        RETURN json_build_object('success', false, 'error', 'Center not found');
    END IF;

    -- Start transaction
    BEGIN
        -- Create new device
        INSERT INTO devices (customer_id, name, serial_number, warranty, warranty_expiry, accessories, created_by)
        VALUES (
            customer_id,
            new_device_meta->>'name',
            new_device_meta->>'serial_number',
            COALESCE((new_device_meta->>'warranty')::boolean, false),
            (new_device_meta->>'warranty_expiry')::date,
            COALESCE(new_device_meta->'accessories', '[]'::jsonb),
            created_by
        )
        RETURNING id INTO new_device_id;

        -- Update old device status
        UPDATE devices 
        SET status = 'replaced',
            updated_at = NOW()
        WHERE id = old_device_id;

        -- Create replacement record
        INSERT INTO device_replacements (customer_id, old_device_id, new_device_id, reason, created_by, center_id)
        VALUES (customer_id, old_device_id, new_device_id, reason, created_by, center_id);

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            created_by, 
            'created_device_replacement', 
            'device_replacements', 
            (SELECT id FROM device_replacements WHERE created_by = create_device_replacement.created_by ORDER BY created_at DESC LIMIT 1),
            json_build_object('customer_id', customer_id, 'old_device_id', old_device_id, 'new_device_id', new_device_id, 'reason', reason)
        );

        result := json_build_object('success', true, 'message', 'Device replacement created successfully', 'new_device_id', new_device_id);
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create service-only charge
CREATE OR REPLACE FUNCTION create_service_only_charge(
    request_id INTEGER,
    user_id UUID,
    amount NUMERIC,
    note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    request_exists BOOLEAN;
    is_service_only BOOLEAN;
BEGIN
    -- Validate inputs
    IF request_id IS NULL OR user_id IS NULL OR amount IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    IF amount <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Amount must be positive');
    END IF;

    -- Check if request exists and is service-only
    SELECT EXISTS(SELECT 1 FROM maintenance_requests WHERE id = request_id), 
           COALESCE((SELECT service_only FROM maintenance_requests WHERE id = request_id), false)
    INTO request_exists, is_service_only;

    IF NOT request_exists THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF NOT is_service_only THEN
        RETURN json_build_object('success', false, 'error', 'Request is not marked as service-only');
    END IF;

    -- Start transaction
    BEGIN
        -- Create service charge record
        INSERT INTO service_charges (request_id, amount, note, created_by)
        VALUES (request_id, amount, note, user_id);

        -- Update request with service fee
        UPDATE maintenance_requests 
        SET service_fee = amount,
            service_fee_type = 'paid',
            updated_at = NOW()
        WHERE id = request_id;

        -- Log the activity
        INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
        VALUES (
            user_id, 
            'service_fee_charged', 
            'service_charges', 
            (SELECT id FROM service_charges WHERE created_by = user_id ORDER BY created_at DESC LIMIT 1),
            json_build_object('request_id', request_id, 'amount', amount, 'note', note)
        );

        result := json_build_object('success', true, 'message', 'Service charge created successfully');
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM);
    END;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get maintenance request details with related data
CREATE OR REPLACE FUNCTION get_request_details(request_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'request', (
            SELECT json_build_object(
                'id', mr.id,
                'issue', mr.issue,
                'status', mr.status,
                'service_only', mr.service_only,
                'service_fee', mr.service_fee,
                'service_fee_type', mr.service_fee_type,
                'under_warranty', mr.under_warranty,
                'created_at', mr.created_at,
                'customer', json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'phone', c.phone,
                    'type', c.type
                ),
                'device', json_build_object(
                    'id', d.id,
                    'name', d.name,
                    'serial_number', d.serial_number,
                    'warranty', d.warranty,
                    'warranty_expiry', d.warranty_expiry
                ),
                'assigned_technician', json_build_object(
                    'id', u.id,
                    'name', u.name
                )
            )
            FROM maintenance_requests mr
            LEFT JOIN customers c ON mr.customer_id = c.id
            LEFT JOIN devices d ON mr.device_id = d.id
            LEFT JOIN users u ON mr.assigned_to = u.id
            WHERE mr.id = request_id
        ),
        'followups', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', f.id,
                    'status', f.status,
                    'note', f.note,
                    'created_at', f.created_at,
                    'technician', json_build_object(
                        'id', u.id,
                        'name', u.name
                    )
                )
                ORDER BY f.created_at DESC
            ), '[]'::json)
            FROM followups f
            LEFT JOIN users u ON f.technician_id = u.id
            WHERE f.request_id = request_id
        ),
        'parts_used', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', sm.id,
                    'type', sm.type,
                    'quantity', sm.quantity,
                    'created_at', sm.created_at,
                    'part', json_build_object(
                        'id', sp.id,
                        'code', sp.code,
                        'name', sp.name,
                        'price', sp.price
                    )
                )
                ORDER BY sm.created_at DESC
            ), '[]'::json)
            FROM stock_movements sm
            LEFT JOIN spare_parts sp ON sm.part_id = sp.id
            WHERE sm.related_request_id = request_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search maintenance requests
CREATE OR REPLACE FUNCTION search_requests(
    search_query TEXT DEFAULT '',
    status_filter TEXT DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL,
    center_id_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    issue TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    customer_name TEXT,
    customer_phone TEXT,
    device_name TEXT,
    device_serial TEXT,
    technician_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.issue,
        mr.status,
        mr.created_at,
        c.name as customer_name,
        c.phone as customer_phone,
        d.name as device_name,
        d.serial_number as device_serial,
        u.name as technician_name
    FROM maintenance_requests mr
    LEFT JOIN customers c ON mr.customer_id = c.id
    LEFT JOIN devices d ON mr.device_id = d.id
    LEFT JOIN users u ON mr.assigned_to = u.id
    WHERE 
        (search_query = '' OR (
            mr.id::text ILIKE '%' || search_query || '%' OR
            mr.issue ILIKE '%' || search_query || '%' OR
            c.name ILIKE '%' || search_query || '%' OR
            d.name ILIKE '%' || search_query || '%' OR
            d.serial_number ILIKE '%' || search_query || '%'
        ))
        AND (status_filter IS NULL OR mr.status = status_filter)
        AND (date_from IS NULL OR mr.created_at >= date_from)
        AND (date_to IS NULL OR mr.created_at <= date_to)
        AND (center_id_filter IS NULL OR mr.center_id = center_id_filter)
    ORDER BY mr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(center_id_param INTEGER DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_requests INTEGER;
    open_requests INTEGER;
    completed_requests INTEGER;
    total_customers INTEGER;
    low_stock_parts INTEGER;
    recent_activity INTEGER;
BEGIN
    -- Get request counts
    SELECT COUNT(*) INTO total_requests
    FROM maintenance_requests 
    WHERE center_id_param IS NULL OR center_id = center_id_param;

    SELECT COUNT(*) INTO open_requests
    FROM maintenance_requests 
    WHERE status IN ('new', 'assigned', 'in_progress', 'waiting_parts')
    AND (center_id_param IS NULL OR center_id = center_id_param);

    SELECT COUNT(*) INTO completed_requests
    FROM maintenance_requests 
    WHERE status IN ('fixed', 'delivered', 'closed')
    AND (center_id_param IS NULL OR center_id = center_id_param);

    -- Get customer count
    SELECT COUNT(*) INTO total_customers
    FROM customers;

    -- Get low stock count (parts with qty_available < 10)
    SELECT COUNT(*) INTO low_stock_parts
    FROM inventory 
    WHERE qty_available < 10
    AND (center_id_param IS NULL OR center_id = center_id_param);

    -- Get recent activity count (last 24 hours)
    SELECT COUNT(*) INTO recent_activity
    FROM activity_log 
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    AND (center_id_param IS NULL OR user_id IN (
        SELECT id FROM users WHERE center_id = center_id_param
    ));

    result := json_build_object(
        'total_requests', total_requests,
        'open_requests', open_requests,
        'completed_requests', completed_requests,
        'total_customers', total_customers,
        'low_stock_parts', low_stock_parts,
        'recent_activity', recent_activity
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the activity
    INSERT INTO activity_log (user_id, action, entity, entity_id, meta)
    VALUES (
        COALESCE(NEW.created_by, auth.uid()),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
            WHEN TG_OP = 'UPDATE' THEN json_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create activity logging triggers for key tables
CREATE TRIGGER log_customers_activity
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_devices_activity
    AFTER INSERT OR UPDATE OR DELETE ON devices
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_maintenance_requests_activity
    AFTER INSERT OR UPDATE OR DELETE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_spare_parts_activity
    AFTER INSERT OR UPDATE OR DELETE ON spare_parts
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_sales_activity
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION log_activity();