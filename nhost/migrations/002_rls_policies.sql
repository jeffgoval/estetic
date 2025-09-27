-- Enable Row Level Security on all tenant-specific tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('hasura.user.x-hasura-tenant-id', true)::UUID,
    (SELECT tenant_id FROM users WHERE id = current_setting('hasura.user.x-hasura-user-id', true)::UUID LIMIT 1)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    current_setting('hasura.user.x-hasura-role', true) = 'super_admin',
    (SELECT is_super_admin FROM users WHERE id = current_setting('hasura.user.x-hasura-user-id', true)::UUID LIMIT 1),
    false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies for tenants table
CREATE POLICY tenant_isolation ON tenants
  FOR ALL
  USING (
    is_super_admin() OR 
    id = get_current_tenant_id()
  );

-- RLS Policies for users table
CREATE POLICY user_tenant_isolation ON users
  FOR ALL
  USING (
    is_super_admin() OR 
    tenant_id = get_current_tenant_id()
  );

-- RLS Policies for patients table
CREATE POLICY patient_tenant_isolation ON patients
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for professionals table
CREATE POLICY professional_tenant_isolation ON professionals
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for appointments table
CREATE POLICY appointment_tenant_isolation ON appointments
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for material_categories table
CREATE POLICY material_category_tenant_isolation ON material_categories
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for materials table
CREATE POLICY material_tenant_isolation ON materials
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for material_entries table
CREATE POLICY material_entry_tenant_isolation ON material_entries
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for waiting_list table
CREATE POLICY waiting_list_tenant_isolation ON waiting_list
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for anamnesis_templates table
CREATE POLICY anamnesis_template_tenant_isolation ON anamnesis_templates
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for anamnesis_forms table
CREATE POLICY anamnesis_form_tenant_isolation ON anamnesis_forms
  FOR ALL
  USING (tenant_id = get_current_tenant_id());

-- RLS Policies for tenant_feature_overrides table
CREATE POLICY tenant_feature_override_isolation ON tenant_feature_overrides
  FOR ALL
  USING (
    is_super_admin() OR 
    tenant_id = get_current_tenant_id()
  );

-- RLS Policies for tenant_usage table
CREATE POLICY tenant_usage_isolation ON tenant_usage
  FOR ALL
  USING (
    is_super_admin() OR 
    tenant_id = get_current_tenant_id()
  );

-- RLS Policies for billing_history table
CREATE POLICY billing_history_isolation ON billing_history
  FOR ALL
  USING (
    is_super_admin() OR 
    tenant_id = get_current_tenant_id()
  );

-- Global tables (no RLS needed, managed by super admin only)
-- subscription_plans, feature_flags, plan_features are managed globally