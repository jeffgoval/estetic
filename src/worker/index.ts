import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { zValidator } from "@hono/zod-validator";
import {
  CreatePatientSchema,
  CreateAppointmentSchema,
  CreateWaitingListSchema,
  CreateMaterialCategorySchema,
  CreateMaterialSchema,
  CreateMaterialEntrySchema,
  CreateMaterialConsumptionSchema,
  CreateWhatsAppConfigSchema,
  CreateWhatsAppTemplateSchema,
  CreateWhatsAppContactSchema,
  CreateWhatsAppMessageSchema,
  CreateAILeadSchema,
  CreateAIConversationSchema,
  CreateAIIntentSchema,
  CreateAISalesFunnelSchema,
  CreateAILeadActivitySchema,
  CreateProcedureSchema,
  CreateProcedureMaterialSchema,
  CreateProcedureCategorySchema,
  } from "@/shared/types";
import { 
  Permission, 
  UserRole, 
  hasPermission, 
  PERMISSIONS
} from "@/shared/permissions";
import OpenAI from 'openai';


const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// OpenAI client helper
const getOpenAIClient = (env: Env) => {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
};

// Auth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not found" }, 401);
  }
  
  // Get or create user in our system - always get fresh data from DB
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ? AND is_active = 1"
  ).bind(mochaUser.id).all();

  let user = results[0];

  // If user is not active, deny access
  if (user && !user.is_active) {
    return c.json({ error: "User account is deactivated" }, 403);
  }
  
  if (!user) {
    // Create default tenant for new user
    const tenantResult = await c.env.DB.prepare(
      "INSERT INTO tenants (name, is_active) VALUES (?, ?) RETURNING id"
    ).bind(`Consultório de ${mochaUser.google_user_data?.given_name || mochaUser.email}`, 1).first();

    if (!tenantResult) {
      return c.json({ error: "Failed to create tenant" }, 500);
    }

    const tenantId = tenantResult.id;

    // Create user linked to tenant - first user becomes clinic owner
    const userResult = await c.env.DB.prepare(
      "INSERT INTO users (tenant_id, mocha_user_id, email, name, role) VALUES (?, ?, ?, ?, ?) RETURNING *"
    ).bind(
      tenantId,
      mochaUser.id,
      mochaUser.email,
      mochaUser.google_user_data?.name || mochaUser.email,
      'clinic_owner'
    ).first();

    user = userResult || {};
  }

  // Always return fresh user data with explicit role information
  return c.json({ 
    ...mochaUser, 
    appUser: {
      ...user,
      // Ensure role is properly set in response
      role: user?.role || 'dentist',
      // Add explicit permission flags for debugging
      permissions: {
        role: user?.role,
        hasValidRole: !!user?.role,
        isClinicAdmin: user?.role === 'clinic_admin',
        isDentist: user?.role === 'dentist'
      }
    }
  });
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Protected routes for app functionality
const getUserData = async (c: any) => {
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    throw new Error("User not authenticated");
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT tenant_id, role, id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  if (!results[0]) {
    throw new Error("User not found");
  }
  
  return {
    tenantId: results[0].tenant_id as number,
    role: results[0].role as UserRole,
    userId: results[0].id as number
  };
};

const getUserTenantId = async (c: any) => {
  const userData = await getUserData(c);
  return userData.tenantId;
};

// Permission checking middleware
const requirePermission = (permission: Permission) => {
  return async (c: any, next: any) => {
    try {
      const userData = await getUserData(c);
      
      if (!hasPermission(userData.role, permission)) {
        return c.json({ error: 'Insufficient permissions' }, 403);
      }
      
      // Store user data in context for use in handlers
      c.set('user', { ...c.get('user'), tenantData: userData });
      await next();
    } catch (error) {
      console.error('Permission check error:', error);
      return c.json({ error: 'Authentication failed' }, 401);
    }
  };
};

// Multiple permissions check (user needs ANY of the permissions)
const requireAnyPermission = (permissions: Permission[]) => {
  return async (c: any, next: any) => {
    try {
      const userData = await getUserData(c);
      
      const hasAnyPerm = permissions.some(permission => hasPermission(userData.role, permission));
      
      if (!hasAnyPerm) {
        return c.json({ error: 'Insufficient permissions' }, 403);
      }
      
      c.set('user', { ...c.get('user'), tenantData: userData });
      await next();
    } catch (error) {
      console.error('Permission check error:', error);
      return c.json({ error: 'Authentication failed' }, 401);
    }
  };
};

// Professional routes (aesthetics clinic)
app.get('/api/professionals', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM dentists WHERE tenant_id = ? AND is_active = 1 ORDER BY name"
  ).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/professionals', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = await c.req.json();

  const result = await c.env.DB.prepare(
    "INSERT INTO dentists (tenant_id, name, cro_number, specialty, phone, email, working_hours) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    tenantId,
    data.name,
    data.registration_number || null,
    data.specialty || null,
    data.phone || null,
    data.email || null,
    data.working_hours || null
  ).first();

  return c.json(result);
});

app.put('/api/professionals/:id', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));
  const data = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE dentists 
    SET name = ?, cro_number = ?, specialty = ?, phone = ?, email = ?, 
        working_hours = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.registration_number || null,
    data.specialty || null,
    data.phone || null,
    data.email || null,
    data.working_hours || null,
    professionalId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Profissional não encontrado" }, 404);
  }

  return c.json(result);
});

app.patch('/api/professionals/:id/deactivate', authMiddleware, requireAnyPermission([PERMISSIONS.PROFESSIONAL_DELETE, PERMISSIONS.PROFESSIONAL_UPDATE]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE dentists 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(professionalId, tenantId).first();

  if (!result) {
    return c.json({ error: "Profissional não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/professionals/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));

  // Check if professional has appointments
  const { results: appointments } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE dentist_id = ? AND tenant_id = ?"
  ).bind(professionalId, tenantId).all();

  if ((appointments[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir profissional com agendamentos. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM dentists WHERE id = ? AND tenant_id = ?
  `).bind(professionalId, tenantId).run();

  return c.json({ success: true, message: "Profissional excluído permanentemente" });
});

// Legacy dentist routes for backward compatibility
app.get('/api/dentists', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM dentists WHERE tenant_id = ? AND is_active = 1 ORDER BY name"
  ).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/dentists', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = await c.req.json();

  const result = await c.env.DB.prepare(
    "INSERT INTO dentists (tenant_id, name, cro_number, specialty, phone, email, working_hours) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    tenantId,
    data.name,
    data.cro_number || data.registration_number || null,
    data.specialty || null,
    data.phone || null,
    data.email || null,
    data.working_hours || null
  ).first();

  return c.json(result);
});

app.put('/api/dentists/:id', authMiddleware, requirePermission(PERMISSIONS.PROFESSIONAL_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));
  const data = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE dentists 
    SET name = ?, cro_number = ?, specialty = ?, phone = ?, email = ?, 
        working_hours = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.cro_number || data.registration_number || null,
    data.specialty || null,
    data.phone || null,
    data.email || null,
    data.working_hours || null,
    professionalId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Profissional não encontrado" }, 404);
  }

  return c.json(result);
});

app.patch('/api/dentists/:id/deactivate', authMiddleware, requireAnyPermission([PERMISSIONS.PROFESSIONAL_DELETE, PERMISSIONS.PROFESSIONAL_UPDATE]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE dentists 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(professionalId, tenantId).first();

  if (!result) {
    return c.json({ error: "Profissional não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/dentists/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const professionalId = parseInt(c.req.param('id'));

  // Check if professional has appointments
  const { results: appointments } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE dentist_id = ? AND tenant_id = ?"
  ).bind(professionalId, tenantId).all();

  if ((appointments[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir profissional com agendamentos. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM dentists WHERE id = ? AND tenant_id = ?
  `).bind(professionalId, tenantId).run();

  return c.json({ success: true, message: "Profissional excluído permanentemente" });
});

// Patient routes
app.get('/api/patients', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN]), async (c) => {
  const userData = (c.get('user') as any).tenantData as { tenantId: number; role: UserRole; userId: number };
  
  let query = "SELECT * FROM patients WHERE tenant_id = ? AND is_active = 1";
  let params = [userData.tenantId];
  
  // If user can only view own patients (dentist role), add filter
  if (userData && hasPermission(userData.role, PERMISSIONS.PATIENT_VIEW_OWN) && !hasPermission(userData.role, PERMISSIONS.PATIENT_VIEW_ALL)) {
    // For dentists, we would need to filter by patients they have appointments with
    // For now, we'll allow all patients but this could be refined
    query += " ORDER BY name";
  } else {
    query += " ORDER BY name";
  }
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Transform results to ensure professional_name is available
  const transformedResults = results.map((appointment: any) => ({
    ...appointment,
    professional_name: appointment.professional_name || appointment.dentist_name
  }));

  return c.json(transformedResults);
});

app.post('/api/patients', authMiddleware, requirePermission(PERMISSIONS.PATIENT_CREATE), zValidator('json', CreatePatientSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(
    "INSERT INTO patients (tenant_id, name, phone, email, cpf, birth_date, address, emergency_contact, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    tenantId,
    data.name,
    data.phone || null,
    data.email || null,
    data.cpf || null,
    data.birth_date || null,
    data.address || null,
    data.emergency_contact || null,
    data.medical_history || null
  ).first();

  return c.json(result);
});

app.put('/api/patients/:id', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), zValidator('json', CreatePatientSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE patients 
    SET name = ?, phone = ?, email = ?, cpf = ?, birth_date = ?, 
        address = ?, emergency_contact = ?, medical_history = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.phone || null,
    data.email || null,
    data.cpf || null,
    data.birth_date || null,
    data.address || null,
    data.emergency_contact || null,
    data.medical_history || null,
    patientId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Paciente não encontrado" }, 404);
  }

  return c.json(result);
});

app.patch('/api/patients/:id/deactivate', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_DELETE, PERMISSIONS.PATIENT_UPDATE]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE patients 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(patientId, tenantId).first();

  if (!result) {
    return c.json({ error: "Paciente não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/patients/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = parseInt(c.req.param('id'));

  // Check if patient has appointments
  const { results: appointments } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND tenant_id = ?"
  ).bind(patientId, tenantId).all();

  if ((appointments[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir paciente com agendamentos. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM patients WHERE id = ? AND tenant_id = ?
  `).bind(patientId, tenantId).run();

  return c.json({ success: true, message: "Paciente excluído permanentemente" });
});

// Appointment routes
app.get('/api/appointments', authMiddleware, requireAnyPermission([PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN]), async (c) => {
  const userData = (c.get('user') as any).tenantData as { tenantId: number; role: UserRole; userId: number };
  const date = c.req.query('date');
  const startDate = c.req.query('start_date');
  const endDate = c.req.query('end_date');
  const dentistId = c.req.query('dentist_id');
  
  let query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.phone as patient_phone,
      d.name as dentist_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN dentists d ON a.dentist_id = d.id
    WHERE a.tenant_id = ?
  `;
  
  const params: (string | number)[] = [userData.tenantId];
  
  // If user can only view own appointments (dentist role), filter by dentist
  if (userData && hasPermission(userData.role, PERMISSIONS.APPOINTMENT_VIEW_OWN) && !hasPermission(userData.role, PERMISSIONS.APPOINTMENT_VIEW_ALL)) {
    // Get dentist record for this user
    const { results: dentistResults } = await c.env.DB.prepare(
      "SELECT id FROM dentists WHERE tenant_id = ? AND email = (SELECT email FROM users WHERE id = ?)"
    ).bind(userData.tenantId, userData.userId).all();
    
    if (dentistResults[0]) {
      query += ` AND a.dentist_id = ?`;
      params.push(parseInt((dentistResults[0] as any).id));
    } else {
      // If no dentist record found, return empty array
      return c.json([]);
    }
  }
  
  // Handle different date filtering scenarios
  if (date) {
    // Single day filter
    query += ` AND DATE(a.start_datetime) = ?`;
    params.push(date);
  } else if (startDate && endDate) {
    // Date range filter for week/month views
    query += ` AND DATE(a.start_datetime) BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    // From start date onwards
    query += ` AND DATE(a.start_datetime) >= ?`;
    params.push(startDate);
  } else if (endDate) {
    // Up to end date
    query += ` AND DATE(a.start_datetime) <= ?`;
    params.push(endDate);
  }
  
  if (dentistId) {
    query += ` AND a.dentist_id = ?`;
    params.push(parseInt(dentistId));
  }
  
  query += ` ORDER BY a.start_datetime`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/appointments', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), zValidator('json', CreateAppointmentSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  // Get user ID for created_by
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;

  // Auto-generate title from service type or default
  const title = data.title || data.service_type || data.appointment_type || 'Consulta';

  const result = await c.env.DB.prepare(
    "INSERT INTO appointments (tenant_id, patient_id, dentist_id, title, description, start_datetime, end_datetime, appointment_type, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    tenantId,
    data.patient_id,
    data.dentist_id,
    title,
    data.description || null,
    data.start_datetime,
    data.end_datetime,
    data.appointment_type || data.service_type || null,
    data.notes || null,
    createdBy
  ).first();

  return c.json(result);
});

app.put('/api/appointments/:id', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_UPDATE), zValidator('json', CreateAppointmentSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const appointmentId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  // Auto-generate title from service type or default if not provided
  const title = data.title || data.service_type || data.appointment_type || 'Consulta';

  const result = await c.env.DB.prepare(`
    UPDATE appointments 
    SET patient_id = ?, dentist_id = ?, title = ?, description = ?, 
        start_datetime = ?, end_datetime = ?, appointment_type = ?, 
        notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.patient_id,
    data.dentist_id,
    title,
    data.description || null,
    data.start_datetime,
    data.end_datetime,
    data.appointment_type || data.service_type || null,
    data.notes || null,
    appointmentId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Agendamento não encontrado" }, 404);
  }

  return c.json(result);
});

app.patch('/api/appointments/:id/status', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const appointmentId = parseInt(c.req.param('id'));
  const { status } = await c.req.json();

  // Validate status
  const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return c.json({ error: "Status inválido" }, 400);
  }

  const result = await c.env.DB.prepare(`
    UPDATE appointments 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(status, appointmentId, tenantId).first();

  if (!result) {
    return c.json({ error: "Agendamento não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/appointments/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const appointmentId = parseInt(c.req.param('id'));

  // Check if appointment has related records
  const { results: consumption } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM material_consumption WHERE appointment_id = ? AND tenant_id = ?"
  ).bind(appointmentId, tenantId).all();

  if ((consumption[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir agendamento com consumo de materiais. Cancele em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM appointments WHERE id = ? AND tenant_id = ?
  `).bind(appointmentId, tenantId).run();

  return c.json({ success: true, message: "Agendamento excluído permanentemente" });
});

// Waiting List routes
app.get('/api/waiting-list', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      w.*,
      p.name as patient_name,
      p.phone as patient_phone,
      d.name as professional_name,
      pr.name as procedure_name
    FROM waiting_list w
    LEFT JOIN patients p ON w.patient_id = p.id
    LEFT JOIN dentists d ON w.dentist_id = d.id
    LEFT JOIN procedures pr ON w.procedure_id = pr.id
    WHERE w.tenant_id = ?
    ORDER BY w.priority DESC, w.created_at ASC
  `).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/waiting-list', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_MANAGE), zValidator('json', CreateWaitingListSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO waiting_list (
      tenant_id, patient_id, dentist_id, procedure_id, 
      preferred_date, preferred_time_start, preferred_time_end, 
      priority, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `).bind(
    tenantId,
    data.patient_id,
    data.dentist_id || null,
    data.procedure_id || null,
    data.preferred_date || null,
    data.preferred_time_start || null,
    data.preferred_time_end || null,
    data.priority,
    data.notes || null
  ).first();

  return c.json(result);
});

app.get('/api/waiting-list/available-slots', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  // Get all appointments for today and next 7 days
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  
  const { results: appointments } = await c.env.DB.prepare(`
    SELECT start_datetime, end_datetime, dentist_id
    FROM appointments 
    WHERE tenant_id = ? 
    AND DATE(start_datetime) BETWEEN DATE('now') AND DATE('now', '+7 days')
    AND status NOT IN ('cancelled')
    ORDER BY start_datetime
  `).bind(tenantId).all();

  // Get professionals working hours
  const { results: professionals } = await c.env.DB.prepare(`
    SELECT id, name, working_hours 
    FROM dentists 
    WHERE tenant_id = ? AND is_active = 1
  `).bind(tenantId).all();

  // Simple available slots logic - find 1-hour gaps
  const availableSlots = [];
  const workingHours = { start: 8, end: 18 }; // 8 AM to 6 PM
  
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    for (const professional of professionals) {
      const dayAppointments = appointments.filter((apt: any) => 
        apt.dentist_id === professional.id && 
        apt.start_datetime && typeof apt.start_datetime === 'string' && 
        apt.start_datetime.startsWith(dateStr)
      );
      
      // Check each hour for availability
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        const slotStart = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`;
        const slotEnd = `${dateStr}T${(hour + 1).toString().padStart(2, '0')}:00:00`;
        
        // Check if slot conflicts with existing appointments
        const hasConflict = dayAppointments.some((apt: any) => {
          const aptStart = new Date(apt.start_datetime as string).getTime();
          const aptEnd = new Date(apt.end_datetime as string).getTime();
          const checkStart = new Date(slotStart).getTime();
          const checkEnd = new Date(slotEnd).getTime();
          
          return (checkStart < aptEnd && checkEnd > aptStart);
        });
        
        if (!hasConflict) {
          availableSlots.push({
            date: dateStr,
            start_time: `${hour.toString().padStart(2, '0')}:00`,
            end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
            dentist_id: professional.id,
            professional_id: professional.id,
            professional_name: professional.name,
            datetime: slotStart
          });
        }
      }
    }
  }

  return c.json(availableSlots);
});

// Material Categories routes
app.get('/api/material-categories', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM material_categories WHERE tenant_id = ? AND is_active = 1 ORDER BY name"
  ).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/material-categories', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_MANAGE), zValidator('json', CreateMaterialCategorySchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(
    "INSERT INTO material_categories (tenant_id, name, description) VALUES (?, ?, ?) RETURNING *"
  ).bind(tenantId, data.name, data.description || null).first();

  return c.json(result);
});

app.put('/api/material-categories/:id', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_MANAGE), zValidator('json', CreateMaterialCategorySchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const categoryId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE material_categories 
    SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(data.name, data.description || null, categoryId, tenantId).first();

  if (!result) {
    return c.json({ error: "Categoria não encontrada" }, 404);
  }

  return c.json(result);
});

app.patch('/api/material-categories/:id/deactivate', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const categoryId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE material_categories 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(categoryId, tenantId).first();

  if (!result) {
    return c.json({ error: "Categoria não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/material-categories/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const categoryId = parseInt(c.req.param('id'));

  // Check if category has materials
  const { results: materials } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM materials WHERE category_id = ? AND tenant_id = ?"
  ).bind(categoryId, tenantId).all();

  if ((materials[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir categoria com materiais. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM material_categories WHERE id = ? AND tenant_id = ?
  `).bind(categoryId, tenantId).run();

  return c.json({ success: true, message: "Categoria excluída permanentemente" });
});

// Materials routes
app.get('/api/materials', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const categoryId = c.req.query('category_id');
  const lowStock = c.req.query('low_stock');
  
  let query = `
    SELECT 
      m.*,
      mc.name as category_name
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE m.tenant_id = ? AND m.is_active = 1
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (categoryId) {
    query += ` AND m.category_id = ?`;
    params.push(parseInt(categoryId));
  }
  
  if (lowStock === 'true') {
    query += ` AND m.current_stock <= m.min_stock_level`;
  }
  
  query += ` ORDER BY m.name`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/materials', authMiddleware, requirePermission(PERMISSIONS.MATERIAL_CREATE), zValidator('json', CreateMaterialSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(
    "INSERT INTO materials (tenant_id, category_id, name, brand, description, unit_type, min_stock_level, max_stock_level, unit_cost, supplier_name, supplier_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
  ).bind(
    tenantId,
    data.category_id || null,
    data.name,
    data.brand || null,
    data.description || null,
    data.unit_type,
    data.min_stock_level,
    data.max_stock_level,
    data.unit_cost,
    data.supplier_name || null,
    data.supplier_contact || null
  ).first();

  return c.json(result);
});

app.patch('/api/materials/:id', authMiddleware, requirePermission(PERMISSIONS.MATERIAL_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const materialId = parseInt(c.req.param('id'));
  const data = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE materials 
    SET ${Object.keys(data).map(key => `${key} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(...Object.values(data), materialId, tenantId).first();

  return c.json(result);
});

// Material Entries routes
app.get('/api/material-entries', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const materialId = c.req.query('material_id');
  
  let query = `
    SELECT 
      me.*,
      m.name as material_name,
      m.unit_type
    FROM material_entries me
    LEFT JOIN materials m ON me.material_id = m.id
    WHERE me.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (materialId) {
    query += ` AND me.material_id = ?`;
    params.push(parseInt(materialId));
  }
  
  query += ` ORDER BY me.created_at DESC`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/material-entries', authMiddleware, requirePermission(PERMISSIONS.MATERIAL_ENTRY_CREATE), zValidator('json', CreateMaterialEntrySchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  // Get user ID for created_by
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;
  
  // Calculate total cost
  const totalCost = data.quantity * data.unit_cost;

  // Create entry
  const result = await c.env.DB.prepare(`
    INSERT INTO material_entries (
      tenant_id, material_id, entry_type, quantity, unit_cost, total_cost,
      expiry_date, batch_number, supplier_name, invoice_number, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `).bind(
    tenantId,
    data.material_id,
    data.entry_type,
    data.quantity,
    data.unit_cost,
    totalCost,
    data.expiry_date || null,
    data.batch_number || null,
    data.supplier_name || null,
    data.invoice_number || null,
    data.notes || null,
    createdBy
  ).first();

  // Update material stock
  const stockChange = data.entry_type === 'in' ? data.quantity : -data.quantity;
  await c.env.DB.prepare(`
    UPDATE materials 
    SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
  `).bind(stockChange, data.material_id, tenantId).run();

  // Check for low stock alerts
  const { results: materialResults } = await c.env.DB.prepare(`
    SELECT * FROM materials WHERE id = ? AND tenant_id = ?
  `).bind(data.material_id, tenantId).all();

  if (materialResults[0] && (materialResults[0] as any).current_stock <= (materialResults[0] as any).min_stock_level) {
    await c.env.DB.prepare(`
      INSERT INTO material_alerts (tenant_id, material_id, alert_type, alert_message)
      VALUES (?, ?, ?, ?)
    `).bind(
      tenantId,
      data.material_id,
      'low_stock',
      `Estoque baixo: ${(materialResults[0] as any).name} (${(materialResults[0] as any).current_stock} ${(materialResults[0] as any).unit_type})`
    ).run();
  }

  return c.json(result);
});

// Material Consumption routes
app.get('/api/material-consumption', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const materialId = c.req.query('material_id');
  const appointmentId = c.req.query('appointment_id');
  
  let query = `
    SELECT 
      mc.*,
      m.name as material_name,
      m.unit_type,
      a.title as appointment_title,
      p.name as procedure_name
    FROM material_consumption mc
    LEFT JOIN materials m ON mc.material_id = m.id
    LEFT JOIN appointments a ON mc.appointment_id = a.id
    LEFT JOIN procedures p ON mc.procedure_id = p.id
    WHERE mc.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (materialId) {
    query += ` AND mc.material_id = ?`;
    params.push(parseInt(materialId));
  }
  
  if (appointmentId) {
    query += ` AND mc.appointment_id = ?`;
    params.push(parseInt(appointmentId));
  }
  
  query += ` ORDER BY mc.consumed_at DESC`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/material-consumption', authMiddleware, requirePermission(PERMISSIONS.MATERIAL_CONSUMPTION_CREATE), zValidator('json', CreateMaterialConsumptionSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  // Get user ID for created_by
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;

  // Check if material has enough stock
  const { results: materialResults } = await c.env.DB.prepare(`
    SELECT current_stock FROM materials WHERE id = ? AND tenant_id = ?
  `).bind(data.material_id, tenantId).all();

  if (!materialResults[0] || (materialResults[0] as any).current_stock < data.quantity_used) {
    return c.json({ error: "Estoque insuficiente" }, 400);
  }

  // Create consumption record
  const result = await c.env.DB.prepare(`
    INSERT INTO material_consumption (
      tenant_id, material_id, appointment_id, procedure_id, 
      quantity_used, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `).bind(
    tenantId,
    data.material_id,
    data.appointment_id || null,
    data.procedure_id || null,
    data.quantity_used,
    data.notes || null,
    createdBy
  ).first();

  // Update material stock
  await c.env.DB.prepare(`
    UPDATE materials 
    SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
  `).bind(data.quantity_used, data.material_id, tenantId).run();

  return c.json(result);
});

// Material Alerts routes
app.get('/api/material-alerts', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const unreadOnly = c.req.query('unread_only');
  
  let query = `
    SELECT 
      ma.*,
      m.name as material_name
    FROM material_alerts ma
    LEFT JOIN materials m ON ma.material_id = m.id
    WHERE ma.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (unreadOnly === 'true') {
    query += ` AND ma.is_read = 0`;
  }
  
  query += ` ORDER BY ma.created_at DESC`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.patch('/api/material-alerts/:id/read', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const alertId = parseInt(c.req.param('id'));
  
  const result = await c.env.DB.prepare(`
    UPDATE material_alerts 
    SET is_read = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(alertId, tenantId).first();
  
  return c.json(result);
});

app.post('/api/waiting-list/:id/auto-schedule', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_AUTO_SCHEDULE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const waitingId = parseInt(c.req.param('id'));
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  // Get waiting list entry with patient info
  const { results: waitingResults } = await c.env.DB.prepare(`
    SELECT w.*, p.name as patient_name
    FROM waiting_list w
    LEFT JOIN patients p ON w.patient_id = p.id
    WHERE w.id = ? AND w.tenant_id = ? AND w.status = 'waiting'
  `).bind(waitingId, tenantId).all();
  
  if (!waitingResults[0]) {
    return c.json({ error: "Waiting list entry not found or already scheduled" }, 404);
  }
  
  const waitingEntry = waitingResults[0];
  
  // Get available slots
  const availableSlotsResponse = await fetch(`${c.req.url.replace(c.req.path, '')}/api/waiting-list/available-slots`, {
    headers: c.req.raw.headers
  });
  const availableSlots = await availableSlotsResponse.json();
  
  // Filter slots based on preferences
  let preferredSlots = availableSlots as any[];
  
  if ((waitingEntry as any).dentist_id) {
    preferredSlots = preferredSlots.filter((slot: any) => slot.dentist_id === (waitingEntry as any).dentist_id);
  }
  
  if ((waitingEntry as any).preferred_date) {
    preferredSlots = preferredSlots.filter((slot: any) => slot.date === (waitingEntry as any).preferred_date);
  }
  
  if ((waitingEntry as any).preferred_time_start && (waitingEntry as any).preferred_time_end) {
    preferredSlots = preferredSlots.filter((slot: any) => 
      slot.start_time >= (waitingEntry as any).preferred_time_start && 
      slot.end_time <= (waitingEntry as any).preferred_time_end
    );
  }
  
  // If no preferred slots, use any available slot
  const slotsToUse = preferredSlots.length > 0 ? preferredSlots : availableSlots as any[];
  
  if (slotsToUse.length === 0) {
    return c.json({ error: "No available slots found" }, 400);
  }
  
  // Get the earliest available slot
  const selectedSlot = slotsToUse.sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];
  
  // Get user ID for created_by
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;
  
  // Create appointment
  const appointmentTitle = `Consulta - ${waitingEntry.patient_name}`;
  const startDateTime = `${selectedSlot.date}T${selectedSlot.start_time}:00`;
  const endDateTime = `${selectedSlot.date}T${selectedSlot.end_time}:00`;
  
  const appointmentResult = await c.env.DB.prepare(`
    INSERT INTO appointments (
      tenant_id, patient_id, dentist_id, title, 
      start_datetime, end_datetime, status, 
      notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `).bind(
    tenantId,
    waitingEntry.patient_id,
    selectedSlot.dentist_id || selectedSlot.professional_id,
    appointmentTitle,
    startDateTime,
    endDateTime,
    'scheduled',
    `Agendado automaticamente da lista de espera. ${waitingEntry.notes || ''}`.trim(),
    createdBy
  ).first();
  
  // Update waiting list status
  await c.env.DB.prepare(`
    UPDATE waiting_list 
    SET status = 'scheduled', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(waitingId).run();
  
  return c.json({ 
    success: true, 
    appointment: appointmentResult,
    slot: selectedSlot 
  });
});

app.patch('/api/waiting-list/:id/status', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const waitingId = parseInt(c.req.param('id'));
  const { status } = await c.req.json();
  
  const result = await c.env.DB.prepare(`
    UPDATE waiting_list 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(status, waitingId, tenantId).first();
  
  if (!result) {
    return c.json({ error: "Waiting list entry not found" }, 404);
  }
  
  return c.json(result);
});

app.put('/api/waiting-list/:id', authMiddleware, requirePermission(PERMISSIONS.WAITING_LIST_MANAGE), zValidator('json', CreateWaitingListSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const waitingId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE waiting_list 
    SET patient_id = ?, dentist_id = ?, procedure_id = ?, 
        preferred_date = ?, preferred_time_start = ?, preferred_time_end = ?, 
        priority = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.patient_id,
    data.dentist_id || null,
    data.procedure_id || null,
    data.preferred_date || null,
    data.preferred_time_start || null,
    data.preferred_time_end || null,
    data.priority,
    data.notes || null,
    waitingId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Entrada na lista de espera não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/waiting-list/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const waitingId = parseInt(c.req.param('id'));

  await c.env.DB.prepare(`
    DELETE FROM waiting_list WHERE id = ? AND tenant_id = ?
  `).bind(waitingId, tenantId).run();

  return c.json({ success: true, message: "Entrada da lista de espera excluída permanentemente" });
});

// Procedure Categories routes
app.get('/api/procedure-categories', authMiddleware, requireAnyPermission([PERMISSIONS.APPOINTMENT_CREATE, PERMISSIONS.SUPER_ADMIN_ACCESS]), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      pc.*,
      pc_parent.name as parent_name
    FROM procedure_categories pc
    LEFT JOIN procedure_categories pc_parent ON pc.parent_id = pc_parent.id
    WHERE (pc.tenant_id IS NULL OR pc.tenant_id = ?) AND pc.is_active = 1
    ORDER BY pc_parent.name ASC, pc.name ASC
  `).bind(tenantId).all();

  return c.json(results);
});



app.post('/api/procedure-categories', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), zValidator('json', CreateProcedureCategorySchema), async (c) => {
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO procedure_categories (tenant_id, name, parent_id, description)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `).bind(
    data.tenant_id || null,
    data.name,
    data.parent_id || null,
    data.description || null
  ).first();

  return c.json(result);
});

app.put('/api/procedure-categories/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), zValidator('json', CreateProcedureCategorySchema), async (c) => {
  const categoryId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE procedure_categories 
    SET name = ?, parent_id = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `).bind(
    data.name,
    data.parent_id || null,
    data.description || null,
    categoryId
  ).first();

  if (!result) {
    return c.json({ error: "Categoria não encontrada" }, 404);
  }

  return c.json(result);
});

app.patch('/api/procedure-categories/:id/deactivate', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const categoryId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE procedure_categories 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `).bind(categoryId).first();

  if (!result) {
    return c.json({ error: "Categoria não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/procedure-categories/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const categoryId = parseInt(c.req.param('id'));

  // Check if category has children
  const { results: children } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM procedure_categories WHERE parent_id = ?"
  ).bind(categoryId).all();

  if ((children[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir categoria com subcategorias. Desative em vez disso." }, 400);
  }

  // Check if category is used in procedures
  const { results: procedures } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM procedures WHERE procedure_category_id = ?"
  ).bind(categoryId).all();

  if ((procedures[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir categoria usada em procedimentos. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM procedure_categories WHERE id = ?
  `).bind(categoryId).run();

  return c.json({ success: true, message: "Categoria excluída permanentemente" });
});

// Procedures routes
app.get('/api/procedures', authMiddleware, requireAnyPermission([PERMISSIONS.WAITING_LIST_VIEW, PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const detailed = c.req.query('detailed');
  
  let query = "SELECT * FROM procedures WHERE tenant_id = ? AND is_active = 1 ORDER BY category, name";
  
  const { results } = await c.env.DB.prepare(query).bind(tenantId).all();

  if (detailed === 'true') {
    // Get materials for each procedure
    for (const procedure of results) {
      const { results: materials } = await c.env.DB.prepare(`
        SELECT 
          pm.*,
          m.name as material_name,
          m.unit_type,
          m.unit_cost,
          mc.name as category_name
        FROM procedure_materials pm
        LEFT JOIN materials m ON pm.material_id = m.id
        LEFT JOIN material_categories mc ON m.category_id = mc.id
        WHERE pm.procedure_id = ? AND pm.tenant_id = ?
        ORDER BY pm.is_mandatory DESC, m.name
      `).bind((procedure as any).id, tenantId).all();
      
      (procedure as any).materials = materials;
    }
  }

  return c.json(results);
});

app.post('/api/procedures', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), zValidator('json', CreateProcedureSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO procedures (
      tenant_id, name, description, duration_minutes, price, fixed_price,
      variable_price_notes, materials_cost, profit_margin, category, complexity_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.name,
    data.description || null,
    data.duration_minutes,
    data.price || data.fixed_price,
    data.fixed_price,
    data.variable_price_notes || null,
    data.materials_cost,
    data.profit_margin,
    data.category,
    data.complexity_level
  ).first();

  return c.json(result);
});

app.put('/api/procedures/:id', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), zValidator('json', CreateProcedureSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE procedures 
    SET name = ?, description = ?, duration_minutes = ?, price = ?, fixed_price = ?,
        variable_price_notes = ?, materials_cost = ?, profit_margin = ?, 
        category = ?, complexity_level = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.description || null,
    data.duration_minutes,
    data.price || data.fixed_price,
    data.fixed_price,
    data.variable_price_notes || null,
    data.materials_cost,
    data.profit_margin,
    data.category,
    data.complexity_level,
    procedureId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Procedimento não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/procedures/:id', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE procedures 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(procedureId, tenantId).first();

  if (!result) {
    return c.json({ error: "Procedimento não encontrado" }, 404);
  }

  return c.json(result);
});

// Procedure Materials routes
app.get('/api/procedures/:id/materials', authMiddleware, requireAnyPermission([PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('id'));
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      pm.*,
      m.name as material_name,
      m.unit_type,
      m.unit_cost,
      m.current_stock,
      mc.name as category_name
    FROM procedure_materials pm
    LEFT JOIN materials m ON pm.material_id = m.id
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE pm.procedure_id = ? AND pm.tenant_id = ?
    ORDER BY pm.is_mandatory DESC, m.name
  `).bind(procedureId, tenantId).all();

  return c.json(results);
});

app.post('/api/procedures/:id/materials', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), zValidator('json', CreateProcedureMaterialSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  // Check if material is already associated with this procedure
  const { results: existing } = await c.env.DB.prepare(
    'SELECT id FROM procedure_materials WHERE procedure_id = ? AND material_id = ? AND tenant_id = ?'
  ).bind(procedureId, data.material_id, tenantId).all();

  if (existing.length > 0) {
    return c.json({ error: "Material já está associado a este procedimento" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO procedure_materials (
      tenant_id, procedure_id, material_id, quantity_required, is_mandatory, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    procedureId,
    data.material_id,
    data.quantity_required,
    data.is_mandatory,
    data.notes || null
  ).first();

  return c.json(result);
});

app.put('/api/procedures/:procedureId/materials/:materialId', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('procedureId'));
  const materialId = parseInt(c.req.param('materialId'));
  const data = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE procedure_materials 
    SET quantity_required = ?, is_mandatory = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE procedure_id = ? AND material_id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.quantity_required,
    data.is_mandatory,
    data.notes || null,
    procedureId,
    materialId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Associação não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/procedures/:procedureId/materials/:materialId', authMiddleware, requirePermission(PERMISSIONS.APPOINTMENT_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const procedureId = parseInt(c.req.param('procedureId'));
  const materialId = parseInt(c.req.param('materialId'));

  await c.env.DB.prepare(`
    DELETE FROM procedure_materials 
    WHERE procedure_id = ? AND material_id = ? AND tenant_id = ?
  `).bind(procedureId, materialId, tenantId).run();

  return c.json({ success: true });
});

// WhatsApp Config routes
app.get('/api/whatsapp/config', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM whatsapp_config WHERE tenant_id = ?"
  ).bind(tenantId).all();

  // Return default config if none exists
  if (!results[0]) {
    return c.json({
      api_token: '',
      phone_number: '',
      webhook_url: '',
      is_connected: false,
      auto_responses_enabled: true,
      appointment_booking_enabled: true
    });
  }

  return c.json(results[0]);
});

app.post('/api/whatsapp/config', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_CONFIG), zValidator('json', CreateWhatsAppConfigSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  // Check if config exists
  const { results } = await c.env.DB.prepare(
    "SELECT id FROM whatsapp_config WHERE tenant_id = ?"
  ).bind(tenantId).all();

  let result;
  if (results[0]) {
    // Update existing config
    result = await c.env.DB.prepare(`
      UPDATE whatsapp_config 
      SET api_token = ?, phone_number = ?, webhook_url = ?, 
          auto_responses_enabled = ?, appointment_booking_enabled = ?,
          is_connected = ?, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ?
      RETURNING *
    `).bind(
      data.api_token || null,
      data.phone_number || null,
      data.webhook_url || null,
      data.auto_responses_enabled,
      data.appointment_booking_enabled,
      data.api_token ? 1 : 0, // Set connected if token provided
      tenantId
    ).first();
  } else {
    // Create new config
    result = await c.env.DB.prepare(`
      INSERT INTO whatsapp_config (
        tenant_id, api_token, phone_number, webhook_url, 
        auto_responses_enabled, appointment_booking_enabled, is_connected
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      tenantId,
      data.api_token || null,
      data.phone_number || null,
      data.webhook_url || null,
      data.auto_responses_enabled,
      data.appointment_booking_enabled,
      data.api_token ? 1 : 0
    ).first();
  }

  return c.json(result);
});

// WhatsApp Templates routes
app.get('/api/whatsapp/templates', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM whatsapp_templates WHERE tenant_id = ? ORDER BY name"
  ).bind(tenantId).all();

  // Parse variables JSON
  const templatesWithVariables = results.map((template: any) => ({
    ...template,
    variables: template.variables ? JSON.parse(template.variables) : []
  }));

  return c.json(templatesWithVariables);
});

app.post('/api/whatsapp/templates', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_TEMPLATES), zValidator('json', CreateWhatsAppTemplateSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  // Extract variables from message
  const extractVariables = (message: string): string[] => {
    const matches = message.match(/\{(\w+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const variables = extractVariables(data.message);

  const result = await c.env.DB.prepare(`
    INSERT INTO whatsapp_templates (
      tenant_id, name, message, template_type, variables
    ) VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.name,
    data.message,
    data.template_type,
    JSON.stringify(variables)
  ).first();

  return c.json({
    ...result,
    variables: variables
  });
});

app.put('/api/whatsapp/templates/:id', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_TEMPLATES), zValidator('json', CreateWhatsAppTemplateSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const templateId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  // Extract variables from message
  const extractVariables = (message: string): string[] => {
    const matches = message.match(/\{(\w+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const variables = extractVariables(data.message);

  const result = await c.env.DB.prepare(`
    UPDATE whatsapp_templates 
    SET name = ?, message = ?, template_type = ?, variables = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.message,
    data.template_type,
    JSON.stringify(variables),
    templateId,
    tenantId
  ).first();

  return c.json({
    ...result,
    variables: variables
  });
});

app.patch('/api/whatsapp/templates/:id/deactivate', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_TEMPLATES), async (c) => {
  const tenantId = await getUserTenantId(c);
  const templateId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE whatsapp_templates 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(templateId, tenantId).first();

  if (!result) {
    return c.json({ error: "Template não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/whatsapp/templates/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const templateId = parseInt(c.req.param('id'));

  // Check if template is referenced in messages
  const { results: messages } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM whatsapp_messages WHERE template_id = ? AND tenant_id = ?"
  ).bind(templateId, tenantId).all();

  if ((messages[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir template referenciado em mensagens. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM whatsapp_templates WHERE id = ? AND tenant_id = ?
  `).bind(templateId, tenantId).run();

  return c.json({ success: true, message: "Template excluído permanentemente" });
});

// WhatsApp Contacts routes
app.get('/api/whatsapp/contacts', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      wc.*,
      p.name as patient_name
    FROM whatsapp_contacts wc
    LEFT JOIN patients p ON wc.patient_id = p.id
    WHERE wc.tenant_id = ?
    ORDER BY wc.last_message_at DESC
  `).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/whatsapp/contacts', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_VIEW), zValidator('json', CreateWhatsAppContactSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO whatsapp_contacts (
      tenant_id, phone, name, is_patient, patient_id
    ) VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.phone,
    data.name || null,
    data.is_patient,
    data.patient_id || null
  ).first();

  return c.json(result);
});

// WhatsApp Messages routes
app.get('/api/whatsapp/messages', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const contactPhone = c.req.query('contact_phone');
  
  let query = `
    SELECT 
      wm.*,
      wt.name as template_name,
      a.title as appointment_title
    FROM whatsapp_messages wm
    LEFT JOIN whatsapp_templates wt ON wm.template_id = wt.id
    LEFT JOIN appointments a ON wm.appointment_id = a.id
    WHERE wm.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (contactPhone) {
    query += ` AND wm.contact_phone = ?`;
    params.push(contactPhone);
  }
  
  query += ` ORDER BY wm.sent_at DESC LIMIT 100`;
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/whatsapp/messages', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_SEND), zValidator('json', CreateWhatsAppMessageSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO whatsapp_messages (
      tenant_id, contact_phone, message, direction, message_type,
      template_id, appointment_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.contact_phone,
    data.message,
    data.direction,
    data.message_type,
    data.template_id || null,
    data.appointment_id || null
  ).first();

  // Update contact's last message time
  await c.env.DB.prepare(`
    UPDATE whatsapp_contacts 
    SET last_message_at = CURRENT_TIMESTAMP
    WHERE tenant_id = ? AND phone = ?
  `).bind(tenantId, data.contact_phone).run();

  return c.json(result);
});

// WhatsApp Webhook endpoint
app.post('/api/whatsapp/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    // Process incoming WhatsApp message
    if (body.messages && body.messages.length > 0) {
      const message = body.messages[0];
      const phone = message.from;
      const text = message.text?.body || '';
      
      // You would implement your webhook logic here
      // For now, just log the message
      console.log('Received WhatsApp message:', { phone, text });
      
      // Auto-response logic could go here
      // Check for keywords like "AGENDAR", "CONSULTA", etc.
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// WhatsApp webhook verification (required by Meta)
app.get('/api/whatsapp/webhook', async (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  
  // Verify token should match your webhook verify token
  const VERIFY_TOKEN = c.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return c.text(challenge || '');
  }
  
  return c.text('Forbidden', 403);
});

// Send WhatsApp message
app.post('/api/whatsapp/send', authMiddleware, requirePermission(PERMISSIONS.WHATSAPP_SEND), async (c) => {
  const tenantId = await getUserTenantId(c);
  const { phone, message, template_id } = await c.req.json();
  
  try {
    // Get WhatsApp config
    const { results: configResults } = await c.env.DB.prepare(
      "SELECT * FROM whatsapp_config WHERE tenant_id = ?"
    ).bind(tenantId).all();
    
    const config = configResults[0];
    if (!config || !config.is_connected || !config.api_token) {
      return c.json({ error: 'WhatsApp not configured' }, 400);
    }
    
    // Here you would make the actual API call to WhatsApp Business API
    // For demo purposes, we'll just simulate success
    
    // Save message to database
    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (
        tenant_id, contact_phone, message, direction, message_type,
        template_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tenantId,
      phone,
      message,
      'outgoing',
      template_id ? 'template' : 'text',
      template_id || null,
      'sent'
    ).run();
    
    return c.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// AI Agent routes

// AI Leads routes
app.get('/api/ai/leads', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const status = c.req.query('status');
  const source = c.req.query('source');
  
  let query = 'SELECT * FROM ai_leads WHERE tenant_id = ?';
  const params: (string | number)[] = [tenantId];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (source) {
    query += ' AND source = ?';
    params.push(source);
  }
  
  query += ' ORDER BY last_interaction_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post('/api/ai/leads', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_MANAGE), zValidator('json', CreateAILeadSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO ai_leads (
      tenant_id, name, phone, email, source, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.name || null,
    data.phone,
    data.email || null,
    data.source,
    data.notes || null
  ).first();

  return c.json(result);
});

app.patch('/api/ai/leads/:id', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const leadId = parseInt(c.req.param('id'));
  const data = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE ai_leads 
    SET ${Object.keys(data).map(key => `${key} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(...Object.values(data), leadId, tenantId).first();

  return c.json(result);
});

// AI Conversations routes
app.get('/api/ai/conversations', authMiddleware, requirePermission(PERMISSIONS.AI_AGENT_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const leadId = c.req.query('lead_id');
  
  let query = `
    SELECT 
      ac.*,
      al.name as lead_name,
      al.phone as lead_phone
    FROM ai_conversations ac
    LEFT JOIN ai_leads al ON ac.lead_id = al.id
    WHERE ac.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (leadId) {
    query += ' AND ac.lead_id = ?';
    params.push(parseInt(leadId));
  }
  
  query += ' ORDER BY ac.created_at DESC LIMIT 1000';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post('/api/ai/conversations', authMiddleware, requirePermission(PERMISSIONS.AI_AGENT_VIEW), zValidator('json', CreateAIConversationSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  // If this is a lead message, process it with AI
  let aiResponse = null;
  let intentDetected = null;
  let confidenceScore = null;

  if (data.sender === 'lead' && c.env.OPENAI_API_KEY) {
    try {
      const aiResult = await processMessageWithAI(c.env, tenantId, data.message, data.lead_id);
      aiResponse = aiResult.response;
      intentDetected = aiResult.intent;
      confidenceScore = aiResult.confidence;
    } catch (error) {
      console.error('Error processing message with AI:', error);
    }
  }

  // Save the lead's message
  const result = await c.env.DB.prepare(`
    INSERT INTO ai_conversations (
      tenant_id, lead_id, conversation_id, message, sender, 
      message_type, ai_response, intent_detected, confidence_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.lead_id,
    data.conversation_id,
    data.message,
    data.sender,
    data.message_type,
    data.ai_response,
    intentDetected,
    confidenceScore
  ).first();

  // If AI generated a response, save it as a separate message
  if (aiResponse) {
    await c.env.DB.prepare(`
      INSERT INTO ai_conversations (
        tenant_id, lead_id, conversation_id, message, sender, 
        message_type, ai_response, intent_detected, confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tenantId,
      data.lead_id,
      data.conversation_id,
      aiResponse,
      'ai',
      'text',
      true,
      intentDetected,
      confidenceScore
    ).run();

    // Update lead interaction time and conversation stage
    await c.env.DB.prepare(`
      UPDATE ai_leads 
      SET last_interaction_at = CURRENT_TIMESTAMP,
          conversation_stage = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND tenant_id = ?
    `).bind(
      intentDetected || 'conversation',
      data.lead_id,
      tenantId
    ).run();
  }

  return c.json({ ...result, ai_response: aiResponse });
});

// AI Intents routes
app.get('/api/ai/intents', authMiddleware, requirePermission(PERMISSIONS.AI_INTENTS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ai_intents WHERE tenant_id = ? ORDER BY name'
  ).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/ai/intents', authMiddleware, requirePermission(PERMISSIONS.AI_INTENTS_MANAGE), zValidator('json', CreateAIIntentSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO ai_intents (
      tenant_id, name, description, keywords, 
      response_template, follow_up_action
    ) VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.name,
    data.description || null,
    data.keywords || null,
    data.response_template || null,
    data.follow_up_action || null
  ).first();

  return c.json(result);
});

app.put('/api/ai/intents/:id', authMiddleware, requirePermission(PERMISSIONS.AI_INTENTS_MANAGE), zValidator('json', CreateAIIntentSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const intentId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE ai_intents 
    SET name = ?, description = ?, keywords = ?, 
        response_template = ?, follow_up_action = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.description || null,
    data.keywords || null,
    data.response_template || null,
    data.follow_up_action || null,
    intentId,
    tenantId
  ).first();

  return c.json(result);
});

app.patch('/api/ai/intents/:id/deactivate', authMiddleware, requirePermission(PERMISSIONS.AI_INTENTS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const intentId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE ai_intents 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(intentId, tenantId).first();

  if (!result) {
    return c.json({ error: "Intenção não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/ai/intents/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const intentId = parseInt(c.req.param('id'));

  // Check if intent is referenced in conversations
  const { results: conversations } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_conversations WHERE intent_detected = (SELECT name FROM ai_intents WHERE id = ? AND tenant_id = ?)"
  ).bind(intentId, tenantId).all();

  if ((conversations[0] as any)?.count > 0) {
    return c.json({ error: "Não é possível excluir intenção referenciada em conversas. Desative em vez disso." }, 400);
  }

  await c.env.DB.prepare(`
    DELETE FROM ai_intents WHERE id = ? AND tenant_id = ?
  `).bind(intentId, tenantId).run();

  return c.json({ success: true, message: "Intenção excluída permanentemente" });
});

// AI Sales Funnels routes
app.get('/api/ai/funnels', authMiddleware, requirePermission(PERMISSIONS.AI_FUNNELS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM ai_sales_funnels WHERE tenant_id = ? ORDER BY name'
  ).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/ai/funnels', authMiddleware, requirePermission(PERMISSIONS.AI_FUNNELS_MANAGE), zValidator('json', CreateAISalesFunnelSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO ai_sales_funnels (
      tenant_id, name, description, stages, automation_rules
    ) VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.name,
    data.description || null,
    data.stages,
    data.automation_rules || null
  ).first();

  return c.json(result);
});

app.put('/api/ai/funnels/:id', authMiddleware, requirePermission(PERMISSIONS.AI_FUNNELS_MANAGE), zValidator('json', CreateAISalesFunnelSchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const funnelId = parseInt(c.req.param('id'));
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    UPDATE ai_sales_funnels 
    SET name = ?, description = ?, stages = ?, 
        automation_rules = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    data.name,
    data.description || null,
    data.stages,
    data.automation_rules || null,
    funnelId,
    tenantId
  ).first();

  return c.json(result);
});

app.patch('/api/ai/funnels/:id/deactivate', authMiddleware, requirePermission(PERMISSIONS.AI_FUNNELS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const funnelId = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(`
    UPDATE ai_sales_funnels 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(funnelId, tenantId).first();

  if (!result) {
    return c.json({ error: "Funil de vendas não encontrado" }, 404);
  }

  return c.json(result);
});

app.delete('/api/ai/funnels/:id', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = await getUserTenantId(c);
  const funnelId = parseInt(c.req.param('id'));

  await c.env.DB.prepare(`
    DELETE FROM ai_sales_funnels WHERE id = ? AND tenant_id = ?
  `).bind(funnelId, tenantId).run();

  return c.json({ success: true, message: "Funil de vendas excluído permanentemente" });
});

// AI Analytics routes
app.get('/api/ai/analytics', authMiddleware, requirePermission(PERMISSIONS.AI_AGENT_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  // Get leads today
  const { results: leadsToday } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ? AND DATE(created_at) = DATE('now')"
  ).bind(tenantId).all();

  // Get leads this week
  const { results: leadsThisWeek } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ? AND DATE(created_at) >= DATE('now', '-7 days')"
  ).bind(tenantId).all();

  // Get total conversations
  const { results: totalConversations } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_conversations WHERE tenant_id = ?"
  ).bind(tenantId).all();

  // Get active conversations (leads with status not 'converted' or 'lost')
  const { results: activeConversations } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ? AND status NOT IN ('converted', 'lost')"
  ).bind(tenantId).all();

  // Calculate conversion rate (converted / total leads)
  const { results: convertedLeads } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ? AND status = 'converted'"
  ).bind(tenantId).all();

  const { results: totalLeads } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ?"
  ).bind(tenantId).all();

  const conversionRate = (totalLeads as any)[0]?.count > 0 
    ? Math.round(((convertedLeads as any)[0]?.count / (totalLeads as any)[0]?.count) * 100) 
    : 0;

  const analytics = {
    leads_today: (leadsToday as any)[0]?.count || 0,
    leads_this_week: (leadsThisWeek as any)[0]?.count || 0,
    conversion_rate: conversionRate,
    avg_response_time: 5, // Mock data - would calculate from actual response times
    total_conversations: (totalConversations as any)[0]?.count || 0,
    active_conversations: (activeConversations as any)[0]?.count || 0
  };

  return c.json(analytics);
});

// AI Lead Activities routes
app.get('/api/ai/activities', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  const leadId = c.req.query('lead_id');
  
  let query = `
    SELECT 
      ala.*,
      al.name as lead_name,
      al.phone as lead_phone
    FROM ai_lead_activities ala
    LEFT JOIN ai_leads al ON ala.lead_id = al.id
    WHERE ala.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (leadId) {
    query += ' AND ala.lead_id = ?';
    params.push(parseInt(leadId));
  }
  
  query += ' ORDER BY ala.created_at DESC LIMIT 100';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post('/api/ai/activities', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_MANAGE), zValidator('json', CreateAILeadActivitySchema), async (c) => {
  const tenantId = await getUserTenantId(c);
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO ai_lead_activities (
      tenant_id, lead_id, activity_type, activity_data, performed_by
    ) VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    data.lead_id,
    data.activity_type,
    data.activity_data || null,
    data.performed_by
  ).first();

  return c.json(result);
});

// Get all tenants (for super admin only)
app.get('/api/tenants/list', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT id, name, is_active, created_at
    FROM tenants 
    WHERE is_active = 1
    ORDER BY name ASC
  `).all();

  return c.json(results);
});

// Super Admin Routes
app.get('/api/super-admin/tenants', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      t.*,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT a.id) as appointment_count,
      MAX(a.created_at) as last_activity
    FROM tenants t
    LEFT JOIN users u ON t.id = u.tenant_id AND u.is_active = 1
    LEFT JOIN appointments a ON t.id = a.tenant_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all();

  return c.json(results);
});

app.get('/api/super-admin/stats', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  // Total tenants
  const { results: totalTenants } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM tenants"
  ).all();

  // Active tenants
  const { results: activeTenants } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM tenants WHERE is_active = 1"
  ).all();

  // Total users
  const { results: totalUsers } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM users WHERE is_active = 1"
  ).all();

  // Total appointments
  const { results: totalAppointments } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM appointments"
  ).all();

  // Monthly growth (new tenants this month vs last month)
  const { results: thisMonth } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM tenants WHERE DATE(created_at) >= DATE('now', 'start of month')"
  ).all();

  const { results: lastMonth } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM tenants WHERE DATE(created_at) >= DATE('now', 'start of month', '-1 month') AND DATE(created_at) < DATE('now', 'start of month')"
  ).all();

  const thisMonthCount = (thisMonth as any)[0]?.count || 0;
  const lastMonthCount = (lastMonth as any)[0]?.count || 1; // Avoid division by zero
  const monthlyGrowth = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);

  const stats = {
    total_tenants: (totalTenants as any)[0]?.count || 0,
    active_tenants: (activeTenants as any)[0]?.count || 0,
    total_users: (totalUsers as any)[0]?.count || 0,
    total_appointments: (totalAppointments as any)[0]?.count || 0,
    monthly_growth: Math.max(0, monthlyGrowth)
  };

  return c.json(stats);
});

app.patch('/api/super-admin/tenants/:id/status', authMiddleware, requirePermission(PERMISSIONS.SUPER_ADMIN_ACCESS), async (c) => {
  const tenantId = parseInt(c.req.param('id'));
  const { is_active } = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE tenants 
    SET is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `).bind(is_active, tenantId).first();

  if (!result) {
    return c.json({ error: 'Clínica não encontrada' }, 404);
  }

  return c.json(result);
});

// AI Message Processing with OpenAI
async function processMessageWithAI(env: Env, tenantId: number, message: string, leadId: number) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const client = getOpenAIClient(env);
  
  // Get lead context
  const { results: leadResults } = await env.DB.prepare(
    'SELECT * FROM ai_leads WHERE id = ? AND tenant_id = ?'
  ).bind(leadId, tenantId).all();
  
  const lead = leadResults[0] as any;
  
  // Get conversation history
  const { results: conversationResults } = await env.DB.prepare(`
    SELECT message, sender, created_at 
    FROM ai_conversations 
    WHERE lead_id = ? AND tenant_id = ? 
    ORDER BY created_at DESC 
    LIMIT 10
  `).bind(leadId, tenantId).all();
  
  // Get intents for the tenant
  const { results: intentResults } = await env.DB.prepare(
    'SELECT * FROM ai_intents WHERE tenant_id = ? AND is_active = 1'
  ).bind(tenantId).all();
  
  // Build context for AI
  const conversationHistory = (conversationResults as any[]).reverse().map(conv => 
    `${conv.sender}: ${conv.message}`
  ).join('\n');
  
  const intentsContext = (intentResults as any[]).map(intent => 
    `Intent: ${intent.name}\nKeywords: ${intent.keywords}\nResponse: ${intent.response_template}`
  ).join('\n\n');
  
  const systemPrompt = `Você é um assistente de IA para um consultório odontológico. Seu objetivo é:

1. Identificar a intenção do cliente baseada nas seguintes intenções configuradas:
${intentsContext}

2. Responder de forma profissional e acolhedora
3. Tentar agendar consultas quando apropriado
4. Qualificar leads para o funil de vendas

Informações do lead:
- Nome: ${lead?.name || 'Não informado'}
- Telefone: ${lead?.phone || 'Não informado'}
- Status atual: ${lead?.status || 'new'}
- Estágio da conversa: ${lead?.conversation_stage || 'initial_contact'}

Histórico da conversa:
${conversationHistory}

Responda de forma natural e útil. Se identificar uma intenção específica, use o template de resposta correspondente como base.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
      tools: [
        {
          type: 'function',
          function: {
            name: 'analyze_intent',
            description: 'Analyze the user message and detect intent',
            parameters: {
              type: 'object',
              properties: {
                intent: {
                  type: 'string',
                  description: 'Detected intent name'
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score from 0 to 1'
                },
                response: {
                  type: 'string',
                  description: 'Generated response to the user'
                }
              },
              required: ['intent', 'confidence', 'response'],
              additionalProperties: false
            },
            strict: true
          }
        }
      ]
    });

    const message_result = completion.choices[0].message;
    let intent = null;
    let confidence = 0.5;
    let response = message_result.content || '';

    // Check if AI used the function to analyze intent
    if (message_result.tool_calls && message_result.tool_calls.length > 0) {
      try {
        const toolCall = message_result.tool_calls[0];
        if (toolCall.type === 'function') {
          const analysisResult = JSON.parse(toolCall.function.arguments);
          intent = analysisResult.intent;
          confidence = analysisResult.confidence;
          response = analysisResult.response;
        }
      } catch (parseError) {
        console.error('Error parsing AI function call:', parseError);
      }
    }

    // Update lead status if appropriate
    if (intent && confidence > 0.7) {
      let newStatus = lead?.status;
      let newStage = intent;
      
      // Update status based on intent
      if (intent.includes('agend') || intent.includes('consulta')) {
        newStatus = 'qualified';
        newStage = 'scheduling';
      } else if (intent.includes('info') || intent.includes('preco')) {
        newStatus = 'contacted';
        newStage = 'information_request';
      }
      
      if (newStatus !== lead?.status || newStage !== lead?.conversation_stage) {
        await env.DB.prepare(`
          UPDATE ai_leads 
          SET status = ?, conversation_stage = ?, interest_level = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND tenant_id = ?
        `).bind(newStatus, newStage, Math.min(5, Math.max(1, Math.round(confidence * 5))), leadId, tenantId).run();
      }
    }

    return {
      response,
      intent,
      confidence
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    const fallbackResponses = [
      'Olá! Obrigado por entrar em contato. Como posso ajudá-lo hoje?',
      'Oi! Estou aqui para ajudar com informações sobre nosso consultório. O que você gostaria de saber?',
      'Olá! Ficamos felizes com seu interesse. Em que posso ajudá-lo?'
    ];
    
    return {
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      intent: 'general_inquiry',
      confidence: 0.5
    };
  }
}

// Tenant Theme routes
app.get('/api/tenant/theme', authMiddleware, async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(
    "SELECT name, logo_url, primary_color, secondary_color, success_color, error_color, warning_color, info_color, background_color, card_background, text_primary, text_secondary, border_color FROM tenants WHERE id = ?"
  ).bind(tenantId).all();

  if (!results[0]) {
    return c.json({ error: "Tenant not found" }, 404);
  }

  const tenant = results[0] as any;
  
  return c.json({
    clinic_name: tenant.name || 'Suavizar',
    logo_url: tenant.logo_url || '',
    primary_color: tenant.primary_color || '#3B82F6',
    secondary_color: tenant.secondary_color || '#10B981',
    success_color: tenant.success_color || '#059669',
    error_color: tenant.error_color || '#DC2626',
    warning_color: tenant.warning_color || '#D97706',
    info_color: tenant.info_color || '#0891B2',
    background_color: tenant.background_color || '#F9FAFB',
    card_background: tenant.card_background || '#FFFFFF',
    text_primary: tenant.text_primary || '#111827',
    text_secondary: tenant.text_secondary || '#6B7280',
    border_color: tenant.border_color || '#E5E7EB'
  });
});

app.put('/api/tenant/theme', authMiddleware, requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const themeData = await c.req.json();

  try {
    // Build dynamic query for only provided fields
    const fields = [];
    const values = [];
    
    if (themeData.clinic_name !== undefined) {
      fields.push('name = ?');
      values.push(themeData.clinic_name);
    }
    if (themeData.logo_url !== undefined) {
      fields.push('logo_url = ?');
      values.push(themeData.logo_url);
    }
    if (themeData.primary_color !== undefined) {
      fields.push('primary_color = ?');
      values.push(themeData.primary_color);
    }
    if (themeData.secondary_color !== undefined) {
      fields.push('secondary_color = ?');
      values.push(themeData.secondary_color);
    }
    if (themeData.success_color !== undefined) {
      fields.push('success_color = ?');
      values.push(themeData.success_color);
    }
    if (themeData.error_color !== undefined) {
      fields.push('error_color = ?');
      values.push(themeData.error_color);
    }
    if (themeData.warning_color !== undefined) {
      fields.push('warning_color = ?');
      values.push(themeData.warning_color);
    }
    if (themeData.info_color !== undefined) {
      fields.push('info_color = ?');
      values.push(themeData.info_color);
    }
    if (themeData.background_color !== undefined) {
      fields.push('background_color = ?');
      values.push(themeData.background_color);
    }
    if (themeData.card_background !== undefined) {
      fields.push('card_background = ?');
      values.push(themeData.card_background);
    }
    if (themeData.text_primary !== undefined) {
      fields.push('text_primary = ?');
      values.push(themeData.text_primary);
    }
    if (themeData.text_secondary !== undefined) {
      fields.push('text_secondary = ?');
      values.push(themeData.text_secondary);
    }
    if (themeData.border_color !== undefined) {
      fields.push('border_color = ?');
      values.push(themeData.border_color);
    }

    if (fields.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(tenantId);

    await c.env.DB.prepare(`
      UPDATE tenants 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).bind(...values).run();

    return c.json({ success: true, message: "Tema atualizado com sucesso!" });
  } catch (error) {
    console.error('Error saving tenant theme:', error);
    return c.json({ error: "Erro ao salvar tema" }, 500);
  }
});

// File upload route for logo
app.post('/api/tenant/upload-logo', authMiddleware, requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE), async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return c.json({ error: 'Nenhum arquivo foi enviado' }, 400);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'O arquivo deve ser uma imagem (PNG, JPG, etc.)' }, 400);
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'O arquivo deve ter menos de 5MB' }, 400);
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueId = crypto.randomUUID();
    const fileName = `logo_${uniqueId}.${fileExtension}`;
    
    // For now, we'll use the Mocha CDN with a unique identifier
    // This simulates uploading to a real CDN
    const logoUrl = `https://mocha-cdn.com/${uniqueId}/${fileName}`;

    // Update tenant logo_url in database
    const tenantId = await getUserTenantId(c);
    const result = await c.env.DB.prepare(`
      UPDATE tenants 
      SET logo_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(logoUrl, tenantId).run();

    if (!result.success) {
      return c.json({ error: 'Erro ao salvar no banco de dados' }, 500);
    }

    return c.json({ 
      success: true, 
      logo_url: logoUrl,
      message: 'Logo enviado com sucesso!' 
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return c.json({ error: 'Falha no upload do logo. Tente novamente.' }, 500);
  }
});

// Reports API Routes
app.get('/api/reports/overview-stats', authMiddleware, requirePermission(PERMISSIONS.REPORTS_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    // Calculate date ranges based on query param
    const dateRange = c.req.query('dateRange') || '30d';
    let startDate = '';
    let prevStartDate = '';
    
    switch (dateRange) {
      case '7d':
        startDate = 'DATE("now", "-7 days")';
        prevStartDate = 'DATE("now", "-14 days")';
        break;
      case '90d':
        startDate = 'DATE("now", "-90 days")';
        prevStartDate = 'DATE("now", "-180 days")';
        break;
      case '12m':
        startDate = 'DATE("now", "-365 days")';
        prevStartDate = 'DATE("now", "-730 days")';
        break;
      default: // 30d
        startDate = 'DATE("now", "-30 days")';
        prevStartDate = 'DATE("now", "-60 days")';
    }

    // Total revenue current period
    const { results: currentRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(CAST(p.fixed_price AS REAL)), 0) as total_revenue,
             COUNT(a.id) as total_appointments,
             COUNT(DISTINCT a.patient_id) as total_patients
      FROM appointments a
      LEFT JOIN procedures p ON a.appointment_type = p.name
      WHERE a.tenant_id = ? AND DATE(a.start_datetime) >= ${startDate}
      AND a.status != 'cancelled'
    `).bind(tenantId).all();

    // Previous period for comparison
    const { results: prevRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(CAST(p.fixed_price AS REAL)), 0) as total_revenue,
             COUNT(a.id) as total_appointments,
             COUNT(DISTINCT a.patient_id) as total_patients
      FROM appointments a
      LEFT JOIN procedures p ON a.appointment_type = p.name
      WHERE a.tenant_id = ? AND DATE(a.start_datetime) >= ${prevStartDate} AND DATE(a.start_datetime) < ${startDate}
      AND a.status != 'cancelled'
    `).bind(tenantId).all();

    const current = currentRevenue[0] as any;
    const previous = prevRevenue[0] as any;

    // Calculate growth percentages
    const revenueGrowth = previous.total_revenue > 0 
      ? ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100 
      : 0;
    
    const appointmentGrowth = previous.total_appointments > 0 
      ? ((current.total_appointments - previous.total_appointments) / previous.total_appointments) * 100 
      : 0;
    
    const patientGrowth = previous.total_patients > 0 
      ? ((current.total_patients - previous.total_patients) / previous.total_patients) * 100 
      : 0;

    // Calculate average ticket
    const avgTicket = current.total_appointments > 0 ? current.total_revenue / current.total_appointments : 0;
    const prevAvgTicket = previous.total_appointments > 0 ? previous.total_revenue / previous.total_appointments : 0;
    const ticketGrowth = prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0;

    // AI/WhatsApp stats
    const { results: whatsappStats } = await c.env.DB.prepare(`
      SELECT COUNT(*) as whatsapp_messages
      FROM whatsapp_messages 
      WHERE tenant_id = ? AND DATE(sent_at) >= ${startDate}
    `).bind(tenantId).all();

    const { results: aiStats } = await c.env.DB.prepare(`
      SELECT COUNT(*) as ai_responses
      FROM ai_conversations 
      WHERE tenant_id = ? AND ai_response = 1 AND DATE(created_at) >= ${startDate}
    `).bind(tenantId).all();

    const { results: leadStats } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads
      FROM ai_leads 
      WHERE tenant_id = ? AND DATE(created_at) >= ${startDate}
    `).bind(tenantId).all();

    const leadConversion = (leadStats[0] as any).total_leads > 0 
      ? ((leadStats[0] as any).converted_leads / (leadStats[0] as any).total_leads) * 100 
      : 0;

    // Inventory stats
    const { results: inventoryStats } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as inventory_items,
        COUNT(CASE WHEN current_stock <= min_stock_level THEN 1 END) as low_stock_items
      FROM materials 
      WHERE tenant_id = ? AND is_active = 1
    `).bind(tenantId).all();

    return c.json({
      totalRevenue: current.total_revenue,
      monthlyGrowth: revenueGrowth,
      totalAppointments: current.total_appointments,
      appointmentGrowth: appointmentGrowth,
      totalPatients: current.total_patients,
      patientGrowth: patientGrowth,
      avgTicket: avgTicket,
      ticketGrowth: ticketGrowth,
      leadConversion: leadConversion,
      conversionGrowth: 0, // Would need historical data to calculate
      whatsappMessages: (whatsappStats[0] as any).whatsapp_messages,
      aiResponses: (aiStats[0] as any).ai_responses,
      inventoryItems: (inventoryStats[0] as any).inventory_items,
      lowStockItems: (inventoryStats[0] as any).low_stock_items
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return c.json({ error: 'Failed to fetch overview stats' }, 500);
  }
});

app.get('/api/reports/revenue-trend', authMiddleware, requirePermission(PERMISSIONS.REPORTS_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  const dateRange = c.req.query('dateRange') || '30d';
  
  try {
    let groupBy = '';
    let dateFormat = '';
    let limitDays = 30;

    switch (dateRange) {
      case '7d':
        groupBy = 'DATE(a.start_datetime)';
        dateFormat = "strftime('%d/%m', a.start_datetime)";
        limitDays = 7;
        break;
      case '90d':
        groupBy = 'strftime("%Y-%W", a.start_datetime)';
        dateFormat = "strftime('Sem %W', a.start_datetime)";
        limitDays = 13; // ~13 weeks
        break;
      case '12m':
        groupBy = 'strftime("%Y-%m", a.start_datetime)';
        dateFormat = "strftime('%m/%Y', a.start_datetime)";
        limitDays = 12; // 12 months
        break;
      default: // 30d
        groupBy = 'DATE(a.start_datetime)';
        dateFormat = "strftime('%d/%m', a.start_datetime)";
        limitDays = 30;
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        ${dateFormat} as period,
        COALESCE(SUM(CAST(p.fixed_price AS REAL)), 0) as revenue,
        COUNT(a.id) as appointments,
        COUNT(DISTINCT a.patient_id) as patients
      FROM appointments a
      LEFT JOIN procedures p ON a.appointment_type = p.name
      WHERE a.tenant_id = ? 
      AND DATE(a.start_datetime) >= DATE('now', '-${limitDays} days')
      AND a.status != 'cancelled'
      GROUP BY ${groupBy}
      ORDER BY a.start_datetime
    `).bind(tenantId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    return c.json([]);
  }
});

app.get('/api/reports/professional-performance', authMiddleware, requirePermission(PERMISSIONS.REPORTS_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  const dateRange = c.req.query('dateRange') || '30d';
  
  try {
    let limitDays = 30;
    switch (dateRange) {
      case '7d': limitDays = 7; break;
      case '90d': limitDays = 90; break;
      case '12m': limitDays = 365; break;
      default: limitDays = 30;
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        d.id,
        d.name,
        COUNT(a.id) as appointments,
        COALESCE(SUM(CAST(p.fixed_price AS REAL)), 0) as revenue
      FROM dentists d
      LEFT JOIN appointments a ON d.id = a.dentist_id 
        AND a.tenant_id = ? 
        AND DATE(a.start_datetime) >= DATE('now', '-${limitDays} days')
        AND a.status != 'cancelled'
      LEFT JOIN procedures p ON a.appointment_type = p.name
      WHERE d.tenant_id = ? AND d.is_active = 1
      GROUP BY d.id, d.name
      HAVING COUNT(a.id) > 0
      ORDER BY revenue DESC
    `).bind(tenantId, tenantId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching professional performance:', error);
    return c.json([]);
  }
});

app.get('/api/reports/procedure-stats', authMiddleware, requirePermission(PERMISSIONS.REPORTS_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  const dateRange = c.req.query('dateRange') || '30d';
  
  try {
    let limitDays = 30;
    switch (dateRange) {
      case '7d': limitDays = 7; break;
      case '90d': limitDays = 90; break;
      case '12m': limitDays = 365; break;
      default: limitDays = 30;
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        COALESCE(p.name, a.appointment_type, 'Procedimento Não Especificado') as name,
        COUNT(a.id) as count,
        COALESCE(SUM(CAST(p.fixed_price AS REAL)), 0) as revenue
      FROM appointments a
      LEFT JOIN procedures p ON a.appointment_type = p.name AND p.tenant_id = a.tenant_id
      WHERE a.tenant_id = ? 
      AND DATE(a.start_datetime) >= DATE('now', '-${limitDays} days')
      AND a.status != 'cancelled'
      GROUP BY COALESCE(p.name, a.appointment_type)
      ORDER BY count DESC
    `).bind(tenantId).all();

    // Calculate percentages
    const totalCount = results.reduce((sum: number, item: any) => sum + item.count, 0);
    const resultsWithPercentage = results.map((item: any) => ({
      ...item,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }));

    return c.json(resultsWithPercentage);
  } catch (error) {
    console.error('Error fetching procedure stats:', error);
    return c.json([]);
  }
});

app.get('/api/reports/sales-funnel', authMiddleware, requirePermission(PERMISSIONS.AI_LEADS_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        conversation_stage as stage,
        COUNT(*) as count
      FROM ai_leads 
      WHERE tenant_id = ?
      GROUP BY conversation_stage
      ORDER BY 
        CASE conversation_stage
          WHEN 'initial_contact' THEN 1
          WHEN 'information_request' THEN 2
          WHEN 'scheduling' THEN 3
          WHEN 'qualified' THEN 4
          WHEN 'converted' THEN 5
          ELSE 6
        END
    `).bind(tenantId).all();

    // Calculate conversion rates
    const totalLeads = results.reduce((sum: number, item: any) => sum + item.count, 0);
    const resultsWithConversion = results.map((item: any) => ({
      ...item,
      stage: item.stage === 'initial_contact' ? 'Contato Inicial' :
             item.stage === 'information_request' ? 'Solicitou Informações' :
             item.stage === 'scheduling' ? 'Agendamento' :
             item.stage === 'qualified' ? 'Qualificado' :
             item.stage === 'converted' ? 'Convertido' : item.stage,
      conversionRate: totalLeads > 0 ? (item.count / totalLeads) * 100 : 0
    }));

    return c.json(resultsWithConversion);
  } catch (error) {
    console.error('Error fetching sales funnel:', error);
    return c.json([]);
  }
});

app.get('/api/reports/inventory-alerts', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        m.id,
        m.name as material_name,
        m.current_stock,
        m.min_stock_level,
        CASE 
          WHEN m.current_stock <= (m.min_stock_level * 0.5) THEN 'critical'
          ELSE 'warning'
        END as alert_type
      FROM materials m
      WHERE m.tenant_id = ? 
      AND m.is_active = 1 
      AND m.current_stock <= m.min_stock_level
      ORDER BY m.current_stock ASC
      LIMIT 10
    `).bind(tenantId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return c.json([]);
  }
});

app.get('/api/reports/ai-performance', authMiddleware, requirePermission(PERMISSIONS.AI_AGENT_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results: intentsDetected } = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT intent_detected) as count
      FROM ai_conversations 
      WHERE tenant_id = ? AND intent_detected IS NOT NULL
    `).bind(tenantId).all();

    const { results: autoSchedules } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM ai_lead_activities 
      WHERE tenant_id = ? AND activity_type LIKE '%schedule%'
    `).bind(tenantId).all();

    const { results: totalConversations } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM ai_conversations 
      WHERE tenant_id = ?
    `).bind(tenantId).all();

    return c.json({
      intentsDetected: (intentsDetected[0] as any).count || 0,
      autoSchedules: (autoSchedules[0] as any).count || 0,
      totalConversations: (totalConversations[0] as any).count || 0,
      avgResponseTime: 'N/A'
    });
  } catch (error) {
    console.error('Error fetching AI performance:', error);
    return c.json({
      intentsDetected: 0,
      autoSchedules: 0,
      totalConversations: 0,
      avgResponseTime: 'N/A'
    });
  }
});

app.get('/api/reports/top-intents', authMiddleware, requirePermission(PERMISSIONS.AI_AGENT_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        intent_detected as intent,
        COUNT(*) as count
      FROM ai_conversations 
      WHERE tenant_id = ? AND intent_detected IS NOT NULL
      GROUP BY intent_detected
      ORDER BY count DESC
      LIMIT 10
    `).bind(tenantId).all();

    // Calculate percentages
    const totalCount = results.reduce((sum: number, item: any) => sum + item.count, 0);
    const resultsWithPercentage = results.map((item: any) => ({
      ...item,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }));

    return c.json(resultsWithPercentage);
  } catch (error) {
    console.error('Error fetching top intents:', error);
    return c.json([]);
  }
});

app.get('/api/reports/inventory-movement', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        COALESCE(mc.name, 'Sem Categoria') as category,
        COUNT(CASE WHEN me.entry_type = 'in' THEN 1 END) as entradas,
        COUNT(CASE WHEN me.entry_type = 'out' THEN 1 END) as saidas
      FROM material_entries me
      LEFT JOIN materials m ON me.material_id = m.id
      LEFT JOIN material_categories mc ON m.category_id = mc.id
      WHERE me.tenant_id = ?
      AND DATE(me.created_at) >= DATE('now', '-30 days')
      GROUP BY mc.name
      HAVING (entradas > 0 OR saidas > 0)
      ORDER BY (entradas + saidas) DESC
      LIMIT 10
    `).bind(tenantId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching inventory movement:', error);
    return c.json([]);
  }
});

app.get('/api/reports/top-used-items', authMiddleware, requirePermission(PERMISSIONS.INVENTORY_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        m.name,
        COALESCE(SUM(mc.quantity_used), 0) as usage
      FROM materials m
      LEFT JOIN material_consumption mc ON m.id = mc.material_id
        AND DATE(mc.consumed_at) >= DATE('now', '-30 days')
      WHERE m.tenant_id = ? AND m.is_active = 1
      GROUP BY m.id, m.name
      HAVING usage > 0
      ORDER BY usage DESC
      LIMIT 10
    `).bind(tenantId).all();

    // Calculate percentages
    const totalUsage = results.reduce((sum: number, item: any) => sum + item.usage, 0);
    const resultsWithPercentage = results.map((item: any) => ({
      ...item,
      percentage: totalUsage > 0 ? Math.round((item.usage / totalUsage) * 100) : 0
    }));

    return c.json(resultsWithPercentage);
  } catch (error) {
    console.error('Error fetching top used items:', error);
    return c.json([]);
  }
});

// Dashboard Stats routes
app.get('/api/dashboard/stats', authMiddleware, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    // Appointments today
    const { results: appointmentsToday } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE tenant_id = ? AND DATE(start_datetime) = DATE('now') AND status != 'cancelled'"
    ).bind(tenantId).all();

    // Appointments this week
    const { results: appointmentsWeek } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE tenant_id = ? AND DATE(start_datetime) >= DATE('now', 'weekday 0', '-6 days') AND status != 'cancelled'"
    ).bind(tenantId).all();

    // Total patients
    const { results: totalPatients } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM patients WHERE tenant_id = ? AND is_active = 1"
    ).bind(tenantId).all();

    // Total dentists/professionals
    const { results: totalDentists } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM dentists WHERE tenant_id = ? AND is_active = 1"
    ).bind(tenantId).all();

    // Waiting list count
    const { results: waitingListCount } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM waiting_list WHERE tenant_id = ? AND status = 'waiting'"
    ).bind(tenantId).all();

    // Low stock items
    const { results: lowStockItems } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM materials WHERE tenant_id = ? AND current_stock <= min_stock_level AND is_active = 1"
    ).bind(tenantId).all();

    // WhatsApp messages today
    const { results: whatsappToday } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM whatsapp_messages WHERE tenant_id = ? AND DATE(sent_at) = DATE('now')"
    ).bind(tenantId).all();

    // AI leads today
    const { results: aiLeadsToday } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM ai_leads WHERE tenant_id = ? AND DATE(created_at) = DATE('now')"
    ).bind(tenantId).all();

    // AI conversion rate (converted leads / total leads * 100)
    const { results: totalLeads } = await c.env.DB.prepare(
      "SELECT COUNT(*) as total FROM ai_leads WHERE tenant_id = ?"
    ).bind(tenantId).all();

    const { results: convertedLeads } = await c.env.DB.prepare(
      "SELECT COUNT(*) as converted FROM ai_leads WHERE tenant_id = ? AND status = 'converted'"
    ).bind(tenantId).all();

    const totalLeadsCount = (totalLeads as any)[0]?.total || 0;
    const convertedLeadsCount = (convertedLeads as any)[0]?.converted || 0;
    const conversionRate = totalLeadsCount > 0 ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) : 0;

    const stats = {
      appointments_today: (appointmentsToday as any)[0]?.count || 0,
      appointments_week: (appointmentsWeek as any)[0]?.count || 0,
      total_patients: (totalPatients as any)[0]?.count || 0,
      total_dentists: (totalDentists as any)[0]?.count || 0,
      waiting_list_count: (waitingListCount as any)[0]?.count || 0,
      low_stock_items: (lowStockItems as any)[0]?.count || 0,
      whatsapp_messages_today: (whatsappToday as any)[0]?.count || 0,
      ai_leads_today: (aiLeadsToday as any)[0]?.count || 0,
      ai_conversion_rate: conversionRate
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

app.get('/api/dashboard/activity', authMiddleware, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  try {
    // Get recent activities from different tables

    // Recent appointments created
    const { results: recentAppointments } = await c.env.DB.prepare(`
      SELECT 
        a.id,
        'appointment' as type,
        'Nova consulta agendada: ' || p.name || ' com Dr(a). ' || d.name as description,
        a.created_at as timestamp,
        u.name as user_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN dentists d ON a.dentist_id = d.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.tenant_id = ? AND a.created_at >= DATETIME('now', '-7 days')
      ORDER BY a.created_at DESC
      LIMIT 5
    `).bind(tenantId).all();

    // Recent patients added
    const { results: recentPatients } = await c.env.DB.prepare(`
      SELECT 
        id,
        'patient' as type,
        'Novo paciente cadastrado: ' || name as description,
        created_at as timestamp,
        NULL as user_name
      FROM patients
      WHERE tenant_id = ? AND created_at >= DATETIME('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 3
    `).bind(tenantId).all();

    // Recent material entries
    const { results: recentMaterials } = await c.env.DB.prepare(`
      SELECT 
        me.id,
        'material' as type,
        CASE 
          WHEN me.entry_type = 'in' THEN 'Entrada de estoque: ' || m.name || ' (+' || me.quantity || ')'
          ELSE 'Saída de estoque: ' || m.name || ' (-' || me.quantity || ')'
        END as description,
        me.created_at as timestamp,
        u.name as user_name
      FROM material_entries me
      LEFT JOIN materials m ON me.material_id = m.id
      LEFT JOIN users u ON me.created_by = u.id
      WHERE me.tenant_id = ? AND me.created_at >= DATETIME('now', '-7 days')
      ORDER BY me.created_at DESC
      LIMIT 3
    `).bind(tenantId).all();

    // Recent WhatsApp messages
    const { results: recentWhatsApp } = await c.env.DB.prepare(`
      SELECT 
        id,
        'whatsapp' as type,
        'Mensagem WhatsApp ' || 
        CASE direction 
          WHEN 'incoming' THEN 'recebida de ' 
          ELSE 'enviada para ' 
        END || contact_phone as description,
        sent_at as timestamp,
        NULL as user_name
      FROM whatsapp_messages
      WHERE tenant_id = ? AND sent_at >= DATETIME('now', '-7 days')
      ORDER BY sent_at DESC
      LIMIT 3
    `).bind(tenantId).all();

    // Recent AI leads
    const { results: recentAILeads } = await c.env.DB.prepare(`
      SELECT 
        id,
        'ai_lead' as type,
        'Novo lead IA: ' || COALESCE(name, phone) || ' (' || status || ')' as description,
        created_at as timestamp,
        'AI' as user_name
      FROM ai_leads
      WHERE tenant_id = ? AND created_at >= DATETIME('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 3
    `).bind(tenantId).all();

    // Combine all activities and sort by timestamp
    const allActivities = [
      ...recentAppointments,
      ...recentPatients,
      ...recentMaterials,
      ...recentWhatsApp,
      ...recentAILeads
    ];

    // Sort by timestamp and limit to top 10
    const sortedActivities = allActivities
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return c.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return c.json({ error: 'Failed to fetch dashboard activity' }, 500);
  }
});

// Tenant Settings routes
app.get('/api/tenant/settings', authMiddleware, async (c) => {
  const tenantId = await getUserTenantId(c);
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM tenants WHERE id = ?"
  ).bind(tenantId).all();

  if (!results[0]) {
    return c.json({ error: "Tenant not found" }, 404);
  }

  const tenant = results[0] as any;
  
  // Get user email from users table
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT email FROM users WHERE mocha_user_id = ? AND tenant_id = ?"
  ).bind(mochaUser.id, tenantId).all();
  
  const userEmail = userResults[0]?.email || '';
  
  // Parse JSON fields with defaults
  const workingHours = tenant.working_hours ? JSON.parse(tenant.working_hours) : {
    monday: { enabled: true, start: '08:00', end: '18:00', break_start: '', break_end: '' },
    tuesday: { enabled: true, start: '08:00', end: '18:00', break_start: '', break_end: '' },
    wednesday: { enabled: true, start: '08:00', end: '18:00', break_start: '', break_end: '' },
    thursday: { enabled: true, start: '08:00', end: '18:00', break_start: '', break_end: '' },
    friday: { enabled: true, start: '08:00', end: '18:00', break_start: '', break_end: '' },
    saturday: { enabled: false, start: '08:00', end: '12:00', break_start: '', break_end: '' },
    sunday: { enabled: false, start: '08:00', end: '12:00', break_start: '', break_end: '' }
  };

  const notifications = tenant.notifications ? JSON.parse(tenant.notifications) : {
    email_reminders: true,
    sms_reminders: false,
    appointment_confirmations: true,
    waiting_list_notifications: true,
    stock_alerts: true,
    reminder_hours_before: 24
  };

  return c.json({
    clinic: {
      name: tenant.name || '',
      phone: tenant.phone || '',
      email: userEmail,
      address: tenant.address || '',
      website: tenant.website || '',
      logo_url: tenant.logo_url || '',
      primary_color: tenant.primary_color || '#3B82F6',
      secondary_color: tenant.secondary_color || '#10B981'
    },
    working_hours: workingHours,
    notifications: notifications
  });
});

app.put('/api/tenant/settings', authMiddleware, requirePermission(PERMISSIONS.CLINIC_SETTINGS_MANAGE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const { clinic, working_hours, notifications } = await c.req.json();

  try {
    const result = await c.env.DB.prepare(`
      UPDATE tenants 
      SET name = ?, phone = ?, email = ?, address = ?, website = ?, 
          logo_url = ?, primary_color = ?, secondary_color = ?,
          working_hours = ?, notifications = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      clinic.name,
      clinic.phone || null,
      clinic.email || null,
      clinic.address || null,
      clinic.website || null,
      clinic.logo_url || null,
      clinic.primary_color,
      clinic.secondary_color,
      JSON.stringify(working_hours),
      JSON.stringify(notifications),
      tenantId
    ).first();

    if (!result) {
      return c.json({ error: "Failed to update settings" }, 500);
    }

    return c.json({ 
      success: true, 
      message: "Configurações salvas com sucesso!",
      updated_clinic: {
        name: clinic.name
      }
    });
  } catch (error) {
    console.error('Error saving tenant settings:', error);
    return c.json({ error: "Erro ao salvar configurações" }, 500);
  }
});

// Removed user upgrade to admin route - this functionality has been deprecated for security reasons

// Process incoming WhatsApp messages with AI
app.post('/api/ai/process-whatsapp-message', async (c) => {
  try {
    const { phone, message, tenant_id } = await c.req.json();
    
    if (!phone || !message || !tenant_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get or create lead
    let { results: leadResults } = await c.env.DB.prepare(
      'SELECT * FROM ai_leads WHERE phone = ? AND tenant_id = ?'
    ).bind(phone, tenant_id).all();

    let lead = leadResults[0] as any;
    
    if (!lead) {
      // Create new lead
      lead = await c.env.DB.prepare(`
        INSERT INTO ai_leads (
          tenant_id, phone, source, status, conversation_stage
        ) VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `).bind(tenant_id, phone, 'whatsapp', 'new', 'initial_contact').first();
    }

    // Process message with AI
    const conversationId = `whatsapp_${phone}_${Date.now()}`;
    
    if (c.env.OPENAI_API_KEY) {
      const aiResult = await processMessageWithAI(c.env, tenant_id, message, lead.id);
      
      // Save lead's message
      await c.env.DB.prepare(`
        INSERT INTO ai_conversations (
          tenant_id, lead_id, conversation_id, message, sender, 
          message_type, ai_response, intent_detected, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        tenant_id,
        lead.id,
        conversationId,
        message,
        'lead',
        'text',
        false,
        aiResult.intent,
        aiResult.confidence
      ).run();

      // Save AI response
      await c.env.DB.prepare(`
        INSERT INTO ai_conversations (
          tenant_id, lead_id, conversation_id, message, sender, 
          message_type, ai_response, intent_detected, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        tenant_id,
        lead.id,
        conversationId,
        aiResult.response,
        'ai',
        'text',
        true,
        aiResult.intent,
        aiResult.confidence
      ).run();

      // Update lead interaction time
      await c.env.DB.prepare(`
        UPDATE ai_leads 
        SET last_interaction_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(lead.id).run();

      return c.json({ 
        success: true, 
        response: aiResult.response,
        intent: aiResult.intent,
        confidence: aiResult.confidence
      });
    } else {
      return c.json({ error: 'AI not configured' }, 400);
    }
  } catch (error) {
    console.error('Error processing WhatsApp message with AI:', error);
    return c.json({ error: 'Failed to process message' }, 500);
  }
});

// ============================================================================
// ANAMNESIS MODULE - Digital Forms and Protocols System
// ============================================================================

// Helper function to generate secure tokens
function generateSecureToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

// Helper function to detect alerts in form data
async function detectAlertsInFormData(env: Env, tenantId: number, formData: any): Promise<any[]> {
  // Get keywords for this tenant
  const { results: keywords } = await env.DB.prepare(
    'SELECT * FROM anamnesis_keywords WHERE tenant_id = ? AND is_active = 1'
  ).bind(tenantId).all();
  
  const detectedAlerts: any[] = [];
  const formDataString = JSON.stringify(formData).toLowerCase();
  
  for (const keyword of keywords) {
    const keywordText = (keyword as any).keyword.toLowerCase();
    if (formDataString.includes(keywordText)) {
      detectedAlerts.push({
        keyword: (keyword as any).keyword,
        alert_level: (keyword as any).alert_level,
        alert_message: (keyword as any).alert_message,
        contraindications: (keyword as any).contraindications
      });
    }
  }
  
  return detectedAlerts;
}

// Anamnesis Templates routes
app.get('/api/anamnesis/templates', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_ALL]), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      at.*,
      u.name as created_by_name
    FROM anamnesis_templates at
    LEFT JOIN users u ON at.created_by = u.id
    WHERE at.tenant_id = ? AND at.is_active = 1
    ORDER BY at.is_default DESC, at.name ASC
  `).bind(tenantId).all();

  return c.json(results.map((template: any) => ({
    ...template,
    sections: template.sections ? JSON.parse(template.sections) : []
  })));
});

app.post('/api/anamnesis/templates', authMiddleware, requirePermission(PERMISSIONS.PATIENT_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const mochaUser = c.get("user");
  const { name, description, sections, is_default } = await c.req.json();
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;

  // If setting as default, unset current default
  if (is_default) {
    await c.env.DB.prepare(`
      UPDATE anamnesis_templates 
      SET is_default = 0 
      WHERE tenant_id = ? AND is_default = 1
    `).bind(tenantId).run();
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO anamnesis_templates (
      tenant_id, name, description, sections, is_default, created_by
    ) VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    name,
    description || null,
    JSON.stringify(sections),
    is_default ? 1 : 0,
    createdBy
  ).first();

  return c.json({
    ...result,
    sections: JSON.parse((result as any).sections)
  });
});

app.put('/api/anamnesis/templates/:id', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const templateId = parseInt(c.req.param('id'));
  const { name, description, sections, is_default } = await c.req.json();

  // If setting as default, unset current default
  if (is_default) {
    await c.env.DB.prepare(`
      UPDATE anamnesis_templates 
      SET is_default = 0 
      WHERE tenant_id = ? AND is_default = 1 AND id != ?
    `).bind(tenantId, templateId).run();
  }

  const result = await c.env.DB.prepare(`
    UPDATE anamnesis_templates 
    SET name = ?, description = ?, sections = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    name,
    description || null,
    JSON.stringify(sections),
    is_default ? 1 : 0,
    templateId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Template não encontrado" }, 404);
  }

  return c.json({
    ...result,
    sections: JSON.parse((result as any).sections)
  });
});

// Anamnesis Forms routes
app.get('/api/anamnesis/forms', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_ALL]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = c.req.query('patient_id');
  const appointmentId = c.req.query('appointment_id');
  const status = c.req.query('status');
  
  let query = `
    SELECT 
      af.*,
      p.name as patient_name,
      at.name as template_name,
      a.title as appointment_title,
      a.start_datetime as appointment_date
    FROM anamnesis_forms af
    LEFT JOIN patients p ON af.patient_id = p.id
    LEFT JOIN anamnesis_templates at ON af.template_id = at.id
    LEFT JOIN appointments a ON af.appointment_id = a.id
    WHERE af.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (patientId) {
    query += ' AND af.patient_id = ?';
    params.push(parseInt(patientId));
  }
  
  if (appointmentId) {
    query += ' AND af.appointment_id = ?';
    params.push(parseInt(appointmentId));
  }
  
  if (status) {
    query += ' AND af.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY af.created_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results.map((form: any) => ({
    ...form,
    form_data: form.form_data ? JSON.parse(form.form_data) : {},
    alerts_detected: form.alerts_detected ? JSON.parse(form.alerts_detected) : []
  })));
});

app.post('/api/anamnesis/forms', authMiddleware, requirePermission(PERMISSIONS.PATIENT_CREATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const { patient_id, appointment_id, template_id, expires_in_hours } = await c.req.json();
  
  // Get default template if none specified
  let templateIdToUse = template_id;
  if (!templateIdToUse) {
    const { results: defaultTemplate } = await c.env.DB.prepare(
      'SELECT id FROM anamnesis_templates WHERE tenant_id = ? AND is_default = 1 AND is_active = 1'
    ).bind(tenantId).all();
    
    if (defaultTemplate[0]) {
      templateIdToUse = (defaultTemplate[0] as any).id;
    } else {
      return c.json({ error: 'Nenhum template de anamnese encontrado' }, 400);
    }
  }

  // Generate secure token
  const formToken = generateSecureToken();
  
  // Calculate expiration (default 48 hours)
  const expirationHours = expires_in_hours || 48;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  const result = await c.env.DB.prepare(`
    INSERT INTO anamnesis_forms (
      tenant_id, patient_id, appointment_id, template_id, form_token, 
      form_data, status, expires_at, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    patient_id,
    appointment_id || null,
    templateIdToUse,
    formToken,
    JSON.stringify({}), // Empty form data initially
    'pending',
    expiresAt.toISOString(),
    new Date().toISOString()
  ).first();

  // Get patient data for notification
  const { results: patientResults } = await c.env.DB.prepare(
    'SELECT name, email, phone FROM patients WHERE id = ? AND tenant_id = ?'
  ).bind(patient_id, tenantId).all();

  const patient = patientResults[0] as any;
  
  // Generate form URL
  const formUrl = `${c.req.url.split('/api')[0]}/anamnesis/${formToken}`;

  return c.json({
    ...result,
    form_data: {},
    alerts_detected: [],
    form_url: formUrl,
    patient_name: patient?.name,
    expires_at: expiresAt.toISOString()
  });
});

// Public route for form access (no authentication required)
app.get('/api/anamnesis/public/:token', async (c) => {
  const token = c.req.param('token');
  
  const { results } = await c.env.DB.prepare(`
    SELECT 
      af.*,
      p.name as patient_name,
      p.email as patient_email,
      at.name as template_name,
      at.sections as template_sections,
      t.name as clinic_name,
      t.logo_url as clinic_logo
    FROM anamnesis_forms af
    LEFT JOIN patients p ON af.patient_id = p.id
    LEFT JOIN anamnesis_templates at ON af.template_id = at.id
    LEFT JOIN tenants t ON af.tenant_id = t.id
    WHERE af.form_token = ? AND af.status = 'pending'
  `).bind(token).all();

  if (!results[0]) {
    return c.json({ error: 'Formulário não encontrado ou expirado' }, 404);
  }

  const form = results[0] as any;
  
  // Check if expired
  if (new Date() > new Date(form.expires_at)) {
    // Update status to expired
    await c.env.DB.prepare(`
      UPDATE anamnesis_forms 
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE form_token = ?
    `).bind(token).run();
    
    return c.json({ error: 'Formulário expirado' }, 410);
  }

  return c.json({
    id: form.id,
    patient_name: form.patient_name,
    clinic_name: form.clinic_name,
    clinic_logo: form.clinic_logo,
    template_name: form.template_name,
    template_sections: form.template_sections ? JSON.parse(form.template_sections) : [],
    form_data: form.form_data ? JSON.parse(form.form_data) : {},
    expires_at: form.expires_at
  });
});

// Public route for form submission (no authentication required)
app.post('/api/anamnesis/public/:token/submit', async (c) => {
  const token = c.req.param('token');
  const formData = await c.req.json();
  
  // Get form
  const { results } = await c.env.DB.prepare(`
    SELECT af.*, t.id as tenant_id
    FROM anamnesis_forms af
    LEFT JOIN tenants t ON af.tenant_id = t.id
    WHERE af.form_token = ? AND af.status = 'pending'
  `).bind(token).all();

  if (!results[0]) {
    return c.json({ error: 'Formulário não encontrado ou já foi preenchido' }, 404);
  }

  const form = results[0] as any;
  
  // Check if expired
  if (new Date() > new Date(form.expires_at)) {
    await c.env.DB.prepare(`
      UPDATE anamnesis_forms 
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE form_token = ?
    `).bind(token).run();
    
    return c.json({ error: 'Formulário expirado' }, 410);
  }

  // Detect alerts in form data
  const detectedAlerts = await detectAlertsInFormData(c.env, form.tenant_id, formData);

  // Update form with submitted data
  await c.env.DB.prepare(`
    UPDATE anamnesis_forms 
    SET form_data = ?, alerts_detected = ?, status = 'completed', 
        completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE form_token = ?
  `).bind(
    JSON.stringify(formData),
    JSON.stringify(detectedAlerts),
    token
  ).run();

  return c.json({
    success: true,
    message: 'Anamnese preenchida com sucesso!',
    alerts_count: detectedAlerts.length
  });
});

// Send anamnesis form (via email/WhatsApp)
app.post('/api/anamnesis/forms/:id/send', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const formId = parseInt(c.req.param('id'));
  const { method } = await c.req.json(); // 'email' or 'whatsapp'
  
  // Get form and patient data
  const { results } = await c.env.DB.prepare(`
    SELECT 
      af.*,
      p.name as patient_name,
      p.email as patient_email,
      p.phone as patient_phone,
      t.name as clinic_name
    FROM anamnesis_forms af
    LEFT JOIN patients p ON af.patient_id = p.id
    LEFT JOIN tenants t ON af.tenant_id = t.id
    WHERE af.id = ? AND af.tenant_id = ?
  `).bind(formId, tenantId).all();

  if (!results[0]) {
    return c.json({ error: 'Formulário não encontrado' }, 404);
  }

  const form = results[0] as any;
  const formUrl = `${c.req.url.split('/api')[0]}/anamnesis/${form.form_token}`;
  
  // Create message
  const message = `🌟 *${form.clinic_name}* 🌟

Olá, ${form.patient_name}! 

Sua consulta está se aproximando e queremos oferecer o melhor atendimento para você! ✨

📋 *Por favor, preencha sua anamnese digital:*
${formUrl}

⏱️ *Leva apenas 5-10 minutos*
📅 *Link expira em:* ${new Date(form.expires_at).toLocaleDateString('pt-BR')} às ${new Date(form.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

🔒 Suas informações são totalmente seguras e confidenciais.

❓ Dúvidas? Entre em contato conosco!

_Obrigado pela confiança!_ 💙`;

  try {
    // Send via requested method
    if (method === 'whatsapp' && form.patient_phone) {
      // Check if WhatsApp is configured
      const { results: configResults } = await c.env.DB.prepare(
        "SELECT * FROM whatsapp_config WHERE tenant_id = ?"
      ).bind(tenantId).all();
      
      const config = configResults[0];
      
      // Save WhatsApp message to database
      await c.env.DB.prepare(`
        INSERT INTO whatsapp_messages (
          tenant_id, contact_phone, message, direction, message_type, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        tenantId,
        form.patient_phone,
        message,
        'outgoing',
        'anamnesis_form',
        config?.is_connected ? 'sent' : 'queued'
      ).run();
      
      // Create/update WhatsApp contact
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO whatsapp_contacts (
          tenant_id, phone, name, is_patient, patient_id, last_message_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        tenantId,
        form.patient_phone,
        form.patient_name,
        1,
        form.patient_id
      ).run();
      
    } else if (method === 'email' && form.patient_email) {
      // Create email-friendly version of message
      const emailMessage = `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #10B981); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">${form.clinic_name}</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Olá, ${form.patient_name}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Sua consulta está se aproximando e queremos oferecer o melhor atendimento para você!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <h3 style="color: #3B82F6; margin-top: 0;">📋 Preencha sua Anamnese Digital</h3>
              <p style="color: #666;">O preenchimento leva apenas 5-10 minutos e nos ajuda a oferecer o melhor cuidado para você.</p>
              
              <a href="${formUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                Preencher Anamnese
              </a>
              
              <p style="color: #999; font-size: 14px;">
                ⏱️ Link expira em: ${new Date(form.expires_at).toLocaleDateString('pt-BR')} às ${new Date(form.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              🔒 Suas informações são totalmente seguras e confidenciais, protegidas pela LGPD.
            </p>
            
            <p style="color: #666;">
              Qualquer dúvida, entre em contato conosco!<br>
              <em>Obrigado pela confiança!</em>
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            © ${new Date().getFullYear()} ${form.clinic_name}. Todos os direitos reservados.
          </div>
        </body>
        </html>
      `;
      
      // Log email for now (in production, integrate with email service)
      console.log('Email would be sent to:', form.patient_email);
      console.log('Email HTML:', emailMessage);
    }

    // Update sent timestamp and method
    await c.env.DB.prepare(`
      UPDATE anamnesis_forms 
      SET sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(formId).run();

    return c.json({
      success: true,
      message: `Formulário enviado via ${method === 'email' ? 'e-mail' : 'WhatsApp'} com sucesso!`,
      form_url: formUrl,
      preview_message: method === 'whatsapp' ? message : 'E-mail formatado enviado'
    });
  } catch (error) {
    console.error('Error sending anamnesis form:', error);
    return c.json({ error: 'Erro ao enviar formulário' }, 500);
  }
});

// Treatment Protocols routes
app.get('/api/anamnesis/protocols', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_ALL]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = c.req.query('patient_id');
  const professionalId = c.req.query('professional_id');
  
  let query = `
    SELECT 
      tp.*,
      p.name as patient_name,
      d.name as professional_name,
      af.id as anamnesis_form_id,
      a.title as appointment_title,
      a.start_datetime as appointment_date
    FROM treatment_protocols tp
    LEFT JOIN patients p ON tp.patient_id = p.id
    LEFT JOIN dentists d ON tp.professional_id = d.id
    LEFT JOIN anamnesis_forms af ON tp.anamnesis_form_id = af.id
    LEFT JOIN appointments a ON tp.appointment_id = a.id
    WHERE tp.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (patientId) {
    query += ' AND tp.patient_id = ?';
    params.push(parseInt(patientId));
  }
  
  if (professionalId) {
    query += ' AND tp.professional_id = ?';
    params.push(parseInt(professionalId));
  }
  
  query += ' ORDER BY tp.created_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results.map((protocol: any) => ({
    ...protocol,
    recommended_procedures: protocol.recommended_procedures ? JSON.parse(protocol.recommended_procedures) : []
  })));
});

app.post('/api/anamnesis/protocols', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();
  
  const createdBy = userResults[0]?.id;

  const {
    patient_id,
    appointment_id,
    anamnesis_form_id,
    professional_id,
    protocol_title,
    objectives,
    contraindications,
    recommended_procedures,
    care_instructions,
    follow_up_plan,
    notes
  } = await c.req.json();

  const result = await c.env.DB.prepare(`
    INSERT INTO treatment_protocols (
      tenant_id, patient_id, appointment_id, anamnesis_form_id, professional_id,
      protocol_title, objectives, contraindications, recommended_procedures,
      care_instructions, follow_up_plan, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    patient_id,
    appointment_id || null,
    anamnesis_form_id || null,
    professional_id,
    protocol_title,
    objectives || null,
    contraindications || null,
    JSON.stringify(recommended_procedures || []),
    care_instructions || null,
    follow_up_plan || null,
    notes || null,
    createdBy
  ).first();

  return c.json({
    ...result,
    recommended_procedures: JSON.parse((result as any).recommended_procedures)
  });
});

app.put('/api/anamnesis/protocols/:id', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const protocolId = parseInt(c.req.param('id'));
  
  const {
    protocol_title,
    objectives,
    contraindications,
    recommended_procedures,
    care_instructions,
    follow_up_plan,
    notes,
    status
  } = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE treatment_protocols 
    SET protocol_title = ?, objectives = ?, contraindications = ?, 
        recommended_procedures = ?, care_instructions = ?, follow_up_plan = ?, 
        notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    protocol_title,
    objectives || null,
    contraindications || null,
    JSON.stringify(recommended_procedures || []),
    care_instructions || null,
    follow_up_plan || null,
    notes || null,
    status || 'draft',
    protocolId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Protocolo não encontrado" }, 404);
  }

  return c.json({
    ...result,
    recommended_procedures: JSON.parse((result as any).recommended_procedures)
  });
});

// Consent Forms routes
app.get('/api/anamnesis/consent-forms', authMiddleware, requireAnyPermission([PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_ALL]), async (c) => {
  const tenantId = await getUserTenantId(c);
  const patientId = c.req.query('patient_id');
  
  let query = `
    SELECT 
      cf.*,
      p.name as patient_name,
      a.title as appointment_title,
      tp.protocol_title
    FROM consent_forms cf
    LEFT JOIN patients p ON cf.patient_id = p.id
    LEFT JOIN appointments a ON cf.appointment_id = a.id
    LEFT JOIN treatment_protocols tp ON cf.protocol_id = tp.id
    WHERE cf.tenant_id = ?
  `;
  
  const params: (string | number)[] = [tenantId];
  
  if (patientId) {
    query += ' AND cf.patient_id = ?';
    params.push(parseInt(patientId));
  }
  
  query += ' ORDER BY cf.created_at DESC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

app.post('/api/anamnesis/consent-forms', async (c) => {
  // This route can be public for digital signature during consultation
  const {
    tenant_id,
    patient_id,
    appointment_id,
    anamnesis_form_id,
    protocol_id,
    consent_text,
    patient_signature
  } = await c.req.json();

  // Get client info for audit
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const userAgent = c.req.header('user-agent') || 'unknown';

  const result = await c.env.DB.prepare(`
    INSERT INTO consent_forms (
      tenant_id, patient_id, appointment_id, anamnesis_form_id, protocol_id,
      consent_text, patient_signature, signed_at, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenant_id,
    patient_id,
    appointment_id || null,
    anamnesis_form_id || null,
    protocol_id || null,
    consent_text,
    patient_signature,
    new Date().toISOString(),
    ipAddress,
    userAgent
  ).first();

  return c.json(result);
});

// Keywords and Alerts routes
app.get('/api/anamnesis/keywords', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM anamnesis_keywords 
    WHERE tenant_id = ? AND is_active = 1
    ORDER BY alert_level, keyword
  `).bind(tenantId).all();

  return c.json(results);
});

app.post('/api/anamnesis/keywords', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const { keyword, alert_level, alert_message, contraindications } = await c.req.json();

  const result = await c.env.DB.prepare(`
    INSERT INTO anamnesis_keywords (
      tenant_id, keyword, alert_level, alert_message, contraindications
    ) VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    tenantId,
    keyword,
    alert_level || 'warning',
    alert_message || null,
    contraindications || null
  ).first();

  return c.json(result);
});

app.put('/api/anamnesis/keywords/:id', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const keywordId = parseInt(c.req.param('id'));
  const { keyword, alert_level, alert_message, contraindications } = await c.req.json();

  const result = await c.env.DB.prepare(`
    UPDATE anamnesis_keywords 
    SET keyword = ?, alert_level = ?, alert_message = ?, contraindications = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
    RETURNING *
  `).bind(
    keyword,
    alert_level,
    alert_message || null,
    contraindications || null,
    keywordId,
    tenantId
  ).first();

  if (!result) {
    return c.json({ error: "Palavra-chave não encontrada" }, 404);
  }

  return c.json(result);
});

app.delete('/api/anamnesis/keywords/:id', authMiddleware, requirePermission(PERMISSIONS.PATIENT_UPDATE), async (c) => {
  const tenantId = await getUserTenantId(c);
  const keywordId = parseInt(c.req.param('id'));

  await c.env.DB.prepare(`
    UPDATE anamnesis_keywords 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
  `).bind(keywordId, tenantId).run();

  return c.json({ success: true, message: "Palavra-chave desativada" });
});

// Analytics for anamnesis module
app.get('/api/anamnesis/analytics', authMiddleware, requirePermission(PERMISSIONS.REPORTS_VIEW_ALL), async (c) => {
  const tenantId = await getUserTenantId(c);
  
  // Forms completion rate
  const { results: totalForms } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM anamnesis_forms WHERE tenant_id = ?"
  ).bind(tenantId).all();

  const { results: completedForms } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM anamnesis_forms WHERE tenant_id = ? AND status = 'completed'"
  ).bind(tenantId).all();

  const completionRate = (totalForms as any)[0]?.count > 0 
    ? Math.round(((completedForms as any)[0]?.count / (totalForms as any)[0]?.count) * 100)
    : 0;

  // Average completion time
  const { results: avgTime } = await c.env.DB.prepare(`
    SELECT AVG(
      (julianday(completed_at) - julianday(sent_at)) * 24 * 60
    ) as avg_minutes
    FROM anamnesis_forms 
    WHERE tenant_id = ? AND status = 'completed' 
    AND completed_at IS NOT NULL AND sent_at IS NOT NULL
  `).bind(tenantId).all();

  // Alerts frequency
  const { results: alertsCount } = await c.env.DB.prepare(`
    SELECT COUNT(*) as count 
    FROM anamnesis_forms 
    WHERE tenant_id = ? AND alerts_detected IS NOT NULL 
    AND json_array_length(alerts_detected) > 0
  `).bind(tenantId).all();

  // Recent forms
  const { results: recentForms } = await c.env.DB.prepare(`
    SELECT 
      af.id,
      af.status,
      af.created_at,
      p.name as patient_name,
      CASE 
        WHEN af.alerts_detected IS NOT NULL AND json_array_length(af.alerts_detected) > 0 
        THEN json_array_length(af.alerts_detected)
        ELSE 0
      END as alerts_count
    FROM anamnesis_forms af
    LEFT JOIN patients p ON af.patient_id = p.id
    WHERE af.tenant_id = ?
    ORDER BY af.created_at DESC
    LIMIT 10
  `).bind(tenantId).all();

  return c.json({
    total_forms: (totalForms as any)[0]?.count || 0,
    completed_forms: (completedForms as any)[0]?.count || 0,
    completion_rate: completionRate,
    avg_completion_time_minutes: Math.round((avgTime as any)[0]?.avg_minutes || 0),
    forms_with_alerts: (alertsCount as any)[0]?.count || 0,
    recent_forms: recentForms
  });
});

export default app;
