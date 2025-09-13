import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API wrapper functions
export const api = {
  // Auth functions
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  // User functions
  async getCurrentUserProfile() {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) return { data: null, error: authError }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return { data, error }
  },

  async updateUserProfile(updates) {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) return { data: null, error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authData.user.id)
      .select()
      .single()

    return { data, error }
  },

  // Customer functions
  async getCustomers(params = {}) {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
    }

    if (params.type) {
      query = query.eq('type', params.type)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createCustomer(customerData) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    return { data, error }
  },

  async updateCustomer(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteCustomer(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    return { error }
  },

  // Device functions
  async getDevicesByCustomer(customerId) {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createDevice(deviceData) {
    const { data, error } = await supabase
      .from('devices')
      .insert(deviceData)
      .select()
      .single()

    return { data, error }
  },

  async updateDevice(id, updates) {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Maintenance request functions
  async getMaintenanceRequests(params = {}) {
    let query = supabase
      .from('maintenance_requests')
      .select(`
        *,
        customers(name, phone, type),
        devices(name, serial_number, warranty, warranty_expiry),
        assigned_technician:users!assigned_to(name, role)
      `)
      .order('created_at', { ascending: false })

    if (params.status) {
      query = query.eq('status', params.status)
    }

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.assigned_to) {
      query = query.eq('assigned_to', params.assigned_to)
    }

    if (params.search) {
      query = query.or(`
        id::text.ilike.%${params.search}%,
        issue.ilike.%${params.search}%,
        customers.name.ilike.%${params.search}%,
        devices.name.ilike.%${params.search}%,
        devices.serial_number.ilike.%${params.search}%
      `)
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createMaintenanceRequest(requestData) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert(requestData)
      .select(`
        *,
        customers(name, phone, type),
        devices(name, serial_number, warranty, warranty_expiry)
      `)
      .single()

    return { data, error }
  },

  async updateMaintenanceRequest(id, updates) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        customers(name, phone, type),
        devices(name, serial_number, warranty, warranty_expiry),
        assigned_technician:users!assigned_to(name, role)
      `)
      .single()

    return { data, error }
  },

  async getRequestDetails(requestId) {
    const { data, error } = await supabase.rpc('get_request_details', {
      request_id: requestId
    })

    return { data, error }
  },

  // RPC function calls
  async assignRequest(requestId, technicianId, managerId) {
    const { data, error } = await supabase.rpc('assign_request', {
      request_id: requestId,
      technician_id: technicianId,
      manager_id: managerId
    })

    return { data, error }
  },

  async closeRequest(requestId, managerId) {
    const { data, error } = await supabase.rpc('close_request', {
      request_id: requestId,
      manager_id: managerId
    })

    return { data, error }
  },

  // Followup functions
  async getFollowups(requestId) {
    const { data, error } = await supabase
      .from('followups')
      .select(`
        *,
        technician:users!technician_id(name, role)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async addFollowup(followupData) {
    const { data, error } = await supabase
      .from('followups')
      .insert(followupData)
      .select(`
        *,
        technician:users!technician_id(name, role)
      `)
      .single()

    return { data, error }
  },

  // Spare parts functions
  async getSpareParts(params = {}) {
    let query = supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false })

    if (params.search) {
      query = query.or(`code.ilike.%${params.search}%,name.ilike.%${params.search}%`)
    }

    if (params.warranty !== undefined) {
      query = query.eq('warranty', params.warranty)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createSparePart(partData) {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert(partData)
      .select()
      .single()

    return { data, error }
  },

  async updateSparePart(id, updates) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Inventory functions
  async getInventory(params = {}) {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        spare_parts(code, name, price, warranty),
        centers(name)
      `)
      .order('updated_at', { ascending: false })

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.part_id) {
      query = query.eq('part_id', params.part_id)
    }

    if (params.low_stock) {
      query = query.lt('qty_available', 10)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Stock movement functions
  async getStockMovements(params = {}) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        spare_parts(code, name, price),
        centers(name),
        created_by_user:users!created_by(name, role)
      `)
      .order('created_at', { ascending: false })

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.part_id) {
      query = query.eq('part_id', params.part_id)
    }

    if (params.type) {
      query = query.eq('type', params.type)
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  // RPC functions for stock operations
  async addStock(partId, centerId, qty, userId) {
    const { data, error } = await supabase.rpc('add_stock', {
      part_id: partId,
      center_id: centerId,
      qty: qty,
      user_id: userId
    })

    return { data, error }
  },

  async issueStock(partId, centerId, qty, userId, requestId = null) {
    const { data, error } = await supabase.rpc('issue_stock', {
      part_id: partId,
      center_id: centerId,
      qty: qty,
      user_id: userId,
      request_id: requestId
    })

    return { data, error }
  },

  async returnStock(partId, centerId, qty, userId, requestId = null) {
    const { data, error } = await supabase.rpc('return_stock', {
      part_id: partId,
      center_id: centerId,
      qty: qty,
      user_id: userId,
      request_id: requestId
    })

    return { data, error }
  },

  async markScrap(partId, centerId, qty, reason, relatedRequestId, userId) {
    const { data, error } = await supabase.rpc('mark_scrap', {
      part_id: partId,
      center_id: centerId,
      qty: qty,
      reason: reason,
      related_request_id: relatedRequestId,
      user_id: userId
    })

    return { data, error }
  },

  // Sales functions
  async getSales(params = {}) {
    let query = supabase
      .from('sales')
      .select(`
        *,
        customers(name, phone, type),
        spare_parts(code, name, price),
        created_by_user:users!created_by(name, role),
        centers(name)
      `)
      .order('created_at', { ascending: false })

    if (params.customer_id) {
      query = query.eq('customer_id', params.customer_id)
    }

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createSale(saleData) {
    const { data, error } = await supabase.rpc('create_sale', {
      customer_id: saleData.customer_id,
      part_id: saleData.part_id,
      price: saleData.price,
      discount: saleData.discount || 0,
      user_id: saleData.user_id,
      center_id: saleData.center_id
    })

    return { data, error }
  },

  // Scrap parts functions
  async getScrapParts(params = {}) {
    let query = supabase
      .from('scrap_parts')
      .select(`
        *,
        spare_parts(code, name, price),
        centers(name),
        created_by_user:users!created_by(name, role)
      `)
      .order('created_at', { ascending: false })

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.part_id) {
      query = query.eq('part_id', params.part_id)
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Device replacement functions
  async getDeviceReplacements(params = {}) {
    let query = supabase
      .from('device_replacements')
      .select(`
        *,
        customers(name, phone),
        old_device:devices!old_device_id(name, serial_number),
        new_device:devices!new_device_id(name, serial_number),
        created_by_user:users!created_by(name, role),
        centers(name)
      `)
      .order('created_at', { ascending: false })

    if (params.customer_id) {
      query = query.eq('customer_id', params.customer_id)
    }

    if (params.center_id) {
      query = query.eq('center_id', params.center_id)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createDeviceReplacement(replacementData) {
    const { data, error } = await supabase.rpc('create_device_replacement', {
      customer_id: replacementData.customer_id,
      old_device_id: replacementData.old_device_id,
      new_device_meta: replacementData.new_device_meta,
      reason: replacementData.reason,
      created_by: replacementData.created_by,
      center_id: replacementData.center_id
    })

    return { data, error }
  },

  // Service charges functions
  async getServiceCharges(params = {}) {
    let query = supabase
      .from('service_charges')
      .select(`
        *,
        maintenance_requests(id, issue, customers(name, phone)),
        created_by_user:users!created_by(name, role)
      `)
      .order('created_at', { ascending: false })

    if (params.request_id) {
      query = query.eq('request_id', params.request_id)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createServiceCharge(chargeData) {
    const { data, error } = await supabase.rpc('create_service_only_charge', {
      request_id: chargeData.request_id,
      user_id: chargeData.user_id,
      amount: chargeData.amount,
      note: chargeData.note
    })

    return { data, error }
  },

  // Activity log functions
  async getActivityLog(params = {}) {
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user:users!user_id(name, role)
      `)
      .order('created_at', { ascending: false })

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }

    if (params.entity) {
      query = query.eq('entity', params.entity)
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Dashboard functions
  async getDashboardStats(centerId = null) {
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      center_id_param: centerId
    })

    return { data, error }
  },

  // Search functions
  async searchRequests(query, filters = {}) {
    const { data, error } = await supabase.rpc('search_requests', {
      search_query: query,
      status_filter: filters.status || null,
      date_from: filters.date_from || null,
      date_to: filters.date_to || null,
      center_id_filter: filters.center_id || null
    })

    return { data, error }
  },

  async globalSearch(query) {
    const [requests, customers, spareParts] = await Promise.all([
      this.searchRequests(query),
      this.getCustomers({ search: query, limit: 10 }),
      this.getSpareParts({ search: query, limit: 10 })
    ])

    return {
      requests: requests.data || [],
      customers: customers.data || [],
      spareParts: spareParts.data || []
    }
  },

  // Bulk operations
  async bulkInsertParts(partsArray) {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert(partsArray)
      .select()

    return { data, error }
  },

  async bulkInsertCustomers(customersArray) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customersArray)
      .select()

    return { data, error }
  },

  async bulkInsertInventory(inventoryArray) {
    const { data, error } = await supabase
      .from('inventory')
      .upsert(inventoryArray, { onConflict: 'part_id,center_id' })
      .select()

    return { data, error }
  }
}

// Export default
export default supabase