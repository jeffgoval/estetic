-- Function to update material stock when entries are made
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.entry_type = 'in' THEN
        -- Increase stock for incoming materials
        UPDATE materials 
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.material_id;
    ELSIF NEW.entry_type = 'out' THEN
        -- Decrease stock for outgoing materials
        UPDATE materials 
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for material entries
CREATE TRIGGER update_stock_on_material_entry
    AFTER INSERT ON material_entries
    FOR EACH ROW EXECUTE FUNCTION update_material_stock();

-- Function to check stock levels and generate alerts
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TABLE(
    material_id UUID,
    material_name TEXT,
    current_stock INTEGER,
    min_stock_level INTEGER,
    alert_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.current_stock,
        m.min_stock_level,
        CASE 
            WHEN m.current_stock <= 0 THEN 'out_of_stock'
            WHEN m.current_stock <= m.min_stock_level THEN 'low_stock'
            ELSE 'normal'
        END as alert_type
    FROM materials m
    WHERE m.is_active = true
    AND (m.current_stock <= m.min_stock_level OR m.current_stock <= 0);
END;
$$ language 'plpgsql';

-- Function to get tenant feature access
CREATE OR REPLACE FUNCTION get_tenant_features(tenant_uuid UUID)
RETURNS TABLE(
    feature_key TEXT,
    is_enabled BOOLEAN,
    limits JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH tenant_plan AS (
        SELECT plan_id FROM tenants WHERE id = tenant_uuid
    ),
    plan_features AS (
        SELECT ff.key, pf.is_enabled, pf.limits
        FROM feature_flags ff
        JOIN plan_features pf ON ff.id = pf.feature_flag_id
        JOIN tenant_plan tp ON pf.plan_id = tp.plan_id
    ),
    overrides AS (
        SELECT ff.key, tfo.is_enabled, tfo.limits
        FROM feature_flags ff
        JOIN tenant_feature_overrides tfo ON ff.id = tfo.feature_flag_id
        WHERE tfo.tenant_id = tenant_uuid
        AND (tfo.expires_at IS NULL OR tfo.expires_at > NOW())
    )
    SELECT 
        COALESCE(o.key, pf.key) as feature_key,
        COALESCE(o.is_enabled, pf.is_enabled) as is_enabled,
        COALESCE(o.limits, pf.limits) as limits
    FROM plan_features pf
    FULL OUTER JOIN overrides o ON pf.key = o.key;
END;
$$ language 'plpgsql';