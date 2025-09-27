import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  date: { input: string; output: string; }
  jsonb: { input: any; output: any; }
  numeric: { input: number; output: number; }
  time: { input: string; output: string; }
  timestamptz: { input: string; output: string; }
  uuid: { input: string; output: string; }
};

export type BooleanComparisonExp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type IntComparisonExp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  delete_anamnesis_forms_by_pk?: Maybe<AnamnesisForms>;
  delete_anamnesis_templates_by_pk?: Maybe<AnamnesisTemplates>;
  delete_appointments_by_pk?: Maybe<Appointments>;
  delete_materials_by_pk?: Maybe<Materials>;
  delete_patients_by_pk?: Maybe<Patients>;
  delete_professionals_by_pk?: Maybe<Professionals>;
  delete_waiting_list_by_pk?: Maybe<WaitingList>;
  insert_anamnesis_forms_one?: Maybe<AnamnesisForms>;
  insert_anamnesis_templates_one?: Maybe<AnamnesisTemplates>;
  insert_appointments_one?: Maybe<Appointments>;
  insert_billing_history_one?: Maybe<BillingHistory>;
  insert_feature_flags_one?: Maybe<FeatureFlags>;
  insert_material_categories_one?: Maybe<MaterialCategories>;
  insert_material_entries_one?: Maybe<MaterialEntries>;
  insert_materials_one?: Maybe<Materials>;
  insert_patients_one?: Maybe<Patients>;
  insert_plan_features_one?: Maybe<PlanFeatures>;
  insert_professionals_one?: Maybe<Professionals>;
  insert_subscription_plans_one?: Maybe<SubscriptionPlans>;
  insert_tenant_feature_overrides_one?: Maybe<TenantFeatureOverrides>;
  insert_waiting_list_one?: Maybe<WaitingList>;
  update_anamnesis_forms_by_pk?: Maybe<AnamnesisForms>;
  update_anamnesis_templates_by_pk?: Maybe<AnamnesisTemplates>;
  update_appointments_by_pk?: Maybe<Appointments>;
  update_feature_flags_by_pk?: Maybe<FeatureFlags>;
  update_materials_by_pk?: Maybe<Materials>;
  update_patients_by_pk?: Maybe<Patients>;
  update_professionals_by_pk?: Maybe<Professionals>;
  update_subscription_plans_by_pk?: Maybe<SubscriptionPlans>;
  update_tenants_by_pk?: Maybe<Tenants>;
  update_waiting_list_by_pk?: Maybe<WaitingList>;
};


export type MutationDeleteAnamnesisFormsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeleteAnamnesisTemplatesByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeleteAppointmentsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeleteMaterialsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeletePatientsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeleteProfessionalsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationDeleteWaitingListByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type MutationInsertAnamnesisFormsOneArgs = {
  object: AnamnesisFormsInsertInput;
};


export type MutationInsertAnamnesisTemplatesOneArgs = {
  object: AnamnesisTemplatesInsertInput;
};


export type MutationInsertAppointmentsOneArgs = {
  object: AppointmentsInsertInput;
};


export type MutationInsertBillingHistoryOneArgs = {
  object: BillingHistoryInsertInput;
};


export type MutationInsertFeatureFlagsOneArgs = {
  object: FeatureFlagsInsertInput;
};


export type MutationInsertMaterialCategoriesOneArgs = {
  object: MaterialCategoriesInsertInput;
};


export type MutationInsertMaterialEntriesOneArgs = {
  object: MaterialEntriesInsertInput;
};


export type MutationInsertMaterialsOneArgs = {
  object: MaterialsInsertInput;
};


export type MutationInsertPatientsOneArgs = {
  object: PatientsInsertInput;
};


export type MutationInsertPlanFeaturesOneArgs = {
  object: PlanFeaturesInsertInput;
  on_conflict: PlanFeaturesOnConflict;
};


export type MutationInsertProfessionalsOneArgs = {
  object: ProfessionalsInsertInput;
};


export type MutationInsertSubscriptionPlansOneArgs = {
  object: SubscriptionPlansInsertInput;
};


export type MutationInsertTenantFeatureOverridesOneArgs = {
  object: TenantFeatureOverridesInsertInput;
};


export type MutationInsertWaitingListOneArgs = {
  object: WaitingListInsertInput;
};


export type MutationUpdateAnamnesisFormsByPkArgs = {
  _set: AnamnesisFormsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateAnamnesisTemplatesByPkArgs = {
  _set: AnamnesisTemplatesSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateAppointmentsByPkArgs = {
  _set: AppointmentsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateFeatureFlagsByPkArgs = {
  _set: FeatureFlagsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateMaterialsByPkArgs = {
  _set: MaterialsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdatePatientsByPkArgs = {
  _set: PatientsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateProfessionalsByPkArgs = {
  _set: ProfessionalsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateSubscriptionPlansByPkArgs = {
  _set: SubscriptionPlansSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateTenantsByPkArgs = {
  _set: TenantsSetInput;
  pk_columns: Scalars['String']['input'];
};


export type MutationUpdateWaitingListByPkArgs = {
  _set: WaitingListSetInput;
  pk_columns: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  anamnesis_forms: Array<AnamnesisForms>;
  anamnesis_forms_aggregate: AnamnesisFormsAggregate;
  anamnesis_forms_by_pk?: Maybe<AnamnesisForms>;
  anamnesis_templates: Array<AnamnesisTemplates>;
  anamnesis_templates_aggregate: AnamnesisTemplatesAggregate;
  anamnesis_templates_by_pk?: Maybe<AnamnesisTemplates>;
  appointments: Array<Appointments>;
  appointments_aggregate: AppointmentsAggregate;
  appointments_by_pk?: Maybe<Appointments>;
  billing_history: Array<BillingHistory>;
  feature_flags: Array<FeatureFlags>;
  feature_flags_by_pk?: Maybe<FeatureFlags>;
  material_categories: Array<MaterialCategories>;
  material_categories_by_pk?: Maybe<MaterialCategories>;
  material_entries: Array<MaterialEntries>;
  material_entries_aggregate: MaterialEntriesAggregate;
  material_entries_by_pk?: Maybe<MaterialEntries>;
  materials: Array<Materials>;
  materials_aggregate: MaterialsAggregate;
  materials_by_pk?: Maybe<Materials>;
  patients: Array<Patients>;
  patients_aggregate: PatientsAggregate;
  patients_by_pk?: Maybe<Patients>;
  plan_features: Array<PlanFeatures>;
  professionals: Array<Professionals>;
  professionals_aggregate: ProfessionalsAggregate;
  professionals_by_pk?: Maybe<Professionals>;
  subscription_plans: Array<SubscriptionPlans>;
  subscription_plans_by_pk?: Maybe<SubscriptionPlans>;
  tenant_feature_overrides: Array<TenantFeatureOverrides>;
  tenant_usage: Array<TenantUsage>;
  tenants: Array<Tenants>;
  tenants_aggregate: TenantsAggregate;
  tenants_by_pk?: Maybe<Tenants>;
  waiting_list: Array<WaitingList>;
  waiting_list_aggregate: WaitingListAggregate;
  waiting_list_by_pk?: Maybe<WaitingList>;
};


export type QueryAnamnesisFormsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<AnamnesisFormsOrderBy>>;
  where?: InputMaybe<AnamnesisFormsBoolExp>;
};


export type QueryAnamnesisFormsAggregateArgs = {
  where?: InputMaybe<AnamnesisFormsBoolExp>;
};


export type QueryAnamnesisFormsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryAnamnesisTemplatesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<AnamnesisTemplatesOrderBy>>;
  where?: InputMaybe<AnamnesisTemplatesBoolExp>;
};


export type QueryAnamnesisTemplatesAggregateArgs = {
  where?: InputMaybe<AnamnesisTemplatesBoolExp>;
};


export type QueryAnamnesisTemplatesByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryAppointmentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<AppointmentsOrderBy>>;
  where?: InputMaybe<AppointmentsBoolExp>;
};


export type QueryAppointmentsAggregateArgs = {
  where?: InputMaybe<AppointmentsBoolExp>;
};


export type QueryAppointmentsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryBillingHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Scalars['String']['input']>>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeatureFlagsArgs = {
  order_by?: InputMaybe<Array<FeatureFlagsOrderBy>>;
  where?: InputMaybe<FeatureFlagsBoolExp>;
};


export type QueryFeatureFlagsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryMaterialCategoriesArgs = {
  order_by?: InputMaybe<Array<Scalars['String']['input']>>;
  where?: InputMaybe<MaterialCategoriesBoolExp>;
};


export type QueryMaterialCategoriesByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryMaterialEntriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<MaterialEntriesOrderBy>>;
  where?: InputMaybe<MaterialEntriesBoolExp>;
};


export type QueryMaterialEntriesAggregateArgs = {
  where?: InputMaybe<MaterialEntriesBoolExp>;
};


export type QueryMaterialEntriesByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryMaterialsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<MaterialsOrderBy>>;
  where?: InputMaybe<MaterialsBoolExp>;
};


export type QueryMaterialsAggregateArgs = {
  where?: InputMaybe<MaterialsBoolExp>;
};


export type QueryMaterialsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryPatientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PatientsOrderBy>>;
  where?: InputMaybe<PatientsBoolExp>;
};


export type QueryPatientsAggregateArgs = {
  where?: InputMaybe<PatientsBoolExp>;
};


export type QueryPatientsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryPlanFeaturesArgs = {
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProfessionalsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<ProfessionalsOrderBy>>;
  where?: InputMaybe<ProfessionalsBoolExp>;
};


export type QueryProfessionalsAggregateArgs = {
  where?: InputMaybe<ProfessionalsBoolExp>;
};


export type QueryProfessionalsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QuerySubscriptionPlansArgs = {
  order_by?: InputMaybe<Array<SubscriptionPlansOrderBy>>;
  where?: InputMaybe<SubscriptionPlansBoolExp>;
};


export type QuerySubscriptionPlansByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryTenantFeatureOverridesArgs = {
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTenantUsageArgs = {
  order_by?: InputMaybe<Array<Scalars['String']['input']>>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTenantsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TenantsOrderBy>>;
  where?: InputMaybe<TenantsBoolExp>;
};


export type QueryTenantsAggregateArgs = {
  where?: InputMaybe<TenantsBoolExp>;
};


export type QueryTenantsByPkArgs = {
  id: Scalars['uuid']['input'];
};


export type QueryWaitingListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<WaitingListOrderBy>>;
  where?: InputMaybe<WaitingListBoolExp>;
};


export type QueryWaitingListAggregateArgs = {
  where?: InputMaybe<WaitingListBoolExp>;
};


export type QueryWaitingListByPkArgs = {
  id: Scalars['uuid']['input'];
};

export type StringComparisonExp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  _nlike?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  anamnesis_forms: Array<AnamnesisForms>;
  appointments: Array<Appointments>;
  materials: Array<Materials>;
  patients: Array<Patients>;
  professionals: Array<Professionals>;
  tenants: Array<Tenants>;
  waiting_list: Array<WaitingList>;
};


export type SubscriptionAnamnesisFormsArgs = {
  order_by?: InputMaybe<Array<AnamnesisFormsOrderBy>>;
  where?: InputMaybe<AnamnesisFormsBoolExp>;
};


export type SubscriptionAppointmentsArgs = {
  order_by?: InputMaybe<Array<AppointmentsOrderBy>>;
  where?: InputMaybe<AppointmentsBoolExp>;
};


export type SubscriptionMaterialsArgs = {
  order_by?: InputMaybe<Array<MaterialsOrderBy>>;
  where?: InputMaybe<MaterialsBoolExp>;
};


export type SubscriptionPatientsArgs = {
  order_by?: InputMaybe<Array<PatientsOrderBy>>;
  where?: InputMaybe<PatientsBoolExp>;
};


export type SubscriptionProfessionalsArgs = {
  order_by?: InputMaybe<Array<ProfessionalsOrderBy>>;
  where?: InputMaybe<ProfessionalsBoolExp>;
};


export type SubscriptionTenantsArgs = {
  order_by?: InputMaybe<Array<TenantsOrderBy>>;
  where?: InputMaybe<TenantsBoolExp>;
};


export type SubscriptionWaitingListArgs = {
  order_by?: InputMaybe<Array<WaitingListOrderBy>>;
  where?: InputMaybe<WaitingListBoolExp>;
};

export type AnamnesisForms = {
  __typename?: 'anamnesis_forms';
  alerts_detected?: Maybe<Scalars['jsonb']['output']>;
  appointment?: Maybe<Appointments>;
  appointment_id?: Maybe<Scalars['uuid']['output']>;
  completed_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at: Scalars['timestamptz']['output'];
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  form_data?: Maybe<Scalars['jsonb']['output']>;
  form_token: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  patient: Patients;
  patient_id: Scalars['uuid']['output'];
  sent_at?: Maybe<Scalars['timestamptz']['output']>;
  status: AnamnesisStatusEnum;
  template: AnamnesisTemplates;
  template_id: Scalars['uuid']['output'];
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type AnamnesisFormsAggregate = {
  __typename?: 'anamnesis_forms_aggregate';
  aggregate?: Maybe<AnamnesisFormsAggregateFields>;
};

export type AnamnesisFormsAggregateFields = {
  __typename?: 'anamnesis_forms_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type AnamnesisFormsBoolExp = {
  _and?: InputMaybe<Array<AnamnesisFormsBoolExp>>;
  _not?: InputMaybe<AnamnesisFormsBoolExp>;
  _or?: InputMaybe<Array<AnamnesisFormsBoolExp>>;
  alerts_detected?: InputMaybe<JsonbComparisonExp>;
  appointment_id?: InputMaybe<UuidComparisonExp>;
  completed_at?: InputMaybe<TimestamptzComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  expires_at?: InputMaybe<TimestamptzComparisonExp>;
  form_data?: InputMaybe<JsonbComparisonExp>;
  form_token?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  patient_id?: InputMaybe<UuidComparisonExp>;
  sent_at?: InputMaybe<TimestamptzComparisonExp>;
  status?: InputMaybe<StringComparisonExp>;
  template_id?: InputMaybe<UuidComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type AnamnesisFormsInsertInput = {
  alerts_detected?: InputMaybe<Scalars['jsonb']['input']>;
  appointment_id?: InputMaybe<Scalars['uuid']['input']>;
  completed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  form_data?: InputMaybe<Scalars['jsonb']['input']>;
  form_token: Scalars['String']['input'];
  id?: InputMaybe<Scalars['uuid']['input']>;
  patient_id: Scalars['uuid']['input'];
  sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<AnamnesisStatusEnum>;
  template_id: Scalars['uuid']['input'];
  tenant_id: Scalars['uuid']['input'];
};

export type AnamnesisFormsOrderBy = {
  alerts_detected?: InputMaybe<OrderBy>;
  appointment_id?: InputMaybe<OrderBy>;
  completed_at?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  expires_at?: InputMaybe<OrderBy>;
  form_data?: InputMaybe<OrderBy>;
  form_token?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  patient_id?: InputMaybe<OrderBy>;
  sent_at?: InputMaybe<OrderBy>;
  status?: InputMaybe<OrderBy>;
  template_id?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type AnamnesisFormsSetInput = {
  alerts_detected?: InputMaybe<Scalars['jsonb']['input']>;
  appointment_id?: InputMaybe<Scalars['uuid']['input']>;
  completed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  form_data?: InputMaybe<Scalars['jsonb']['input']>;
  form_token?: InputMaybe<Scalars['String']['input']>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<AnamnesisStatusEnum>;
  template_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export enum AnamnesisStatusEnum {
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export type AnamnesisTemplates = {
  __typename?: 'anamnesis_templates';
  created_at: Scalars['timestamptz']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  is_default: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sections: Scalars['jsonb']['output'];
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type AnamnesisTemplatesAggregate = {
  __typename?: 'anamnesis_templates_aggregate';
  aggregate?: Maybe<AnamnesisTemplatesAggregateFields>;
};

export type AnamnesisTemplatesAggregateFields = {
  __typename?: 'anamnesis_templates_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type AnamnesisTemplatesBoolExp = {
  _and?: InputMaybe<Array<AnamnesisTemplatesBoolExp>>;
  _not?: InputMaybe<AnamnesisTemplatesBoolExp>;
  _or?: InputMaybe<Array<AnamnesisTemplatesBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  created_by?: InputMaybe<UuidComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  is_default?: InputMaybe<BooleanComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  sections?: InputMaybe<JsonbComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type AnamnesisTemplatesInsertInput = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  sections: Scalars['jsonb']['input'];
  tenant_id: Scalars['uuid']['input'];
};

export type AnamnesisTemplatesOrderBy = {
  created_at?: InputMaybe<OrderBy>;
  created_by?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  is_default?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  sections?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type AnamnesisTemplatesSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sections?: InputMaybe<Scalars['jsonb']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export enum AppointmentStatusEnum {
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  NO_SHOW = 'no_show',
  SCHEDULED = 'scheduled'
}

export type Appointments = {
  __typename?: 'appointments';
  created_at: Scalars['timestamptz']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  end_datetime: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  patient: Patients;
  patient_id: Scalars['uuid']['output'];
  professional: Professionals;
  professional_id: Scalars['uuid']['output'];
  service_type?: Maybe<Scalars['String']['output']>;
  start_datetime: Scalars['timestamptz']['output'];
  status: AppointmentStatusEnum;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  title: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type AppointmentsAggregate = {
  __typename?: 'appointments_aggregate';
  aggregate?: Maybe<AppointmentsAggregateFields>;
};

export type AppointmentsAggregateFields = {
  __typename?: 'appointments_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type AppointmentsBoolExp = {
  _and?: InputMaybe<Array<AppointmentsBoolExp>>;
  _not?: InputMaybe<AppointmentsBoolExp>;
  _or?: InputMaybe<Array<AppointmentsBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  created_by?: InputMaybe<UuidComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  end_datetime?: InputMaybe<TimestamptzComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  notes?: InputMaybe<StringComparisonExp>;
  patient_id?: InputMaybe<UuidComparisonExp>;
  professional_id?: InputMaybe<UuidComparisonExp>;
  service_type?: InputMaybe<StringComparisonExp>;
  start_datetime?: InputMaybe<TimestamptzComparisonExp>;
  status?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  title?: InputMaybe<StringComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type AppointmentsInsertInput = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end_datetime: Scalars['timestamptz']['input'];
  id?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  patient_id: Scalars['uuid']['input'];
  professional_id: Scalars['uuid']['input'];
  service_type?: InputMaybe<Scalars['String']['input']>;
  start_datetime: Scalars['timestamptz']['input'];
  status?: InputMaybe<AppointmentStatusEnum>;
  tenant_id: Scalars['uuid']['input'];
  title: Scalars['String']['input'];
};

export type AppointmentsOrderBy = {
  created_at?: InputMaybe<OrderBy>;
  created_by?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  end_datetime?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  notes?: InputMaybe<OrderBy>;
  patient_id?: InputMaybe<OrderBy>;
  professional_id?: InputMaybe<OrderBy>;
  service_type?: InputMaybe<OrderBy>;
  start_datetime?: InputMaybe<OrderBy>;
  status?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  title?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type AppointmentsSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  end_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  professional_id?: InputMaybe<Scalars['uuid']['input']>;
  service_type?: InputMaybe<Scalars['String']['input']>;
  start_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<AppointmentStatusEnum>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type BillingHistory = {
  __typename?: 'billing_history';
  amount: Scalars['numeric']['output'];
  billing_period_end: Scalars['timestamptz']['output'];
  billing_period_start: Scalars['timestamptz']['output'];
  created_at: Scalars['timestamptz']['output'];
  currency: Scalars['String']['output'];
  external_payment_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  invoice_url?: Maybe<Scalars['String']['output']>;
  payment_method?: Maybe<Scalars['String']['output']>;
  plan?: Maybe<SubscriptionPlans>;
  plan_id?: Maybe<Scalars['uuid']['output']>;
  status: BillingStatusEnum;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type BillingHistoryInsertInput = {
  amount: Scalars['numeric']['input'];
  billing_period_end: Scalars['timestamptz']['input'];
  billing_period_start: Scalars['timestamptz']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  external_payment_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  invoice_url?: InputMaybe<Scalars['String']['input']>;
  payment_method?: InputMaybe<Scalars['String']['input']>;
  plan_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<BillingStatusEnum>;
  tenant_id: Scalars['uuid']['input'];
};

export enum BillingStatusEnum {
  FAILED = 'failed',
  PAID = 'paid',
  PENDING = 'pending',
  REFUNDED = 'refunded'
}

export type DateComparisonExp = {
  _eq?: InputMaybe<Scalars['date']['input']>;
  _gt?: InputMaybe<Scalars['date']['input']>;
  _gte?: InputMaybe<Scalars['date']['input']>;
  _in?: InputMaybe<Array<Scalars['date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['date']['input']>;
  _lte?: InputMaybe<Scalars['date']['input']>;
  _neq?: InputMaybe<Scalars['date']['input']>;
  _nin?: InputMaybe<Array<Scalars['date']['input']>>;
};

export enum EntryTypeEnum {
  IN = 'in',
  OUT = 'out'
}

export type FeatureFlags = {
  __typename?: 'feature_flags';
  category?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_premium: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type FeatureFlagsBoolExp = {
  _and?: InputMaybe<Array<FeatureFlagsBoolExp>>;
  _not?: InputMaybe<FeatureFlagsBoolExp>;
  _or?: InputMaybe<Array<FeatureFlagsBoolExp>>;
  category?: InputMaybe<StringComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_premium?: InputMaybe<BooleanComparisonExp>;
  key?: InputMaybe<StringComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type FeatureFlagsInsertInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_premium?: InputMaybe<Scalars['Boolean']['input']>;
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type FeatureFlagsOrderBy = {
  category?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_premium?: InputMaybe<OrderBy>;
  key?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type FeatureFlagsSetInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  is_premium?: InputMaybe<Scalars['Boolean']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type JsonbComparisonExp = {
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

export type MaterialCategories = {
  __typename?: 'material_categories';
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type MaterialCategoriesBoolExp = {
  _and?: InputMaybe<Array<MaterialCategoriesBoolExp>>;
  _not?: InputMaybe<MaterialCategoriesBoolExp>;
  _or?: InputMaybe<Array<MaterialCategoriesBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type MaterialCategoriesInsertInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  tenant_id: Scalars['uuid']['input'];
};

export type MaterialCategoriesSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type MaterialEntries = {
  __typename?: 'material_entries';
  batch_number?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  entry_type: EntryTypeEnum;
  expiry_date?: Maybe<Scalars['date']['output']>;
  id: Scalars['uuid']['output'];
  invoice_number?: Maybe<Scalars['String']['output']>;
  material: Materials;
  material_id: Scalars['uuid']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  supplier_name?: Maybe<Scalars['String']['output']>;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  total_cost: Scalars['numeric']['output'];
  unit_cost: Scalars['numeric']['output'];
};

export type MaterialEntriesAggregate = {
  __typename?: 'material_entries_aggregate';
  aggregate?: Maybe<MaterialEntriesAggregateFields>;
};

export type MaterialEntriesAggregateFields = {
  __typename?: 'material_entries_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type MaterialEntriesBoolExp = {
  _and?: InputMaybe<Array<MaterialEntriesBoolExp>>;
  _not?: InputMaybe<MaterialEntriesBoolExp>;
  _or?: InputMaybe<Array<MaterialEntriesBoolExp>>;
  batch_number?: InputMaybe<StringComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  created_by?: InputMaybe<UuidComparisonExp>;
  entry_type?: InputMaybe<StringComparisonExp>;
  expiry_date?: InputMaybe<DateComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  invoice_number?: InputMaybe<StringComparisonExp>;
  material_id?: InputMaybe<UuidComparisonExp>;
  notes?: InputMaybe<StringComparisonExp>;
  quantity?: InputMaybe<IntComparisonExp>;
  supplier_name?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  total_cost?: InputMaybe<NumericComparisonExp>;
  unit_cost?: InputMaybe<NumericComparisonExp>;
};

export type MaterialEntriesInsertInput = {
  batch_number?: InputMaybe<Scalars['String']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  entry_type: EntryTypeEnum;
  expiry_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  invoice_number?: InputMaybe<Scalars['String']['input']>;
  material_id: Scalars['uuid']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Int']['input'];
  supplier_name?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['uuid']['input'];
  total_cost?: InputMaybe<Scalars['numeric']['input']>;
  unit_cost?: InputMaybe<Scalars['numeric']['input']>;
};

export type MaterialEntriesOrderBy = {
  batch_number?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  created_by?: InputMaybe<OrderBy>;
  entry_type?: InputMaybe<OrderBy>;
  expiry_date?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  invoice_number?: InputMaybe<OrderBy>;
  material_id?: InputMaybe<OrderBy>;
  notes?: InputMaybe<OrderBy>;
  quantity?: InputMaybe<OrderBy>;
  supplier_name?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  total_cost?: InputMaybe<OrderBy>;
  unit_cost?: InputMaybe<OrderBy>;
};

export type Materials = {
  __typename?: 'materials';
  brand?: Maybe<Scalars['String']['output']>;
  category?: Maybe<MaterialCategories>;
  category_id?: Maybe<Scalars['uuid']['output']>;
  created_at: Scalars['timestamptz']['output'];
  current_stock: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  max_stock_level: Scalars['Int']['output'];
  min_stock_level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  supplier_contact?: Maybe<Scalars['String']['output']>;
  supplier_name?: Maybe<Scalars['String']['output']>;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  unit_cost: Scalars['numeric']['output'];
  unit_type: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type MaterialsAggregate = {
  __typename?: 'materials_aggregate';
  aggregate?: Maybe<MaterialsAggregateFields>;
};

export type MaterialsAggregateFields = {
  __typename?: 'materials_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type MaterialsBoolExp = {
  _and?: InputMaybe<Array<MaterialsBoolExp>>;
  _not?: InputMaybe<MaterialsBoolExp>;
  _or?: InputMaybe<Array<MaterialsBoolExp>>;
  brand?: InputMaybe<StringComparisonExp>;
  category_id?: InputMaybe<UuidComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  current_stock?: InputMaybe<IntComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  max_stock_level?: InputMaybe<IntComparisonExp>;
  min_stock_level?: InputMaybe<IntComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  supplier_contact?: InputMaybe<StringComparisonExp>;
  supplier_name?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  unit_cost?: InputMaybe<NumericComparisonExp>;
  unit_type?: InputMaybe<StringComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type MaterialsInsertInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  category_id?: InputMaybe<Scalars['uuid']['input']>;
  current_stock?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  max_stock_level?: InputMaybe<Scalars['Int']['input']>;
  min_stock_level?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  supplier_contact?: InputMaybe<Scalars['String']['input']>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['uuid']['input'];
  unit_cost?: InputMaybe<Scalars['numeric']['input']>;
  unit_type?: InputMaybe<Scalars['String']['input']>;
};

export type MaterialsOrderBy = {
  brand?: InputMaybe<OrderBy>;
  category_id?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  current_stock?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  max_stock_level?: InputMaybe<OrderBy>;
  min_stock_level?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  supplier_contact?: InputMaybe<OrderBy>;
  supplier_name?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  unit_cost?: InputMaybe<OrderBy>;
  unit_type?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type MaterialsSetInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  category_id?: InputMaybe<Scalars['uuid']['input']>;
  current_stock?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  max_stock_level?: InputMaybe<Scalars['Int']['input']>;
  min_stock_level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  supplier_contact?: InputMaybe<Scalars['String']['input']>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
  unit_cost?: InputMaybe<Scalars['numeric']['input']>;
  unit_type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type NumericComparisonExp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc'
}

export type Patients = {
  __typename?: 'patients';
  address?: Maybe<Scalars['String']['output']>;
  birth_date?: Maybe<Scalars['date']['output']>;
  cpf?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  email?: Maybe<Scalars['String']['output']>;
  emergency_contact?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  medical_history?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type PatientsAggregate = {
  __typename?: 'patients_aggregate';
  aggregate?: Maybe<PatientsAggregateFields>;
};

export type PatientsAggregateFields = {
  __typename?: 'patients_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type PatientsBoolExp = {
  _and?: InputMaybe<Array<PatientsBoolExp>>;
  _not?: InputMaybe<PatientsBoolExp>;
  _or?: InputMaybe<Array<PatientsBoolExp>>;
  address?: InputMaybe<StringComparisonExp>;
  birth_date?: InputMaybe<DateComparisonExp>;
  cpf?: InputMaybe<StringComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  email?: InputMaybe<StringComparisonExp>;
  emergency_contact?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  medical_history?: InputMaybe<StringComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  phone?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type PatientsInsertInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  birth_date?: InputMaybe<Scalars['date']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergency_contact?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  medical_history?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['uuid']['input'];
};

export type PatientsOrderBy = {
  address?: InputMaybe<OrderBy>;
  birth_date?: InputMaybe<OrderBy>;
  cpf?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  email?: InputMaybe<OrderBy>;
  emergency_contact?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  medical_history?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  phone?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type PatientsSetInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  birth_date?: InputMaybe<Scalars['date']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergency_contact?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  medical_history?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type PlanFeatures = {
  __typename?: 'plan_features';
  created_at: Scalars['timestamptz']['output'];
  feature_flag: FeatureFlags;
  feature_flag_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  is_enabled: Scalars['Boolean']['output'];
  limits?: Maybe<Scalars['jsonb']['output']>;
  plan: SubscriptionPlans;
  plan_id: Scalars['uuid']['output'];
};

export type PlanFeaturesInsertInput = {
  feature_flag_id: Scalars['uuid']['input'];
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_enabled?: InputMaybe<Scalars['Boolean']['input']>;
  limits?: InputMaybe<Scalars['jsonb']['input']>;
  plan_id: Scalars['uuid']['input'];
};

export type PlanFeaturesOnConflict = {
  constraint: Scalars['String']['input'];
  update_columns: Array<Scalars['String']['input']>;
};

export type Professionals = {
  __typename?: 'professionals';
  created_at: Scalars['timestamptz']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  registration_number?: Maybe<Scalars['String']['output']>;
  specialty?: Maybe<Scalars['String']['output']>;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
  working_hours?: Maybe<Scalars['jsonb']['output']>;
};

export type ProfessionalsAggregate = {
  __typename?: 'professionals_aggregate';
  aggregate?: Maybe<ProfessionalsAggregateFields>;
};

export type ProfessionalsAggregateFields = {
  __typename?: 'professionals_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type ProfessionalsBoolExp = {
  _and?: InputMaybe<Array<ProfessionalsBoolExp>>;
  _not?: InputMaybe<ProfessionalsBoolExp>;
  _or?: InputMaybe<Array<ProfessionalsBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  email?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  phone?: InputMaybe<StringComparisonExp>;
  registration_number?: InputMaybe<StringComparisonExp>;
  specialty?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
  working_hours?: InputMaybe<JsonbComparisonExp>;
};

export type ProfessionalsInsertInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  registration_number?: InputMaybe<Scalars['String']['input']>;
  specialty?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['uuid']['input'];
  working_hours?: InputMaybe<Scalars['jsonb']['input']>;
};

export type ProfessionalsOrderBy = {
  created_at?: InputMaybe<OrderBy>;
  email?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  phone?: InputMaybe<OrderBy>;
  registration_number?: InputMaybe<OrderBy>;
  specialty?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
  working_hours?: InputMaybe<OrderBy>;
};

export type ProfessionalsSetInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  registration_number?: InputMaybe<Scalars['String']['input']>;
  specialty?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  working_hours?: InputMaybe<Scalars['jsonb']['input']>;
};

export type SubscriptionPlans = {
  __typename?: 'subscription_plans';
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  features: Scalars['jsonb']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  is_popular: Scalars['Boolean']['output'];
  max_appointments_per_month?: Maybe<Scalars['Int']['output']>;
  max_patients?: Maybe<Scalars['Int']['output']>;
  max_users?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  price_monthly: Scalars['numeric']['output'];
  price_yearly?: Maybe<Scalars['numeric']['output']>;
  sort_order: Scalars['Int']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type SubscriptionPlansBoolExp = {
  _and?: InputMaybe<Array<SubscriptionPlansBoolExp>>;
  _not?: InputMaybe<SubscriptionPlansBoolExp>;
  _or?: InputMaybe<Array<SubscriptionPlansBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  description?: InputMaybe<StringComparisonExp>;
  features?: InputMaybe<JsonbComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  is_popular?: InputMaybe<BooleanComparisonExp>;
  max_appointments_per_month?: InputMaybe<IntComparisonExp>;
  max_patients?: InputMaybe<IntComparisonExp>;
  max_users?: InputMaybe<IntComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  price_monthly?: InputMaybe<NumericComparisonExp>;
  price_yearly?: InputMaybe<NumericComparisonExp>;
  sort_order?: InputMaybe<IntComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type SubscriptionPlansInsertInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_popular?: InputMaybe<Scalars['Boolean']['input']>;
  max_appointments_per_month?: InputMaybe<Scalars['Int']['input']>;
  max_patients?: InputMaybe<Scalars['Int']['input']>;
  max_users?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  price_monthly: Scalars['numeric']['input'];
  price_yearly?: InputMaybe<Scalars['numeric']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

export type SubscriptionPlansOrderBy = {
  created_at?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  features?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  is_popular?: InputMaybe<OrderBy>;
  max_appointments_per_month?: InputMaybe<OrderBy>;
  max_patients?: InputMaybe<OrderBy>;
  max_users?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  price_monthly?: InputMaybe<OrderBy>;
  price_yearly?: InputMaybe<OrderBy>;
  sort_order?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type SubscriptionPlansSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Scalars['jsonb']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_popular?: InputMaybe<Scalars['Boolean']['input']>;
  max_appointments_per_month?: InputMaybe<Scalars['Int']['input']>;
  max_patients?: InputMaybe<Scalars['Int']['input']>;
  max_users?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price_monthly?: InputMaybe<Scalars['numeric']['input']>;
  price_yearly?: InputMaybe<Scalars['numeric']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export enum SubscriptionStatusEnum {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export type TenantFeatureOverrides = {
  __typename?: 'tenant_feature_overrides';
  created_at: Scalars['timestamptz']['output'];
  created_by?: Maybe<Scalars['uuid']['output']>;
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  feature_flag: FeatureFlags;
  feature_flag_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  is_enabled: Scalars['Boolean']['output'];
  limits?: Maybe<Scalars['jsonb']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
};

export type TenantFeatureOverridesInsertInput = {
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  feature_flag_id: Scalars['uuid']['input'];
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_enabled: Scalars['Boolean']['input'];
  limits?: InputMaybe<Scalars['jsonb']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  tenant_id: Scalars['uuid']['input'];
};

export type TenantUsage = {
  __typename?: 'tenant_usage';
  created_at: Scalars['timestamptz']['output'];
  feature_key: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  metadata?: Maybe<Scalars['jsonb']['output']>;
  period_end: Scalars['timestamptz']['output'];
  period_start: Scalars['timestamptz']['output'];
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
  usage_count: Scalars['Int']['output'];
};

export type Tenants = {
  __typename?: 'tenants';
  billing_address?: Maybe<Scalars['jsonb']['output']>;
  billing_email?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  logo_url?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  plan?: Maybe<SubscriptionPlans>;
  plan_id?: Maybe<Scalars['uuid']['output']>;
  primary_color: Scalars['String']['output'];
  secondary_color: Scalars['String']['output'];
  subdomain?: Maybe<Scalars['String']['output']>;
  subscription_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  subscription_starts_at?: Maybe<Scalars['timestamptz']['output']>;
  subscription_status: SubscriptionStatusEnum;
  trial_ends_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at: Scalars['timestamptz']['output'];
};

export type TenantsAggregate = {
  __typename?: 'tenants_aggregate';
  aggregate?: Maybe<TenantsAggregateFields>;
};

export type TenantsAggregateFields = {
  __typename?: 'tenants_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type TenantsBoolExp = {
  _and?: InputMaybe<Array<TenantsBoolExp>>;
  _not?: InputMaybe<TenantsBoolExp>;
  _or?: InputMaybe<Array<TenantsBoolExp>>;
  billing_address?: InputMaybe<JsonbComparisonExp>;
  billing_email?: InputMaybe<StringComparisonExp>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  is_active?: InputMaybe<BooleanComparisonExp>;
  logo_url?: InputMaybe<StringComparisonExp>;
  name?: InputMaybe<StringComparisonExp>;
  plan_id?: InputMaybe<UuidComparisonExp>;
  primary_color?: InputMaybe<StringComparisonExp>;
  secondary_color?: InputMaybe<StringComparisonExp>;
  subdomain?: InputMaybe<StringComparisonExp>;
  subscription_ends_at?: InputMaybe<TimestamptzComparisonExp>;
  subscription_starts_at?: InputMaybe<TimestamptzComparisonExp>;
  subscription_status?: InputMaybe<StringComparisonExp>;
  trial_ends_at?: InputMaybe<TimestamptzComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type TenantsInsertInput = {
  billing_address?: InputMaybe<Scalars['jsonb']['input']>;
  billing_email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  logo_url?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  plan_id?: InputMaybe<Scalars['uuid']['input']>;
  primary_color?: InputMaybe<Scalars['String']['input']>;
  secondary_color?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
  subscription_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  subscription_starts_at?: InputMaybe<Scalars['timestamptz']['input']>;
  subscription_status?: InputMaybe<SubscriptionStatusEnum>;
  trial_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type TenantsOrderBy = {
  billing_address?: InputMaybe<OrderBy>;
  billing_email?: InputMaybe<OrderBy>;
  created_at?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  is_active?: InputMaybe<OrderBy>;
  logo_url?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  plan_id?: InputMaybe<OrderBy>;
  primary_color?: InputMaybe<OrderBy>;
  secondary_color?: InputMaybe<OrderBy>;
  subdomain?: InputMaybe<OrderBy>;
  subscription_ends_at?: InputMaybe<OrderBy>;
  subscription_starts_at?: InputMaybe<OrderBy>;
  subscription_status?: InputMaybe<OrderBy>;
  trial_ends_at?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type TenantsSetInput = {
  billing_address?: InputMaybe<Scalars['jsonb']['input']>;
  billing_email?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  logo_url?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  plan_id?: InputMaybe<Scalars['uuid']['input']>;
  primary_color?: InputMaybe<Scalars['String']['input']>;
  secondary_color?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
  subscription_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  subscription_starts_at?: InputMaybe<Scalars['timestamptz']['input']>;
  subscription_status?: InputMaybe<SubscriptionStatusEnum>;
  trial_ends_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type TimestamptzComparisonExp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

export enum UserRoleEnum {
  ADMIN = 'admin',
  OWNER = 'owner',
  PROFESSIONAL = 'professional',
  RECEPTIONIST = 'receptionist',
  SUPER_ADMIN = 'super_admin'
}

export type Users = {
  __typename?: 'users';
  created_at: Scalars['timestamptz']['output'];
  display_name?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  is_super_admin: Scalars['Boolean']['output'];
  last_login_at?: Maybe<Scalars['timestamptz']['output']>;
  role: UserRoleEnum;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type UuidComparisonExp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

export type WaitingList = {
  __typename?: 'waiting_list';
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  patient: Patients;
  patient_id: Scalars['uuid']['output'];
  preferred_date?: Maybe<Scalars['date']['output']>;
  preferred_time_end?: Maybe<Scalars['time']['output']>;
  preferred_time_start?: Maybe<Scalars['time']['output']>;
  priority: Scalars['Int']['output'];
  professional?: Maybe<Professionals>;
  professional_id?: Maybe<Scalars['uuid']['output']>;
  status: WaitingListStatusEnum;
  tenant: Tenants;
  tenant_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

export type WaitingListAggregate = {
  __typename?: 'waiting_list_aggregate';
  aggregate?: Maybe<WaitingListAggregateFields>;
};

export type WaitingListAggregateFields = {
  __typename?: 'waiting_list_aggregate_fields';
  count?: Maybe<Scalars['Int']['output']>;
};

export type WaitingListBoolExp = {
  _and?: InputMaybe<Array<WaitingListBoolExp>>;
  _not?: InputMaybe<WaitingListBoolExp>;
  _or?: InputMaybe<Array<WaitingListBoolExp>>;
  created_at?: InputMaybe<TimestamptzComparisonExp>;
  id?: InputMaybe<UuidComparisonExp>;
  notes?: InputMaybe<StringComparisonExp>;
  patient_id?: InputMaybe<UuidComparisonExp>;
  preferred_date?: InputMaybe<DateComparisonExp>;
  priority?: InputMaybe<IntComparisonExp>;
  professional_id?: InputMaybe<UuidComparisonExp>;
  status?: InputMaybe<StringComparisonExp>;
  tenant_id?: InputMaybe<UuidComparisonExp>;
  updated_at?: InputMaybe<TimestamptzComparisonExp>;
};

export type WaitingListInsertInput = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  patient_id: Scalars['uuid']['input'];
  preferred_date?: InputMaybe<Scalars['date']['input']>;
  preferred_time_end?: InputMaybe<Scalars['time']['input']>;
  preferred_time_start?: InputMaybe<Scalars['time']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  professional_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<WaitingListStatusEnum>;
  tenant_id: Scalars['uuid']['input'];
};

export type WaitingListOrderBy = {
  created_at?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  notes?: InputMaybe<OrderBy>;
  patient_id?: InputMaybe<OrderBy>;
  preferred_date?: InputMaybe<OrderBy>;
  priority?: InputMaybe<OrderBy>;
  professional_id?: InputMaybe<OrderBy>;
  status?: InputMaybe<OrderBy>;
  tenant_id?: InputMaybe<OrderBy>;
  updated_at?: InputMaybe<OrderBy>;
};

export type WaitingListSetInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  preferred_date?: InputMaybe<Scalars['date']['input']>;
  preferred_time_end?: InputMaybe<Scalars['time']['input']>;
  preferred_time_start?: InputMaybe<Scalars['time']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  professional_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<WaitingListStatusEnum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export enum WaitingListStatusEnum {
  CANCELLED = 'cancelled',
  CONTACTED = 'contacted',
  SCHEDULED = 'scheduled',
  WAITING = 'waiting'
}

export type GetPatientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPatientsQuery = { __typename?: 'Query', patients: Array<{ __typename?: 'patients', id: string, tenant_id: string, name: string, phone?: string | null, email?: string | null, cpf?: string | null, birth_date?: string | null, address?: string | null, emergency_contact?: string | null, medical_history?: string | null, is_active: boolean, created_at: string, updated_at: string }> };

export type GetPatientQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetPatientQuery = { __typename?: 'Query', patients_by_pk?: { __typename?: 'patients', id: string, tenant_id: string, name: string, phone?: string | null, email?: string | null, cpf?: string | null, birth_date?: string | null, address?: string | null, emergency_contact?: string | null, medical_history?: string | null, is_active: boolean, created_at: string, updated_at: string } | null };

export type CreatePatientMutationVariables = Exact<{
  object: PatientsInsertInput;
}>;


export type CreatePatientMutation = { __typename?: 'Mutation', insert_patients_one?: { __typename?: 'patients', id: string, tenant_id: string, name: string, phone?: string | null, email?: string | null, cpf?: string | null, birth_date?: string | null, address?: string | null, emergency_contact?: string | null, medical_history?: string | null, is_active: boolean, created_at: string, updated_at: string } | null };

export type GetAppointmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppointmentsQuery = { __typename?: 'Query', appointments: Array<{ __typename?: 'appointments', id: string, tenant_id: string, patient_id: string, professional_id: string, title: string, description?: string | null, start_datetime: string, end_datetime: string, status: AppointmentStatusEnum, service_type?: string | null, notes?: string | null, created_by?: string | null, created_at: string, updated_at: string, patient: { __typename?: 'patients', id: string, name: string, phone?: string | null, email?: string | null }, professional: { __typename?: 'professionals', id: string, name: string, specialty?: string | null } }> };

export type CreateAppointmentMutationVariables = Exact<{
  object: AppointmentsInsertInput;
}>;


export type CreateAppointmentMutation = { __typename?: 'Mutation', insert_appointments_one?: { __typename?: 'appointments', id: string, tenant_id: string, patient_id: string, professional_id: string, title: string, description?: string | null, start_datetime: string, end_datetime: string, status: AppointmentStatusEnum, service_type?: string | null, notes?: string | null, created_by?: string | null, created_at: string, updated_at: string, patient: { __typename?: 'patients', id: string, name: string, phone?: string | null, email?: string | null }, professional: { __typename?: 'professionals', id: string, name: string, specialty?: string | null } } | null };

export type GetProfessionalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfessionalsQuery = { __typename?: 'Query', professionals: Array<{ __typename?: 'professionals', id: string, tenant_id: string, name: string, registration_number?: string | null, specialty?: string | null, phone?: string | null, email?: string | null, working_hours?: any | null, is_active: boolean, created_at: string, updated_at: string }> };

export type CreateProfessionalMutationVariables = Exact<{
  object: ProfessionalsInsertInput;
}>;


export type CreateProfessionalMutation = { __typename?: 'Mutation', insert_professionals_one?: { __typename?: 'professionals', id: string, tenant_id: string, name: string, registration_number?: string | null, specialty?: string | null, phone?: string | null, email?: string | null, working_hours?: any | null, is_active: boolean, created_at: string, updated_at: string } | null };

export type GetMaterialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaterialsQuery = { __typename?: 'Query', materials: Array<{ __typename?: 'materials', id: string, tenant_id: string, category_id?: string | null, name: string, brand?: string | null, description?: string | null, unit_type: string, min_stock_level: number, max_stock_level: number, current_stock: number, unit_cost: number, supplier_name?: string | null, supplier_contact?: string | null, is_active: boolean, created_at: string, updated_at: string, category?: { __typename?: 'material_categories', id: string, name: string, description?: string | null } | null }> };

export type CreateMaterialMutationVariables = Exact<{
  object: MaterialsInsertInput;
}>;


export type CreateMaterialMutation = { __typename?: 'Mutation', insert_materials_one?: { __typename?: 'materials', id: string, tenant_id: string, category_id?: string | null, name: string, brand?: string | null, description?: string | null, unit_type: string, min_stock_level: number, max_stock_level: number, current_stock: number, unit_cost: number, supplier_name?: string | null, supplier_contact?: string | null, is_active: boolean, created_at: string, updated_at: string, category?: { __typename?: 'material_categories', id: string, name: string, description?: string | null } | null } | null };

export type GetWaitingListQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWaitingListQuery = { __typename?: 'Query', waiting_list: Array<{ __typename?: 'waiting_list', id: string, tenant_id: string, patient_id: string, professional_id?: string | null, preferred_date?: string | null, preferred_time_start?: string | null, preferred_time_end?: string | null, priority: number, status: WaitingListStatusEnum, notes?: string | null, created_at: string, updated_at: string, patient: { __typename?: 'patients', id: string, name: string, phone?: string | null, email?: string | null }, professional?: { __typename?: 'professionals', id: string, name: string, specialty?: string | null } | null }> };

export type GetAnamnesisTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAnamnesisTemplatesQuery = { __typename?: 'Query', anamnesis_templates: Array<{ __typename?: 'anamnesis_templates', id: string, tenant_id: string, name: string, description?: string | null, sections: any, is_active: boolean, is_default: boolean, created_by?: string | null, created_at: string, updated_at: string }> };

export type GetAnamnesisFormsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAnamnesisFormsQuery = { __typename?: 'Query', anamnesis_forms: Array<{ __typename?: 'anamnesis_forms', id: string, tenant_id: string, patient_id: string, appointment_id?: string | null, template_id: string, form_token: string, form_data?: any | null, status: AnamnesisStatusEnum, alerts_detected?: any | null, expires_at?: string | null, completed_at?: string | null, sent_at?: string | null, created_at: string, updated_at: string, patient: { __typename?: 'patients', id: string, name: string, phone?: string | null, email?: string | null }, appointment?: { __typename?: 'appointments', id: string, title: string, start_datetime: string } | null, template: { __typename?: 'anamnesis_templates', id: string, name: string, description?: string | null } }> };

export type GetAllTenantsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllTenantsQuery = { __typename?: 'Query', tenants: Array<{ __typename?: 'tenants', id: string, name: string, subdomain?: string | null, logo_url?: string | null, primary_color: string, secondary_color: string, is_active: boolean, plan_id?: string | null, subscription_status: SubscriptionStatusEnum, trial_ends_at?: string | null, subscription_starts_at?: string | null, subscription_ends_at?: string | null, billing_email?: string | null, billing_address?: any | null, created_at: string, updated_at: string }> };

export type GetSubscriptionPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubscriptionPlansQuery = { __typename?: 'Query', subscription_plans: Array<{ __typename?: 'subscription_plans', id: string, name: string, description?: string | null, price_monthly: number, price_yearly?: number | null, max_users?: number | null, max_patients?: number | null, max_appointments_per_month?: number | null, features: any, is_active: boolean, is_popular: boolean, sort_order: number, created_at: string, updated_at: string }> };

export type GetFeatureFlagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeatureFlagsQuery = { __typename?: 'Query', feature_flags: Array<{ __typename?: 'feature_flags', id: string, key: string, name: string, description?: string | null, category?: string | null, is_premium: boolean, created_at: string, updated_at: string }> };

export type PatientsSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type PatientsSubscriptionSubscription = { __typename?: 'Subscription', patients: Array<{ __typename?: 'patients', id: string, tenant_id: string, name: string, phone?: string | null, email?: string | null, cpf?: string | null, birth_date?: string | null, address?: string | null, emergency_contact?: string | null, medical_history?: string | null, is_active: boolean, created_at: string, updated_at: string }> };

export type AppointmentsSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AppointmentsSubscriptionSubscription = { __typename?: 'Subscription', appointments: Array<{ __typename?: 'appointments', id: string, tenant_id: string, patient_id: string, professional_id: string, title: string, description?: string | null, start_datetime: string, end_datetime: string, status: AppointmentStatusEnum, service_type?: string | null, notes?: string | null, created_by?: string | null, created_at: string, updated_at: string, patient: { __typename?: 'patients', id: string, name: string, phone?: string | null, email?: string | null }, professional: { __typename?: 'professionals', id: string, name: string, specialty?: string | null } }> };


export const GetPatientsDocument = gql`
    query GetPatients {
  patients {
    id
    tenant_id
    name
    phone
    email
    cpf
    birth_date
    address
    emergency_contact
    medical_history
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetPatientsQuery__
 *
 * To run a query within a React component, call `useGetPatientsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPatientsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetPatientsQuery, GetPatientsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPatientsQuery, GetPatientsQueryVariables>(GetPatientsDocument, options);
      }
export function useGetPatientsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPatientsQuery, GetPatientsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPatientsQuery, GetPatientsQueryVariables>(GetPatientsDocument, options);
        }
export function useGetPatientsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPatientsQuery, GetPatientsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPatientsQuery, GetPatientsQueryVariables>(GetPatientsDocument, options);
        }
export type GetPatientsQueryHookResult = ReturnType<typeof useGetPatientsQuery>;
export type GetPatientsLazyQueryHookResult = ReturnType<typeof useGetPatientsLazyQuery>;
export type GetPatientsSuspenseQueryHookResult = ReturnType<typeof useGetPatientsSuspenseQuery>;
export type GetPatientsQueryResult = Apollo.QueryResult<GetPatientsQuery, GetPatientsQueryVariables>;
export const GetPatientDocument = gql`
    query GetPatient($id: uuid!) {
  patients_by_pk(id: $id) {
    id
    tenant_id
    name
    phone
    email
    cpf
    birth_date
    address
    emergency_contact
    medical_history
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetPatientQuery__
 *
 * To run a query within a React component, call `useGetPatientQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPatientQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPatientQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPatientQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetPatientQuery, GetPatientQueryVariables> & ({ variables: GetPatientQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
      }
export function useGetPatientLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
        }
export function useGetPatientSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPatientQuery, GetPatientQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPatientQuery, GetPatientQueryVariables>(GetPatientDocument, options);
        }
export type GetPatientQueryHookResult = ReturnType<typeof useGetPatientQuery>;
export type GetPatientLazyQueryHookResult = ReturnType<typeof useGetPatientLazyQuery>;
export type GetPatientSuspenseQueryHookResult = ReturnType<typeof useGetPatientSuspenseQuery>;
export type GetPatientQueryResult = Apollo.QueryResult<GetPatientQuery, GetPatientQueryVariables>;
export const CreatePatientDocument = gql`
    mutation CreatePatient($object: patients_insert_input!) {
  insert_patients_one(object: $object) {
    id
    tenant_id
    name
    phone
    email
    cpf
    birth_date
    address
    emergency_contact
    medical_history
    is_active
    created_at
    updated_at
  }
}
    `;
export type CreatePatientMutationFn = Apollo.MutationFunction<CreatePatientMutation, CreatePatientMutationVariables>;

/**
 * __useCreatePatientMutation__
 *
 * To run a mutation, you first call `useCreatePatientMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePatientMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPatientMutation, { data, loading, error }] = useCreatePatientMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreatePatientMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreatePatientMutation, CreatePatientMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreatePatientMutation, CreatePatientMutationVariables>(CreatePatientDocument, options);
      }
export type CreatePatientMutationHookResult = ReturnType<typeof useCreatePatientMutation>;
export type CreatePatientMutationResult = Apollo.MutationResult<CreatePatientMutation>;
export type CreatePatientMutationOptions = Apollo.BaseMutationOptions<CreatePatientMutation, CreatePatientMutationVariables>;
export const GetAppointmentsDocument = gql`
    query GetAppointments {
  appointments {
    id
    tenant_id
    patient_id
    professional_id
    title
    description
    start_datetime
    end_datetime
    status
    service_type
    notes
    created_by
    created_at
    updated_at
    patient {
      id
      name
      phone
      email
    }
    professional {
      id
      name
      specialty
    }
  }
}
    `;

/**
 * __useGetAppointmentsQuery__
 *
 * To run a query within a React component, call `useGetAppointmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppointmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppointmentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAppointmentsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAppointmentsQuery, GetAppointmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAppointmentsQuery, GetAppointmentsQueryVariables>(GetAppointmentsDocument, options);
      }
export function useGetAppointmentsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAppointmentsQuery, GetAppointmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAppointmentsQuery, GetAppointmentsQueryVariables>(GetAppointmentsDocument, options);
        }
export function useGetAppointmentsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAppointmentsQuery, GetAppointmentsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAppointmentsQuery, GetAppointmentsQueryVariables>(GetAppointmentsDocument, options);
        }
export type GetAppointmentsQueryHookResult = ReturnType<typeof useGetAppointmentsQuery>;
export type GetAppointmentsLazyQueryHookResult = ReturnType<typeof useGetAppointmentsLazyQuery>;
export type GetAppointmentsSuspenseQueryHookResult = ReturnType<typeof useGetAppointmentsSuspenseQuery>;
export type GetAppointmentsQueryResult = Apollo.QueryResult<GetAppointmentsQuery, GetAppointmentsQueryVariables>;
export const CreateAppointmentDocument = gql`
    mutation CreateAppointment($object: appointments_insert_input!) {
  insert_appointments_one(object: $object) {
    id
    tenant_id
    patient_id
    professional_id
    title
    description
    start_datetime
    end_datetime
    status
    service_type
    notes
    created_by
    created_at
    updated_at
    patient {
      id
      name
      phone
      email
    }
    professional {
      id
      name
      specialty
    }
  }
}
    `;
export type CreateAppointmentMutationFn = Apollo.MutationFunction<CreateAppointmentMutation, CreateAppointmentMutationVariables>;

/**
 * __useCreateAppointmentMutation__
 *
 * To run a mutation, you first call `useCreateAppointmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAppointmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAppointmentMutation, { data, loading, error }] = useCreateAppointmentMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateAppointmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateAppointmentMutation, CreateAppointmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateAppointmentMutation, CreateAppointmentMutationVariables>(CreateAppointmentDocument, options);
      }
export type CreateAppointmentMutationHookResult = ReturnType<typeof useCreateAppointmentMutation>;
export type CreateAppointmentMutationResult = Apollo.MutationResult<CreateAppointmentMutation>;
export type CreateAppointmentMutationOptions = Apollo.BaseMutationOptions<CreateAppointmentMutation, CreateAppointmentMutationVariables>;
export const GetProfessionalsDocument = gql`
    query GetProfessionals {
  professionals {
    id
    tenant_id
    name
    registration_number
    specialty
    phone
    email
    working_hours
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetProfessionalsQuery__
 *
 * To run a query within a React component, call `useGetProfessionalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProfessionalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProfessionalsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProfessionalsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetProfessionalsQuery, GetProfessionalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetProfessionalsQuery, GetProfessionalsQueryVariables>(GetProfessionalsDocument, options);
      }
export function useGetProfessionalsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetProfessionalsQuery, GetProfessionalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetProfessionalsQuery, GetProfessionalsQueryVariables>(GetProfessionalsDocument, options);
        }
export function useGetProfessionalsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetProfessionalsQuery, GetProfessionalsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetProfessionalsQuery, GetProfessionalsQueryVariables>(GetProfessionalsDocument, options);
        }
export type GetProfessionalsQueryHookResult = ReturnType<typeof useGetProfessionalsQuery>;
export type GetProfessionalsLazyQueryHookResult = ReturnType<typeof useGetProfessionalsLazyQuery>;
export type GetProfessionalsSuspenseQueryHookResult = ReturnType<typeof useGetProfessionalsSuspenseQuery>;
export type GetProfessionalsQueryResult = Apollo.QueryResult<GetProfessionalsQuery, GetProfessionalsQueryVariables>;
export const CreateProfessionalDocument = gql`
    mutation CreateProfessional($object: professionals_insert_input!) {
  insert_professionals_one(object: $object) {
    id
    tenant_id
    name
    registration_number
    specialty
    phone
    email
    working_hours
    is_active
    created_at
    updated_at
  }
}
    `;
export type CreateProfessionalMutationFn = Apollo.MutationFunction<CreateProfessionalMutation, CreateProfessionalMutationVariables>;

/**
 * __useCreateProfessionalMutation__
 *
 * To run a mutation, you first call `useCreateProfessionalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProfessionalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProfessionalMutation, { data, loading, error }] = useCreateProfessionalMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateProfessionalMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateProfessionalMutation, CreateProfessionalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateProfessionalMutation, CreateProfessionalMutationVariables>(CreateProfessionalDocument, options);
      }
export type CreateProfessionalMutationHookResult = ReturnType<typeof useCreateProfessionalMutation>;
export type CreateProfessionalMutationResult = Apollo.MutationResult<CreateProfessionalMutation>;
export type CreateProfessionalMutationOptions = Apollo.BaseMutationOptions<CreateProfessionalMutation, CreateProfessionalMutationVariables>;
export const GetMaterialsDocument = gql`
    query GetMaterials {
  materials {
    id
    tenant_id
    category_id
    name
    brand
    description
    unit_type
    min_stock_level
    max_stock_level
    current_stock
    unit_cost
    supplier_name
    supplier_contact
    is_active
    created_at
    updated_at
    category {
      id
      name
      description
    }
  }
}
    `;

/**
 * __useGetMaterialsQuery__
 *
 * To run a query within a React component, call `useGetMaterialsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaterialsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaterialsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMaterialsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetMaterialsQuery, GetMaterialsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMaterialsQuery, GetMaterialsQueryVariables>(GetMaterialsDocument, options);
      }
export function useGetMaterialsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMaterialsQuery, GetMaterialsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMaterialsQuery, GetMaterialsQueryVariables>(GetMaterialsDocument, options);
        }
export function useGetMaterialsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetMaterialsQuery, GetMaterialsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetMaterialsQuery, GetMaterialsQueryVariables>(GetMaterialsDocument, options);
        }
export type GetMaterialsQueryHookResult = ReturnType<typeof useGetMaterialsQuery>;
export type GetMaterialsLazyQueryHookResult = ReturnType<typeof useGetMaterialsLazyQuery>;
export type GetMaterialsSuspenseQueryHookResult = ReturnType<typeof useGetMaterialsSuspenseQuery>;
export type GetMaterialsQueryResult = Apollo.QueryResult<GetMaterialsQuery, GetMaterialsQueryVariables>;
export const CreateMaterialDocument = gql`
    mutation CreateMaterial($object: materials_insert_input!) {
  insert_materials_one(object: $object) {
    id
    tenant_id
    category_id
    name
    brand
    description
    unit_type
    min_stock_level
    max_stock_level
    current_stock
    unit_cost
    supplier_name
    supplier_contact
    is_active
    created_at
    updated_at
    category {
      id
      name
      description
    }
  }
}
    `;
export type CreateMaterialMutationFn = Apollo.MutationFunction<CreateMaterialMutation, CreateMaterialMutationVariables>;

/**
 * __useCreateMaterialMutation__
 *
 * To run a mutation, you first call `useCreateMaterialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMaterialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMaterialMutation, { data, loading, error }] = useCreateMaterialMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateMaterialMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMaterialMutation, CreateMaterialMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateMaterialMutation, CreateMaterialMutationVariables>(CreateMaterialDocument, options);
      }
export type CreateMaterialMutationHookResult = ReturnType<typeof useCreateMaterialMutation>;
export type CreateMaterialMutationResult = Apollo.MutationResult<CreateMaterialMutation>;
export type CreateMaterialMutationOptions = Apollo.BaseMutationOptions<CreateMaterialMutation, CreateMaterialMutationVariables>;
export const GetWaitingListDocument = gql`
    query GetWaitingList {
  waiting_list {
    id
    tenant_id
    patient_id
    professional_id
    preferred_date
    preferred_time_start
    preferred_time_end
    priority
    status
    notes
    created_at
    updated_at
    patient {
      id
      name
      phone
      email
    }
    professional {
      id
      name
      specialty
    }
  }
}
    `;

/**
 * __useGetWaitingListQuery__
 *
 * To run a query within a React component, call `useGetWaitingListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWaitingListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWaitingListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWaitingListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetWaitingListQuery, GetWaitingListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetWaitingListQuery, GetWaitingListQueryVariables>(GetWaitingListDocument, options);
      }
export function useGetWaitingListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetWaitingListQuery, GetWaitingListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetWaitingListQuery, GetWaitingListQueryVariables>(GetWaitingListDocument, options);
        }
export function useGetWaitingListSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetWaitingListQuery, GetWaitingListQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetWaitingListQuery, GetWaitingListQueryVariables>(GetWaitingListDocument, options);
        }
export type GetWaitingListQueryHookResult = ReturnType<typeof useGetWaitingListQuery>;
export type GetWaitingListLazyQueryHookResult = ReturnType<typeof useGetWaitingListLazyQuery>;
export type GetWaitingListSuspenseQueryHookResult = ReturnType<typeof useGetWaitingListSuspenseQuery>;
export type GetWaitingListQueryResult = Apollo.QueryResult<GetWaitingListQuery, GetWaitingListQueryVariables>;
export const GetAnamnesisTemplatesDocument = gql`
    query GetAnamnesisTemplates {
  anamnesis_templates {
    id
    tenant_id
    name
    description
    sections
    is_active
    is_default
    created_by
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetAnamnesisTemplatesQuery__
 *
 * To run a query within a React component, call `useGetAnamnesisTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnamnesisTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnamnesisTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAnamnesisTemplatesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>(GetAnamnesisTemplatesDocument, options);
      }
export function useGetAnamnesisTemplatesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>(GetAnamnesisTemplatesDocument, options);
        }
export function useGetAnamnesisTemplatesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>(GetAnamnesisTemplatesDocument, options);
        }
export type GetAnamnesisTemplatesQueryHookResult = ReturnType<typeof useGetAnamnesisTemplatesQuery>;
export type GetAnamnesisTemplatesLazyQueryHookResult = ReturnType<typeof useGetAnamnesisTemplatesLazyQuery>;
export type GetAnamnesisTemplatesSuspenseQueryHookResult = ReturnType<typeof useGetAnamnesisTemplatesSuspenseQuery>;
export type GetAnamnesisTemplatesQueryResult = Apollo.QueryResult<GetAnamnesisTemplatesQuery, GetAnamnesisTemplatesQueryVariables>;
export const GetAnamnesisFormsDocument = gql`
    query GetAnamnesisForms {
  anamnesis_forms {
    id
    tenant_id
    patient_id
    appointment_id
    template_id
    form_token
    form_data
    status
    alerts_detected
    expires_at
    completed_at
    sent_at
    created_at
    updated_at
    patient {
      id
      name
      phone
      email
    }
    appointment {
      id
      title
      start_datetime
    }
    template {
      id
      name
      description
    }
  }
}
    `;

/**
 * __useGetAnamnesisFormsQuery__
 *
 * To run a query within a React component, call `useGetAnamnesisFormsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAnamnesisFormsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAnamnesisFormsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAnamnesisFormsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>(GetAnamnesisFormsDocument, options);
      }
export function useGetAnamnesisFormsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>(GetAnamnesisFormsDocument, options);
        }
export function useGetAnamnesisFormsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>(GetAnamnesisFormsDocument, options);
        }
export type GetAnamnesisFormsQueryHookResult = ReturnType<typeof useGetAnamnesisFormsQuery>;
export type GetAnamnesisFormsLazyQueryHookResult = ReturnType<typeof useGetAnamnesisFormsLazyQuery>;
export type GetAnamnesisFormsSuspenseQueryHookResult = ReturnType<typeof useGetAnamnesisFormsSuspenseQuery>;
export type GetAnamnesisFormsQueryResult = Apollo.QueryResult<GetAnamnesisFormsQuery, GetAnamnesisFormsQueryVariables>;
export const GetAllTenantsDocument = gql`
    query GetAllTenants {
  tenants {
    id
    name
    subdomain
    logo_url
    primary_color
    secondary_color
    is_active
    plan_id
    subscription_status
    trial_ends_at
    subscription_starts_at
    subscription_ends_at
    billing_email
    billing_address
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetAllTenantsQuery__
 *
 * To run a query within a React component, call `useGetAllTenantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllTenantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllTenantsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllTenantsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAllTenantsQuery, GetAllTenantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAllTenantsQuery, GetAllTenantsQueryVariables>(GetAllTenantsDocument, options);
      }
export function useGetAllTenantsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAllTenantsQuery, GetAllTenantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAllTenantsQuery, GetAllTenantsQueryVariables>(GetAllTenantsDocument, options);
        }
export function useGetAllTenantsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllTenantsQuery, GetAllTenantsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAllTenantsQuery, GetAllTenantsQueryVariables>(GetAllTenantsDocument, options);
        }
export type GetAllTenantsQueryHookResult = ReturnType<typeof useGetAllTenantsQuery>;
export type GetAllTenantsLazyQueryHookResult = ReturnType<typeof useGetAllTenantsLazyQuery>;
export type GetAllTenantsSuspenseQueryHookResult = ReturnType<typeof useGetAllTenantsSuspenseQuery>;
export type GetAllTenantsQueryResult = Apollo.QueryResult<GetAllTenantsQuery, GetAllTenantsQueryVariables>;
export const GetSubscriptionPlansDocument = gql`
    query GetSubscriptionPlans {
  subscription_plans {
    id
    name
    description
    price_monthly
    price_yearly
    max_users
    max_patients
    max_appointments_per_month
    features
    is_active
    is_popular
    sort_order
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetSubscriptionPlansQuery__
 *
 * To run a query within a React component, call `useGetSubscriptionPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubscriptionPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubscriptionPlansQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSubscriptionPlansQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>(GetSubscriptionPlansDocument, options);
      }
export function useGetSubscriptionPlansLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>(GetSubscriptionPlansDocument, options);
        }
export function useGetSubscriptionPlansSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>(GetSubscriptionPlansDocument, options);
        }
export type GetSubscriptionPlansQueryHookResult = ReturnType<typeof useGetSubscriptionPlansQuery>;
export type GetSubscriptionPlansLazyQueryHookResult = ReturnType<typeof useGetSubscriptionPlansLazyQuery>;
export type GetSubscriptionPlansSuspenseQueryHookResult = ReturnType<typeof useGetSubscriptionPlansSuspenseQuery>;
export type GetSubscriptionPlansQueryResult = Apollo.QueryResult<GetSubscriptionPlansQuery, GetSubscriptionPlansQueryVariables>;
export const GetFeatureFlagsDocument = gql`
    query GetFeatureFlags {
  feature_flags {
    id
    key
    name
    description
    category
    is_premium
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetFeatureFlagsQuery__
 *
 * To run a query within a React component, call `useGetFeatureFlagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeatureFlagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeatureFlagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFeatureFlagsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>(GetFeatureFlagsDocument, options);
      }
export function useGetFeatureFlagsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>(GetFeatureFlagsDocument, options);
        }
export function useGetFeatureFlagsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>(GetFeatureFlagsDocument, options);
        }
export type GetFeatureFlagsQueryHookResult = ReturnType<typeof useGetFeatureFlagsQuery>;
export type GetFeatureFlagsLazyQueryHookResult = ReturnType<typeof useGetFeatureFlagsLazyQuery>;
export type GetFeatureFlagsSuspenseQueryHookResult = ReturnType<typeof useGetFeatureFlagsSuspenseQuery>;
export type GetFeatureFlagsQueryResult = Apollo.QueryResult<GetFeatureFlagsQuery, GetFeatureFlagsQueryVariables>;
export const PatientsSubscriptionDocument = gql`
    subscription PatientsSubscription {
  patients {
    id
    tenant_id
    name
    phone
    email
    cpf
    birth_date
    address
    emergency_contact
    medical_history
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __usePatientsSubscriptionSubscription__
 *
 * To run a query within a React component, call `usePatientsSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePatientsSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePatientsSubscriptionSubscription({
 *   variables: {
 *   },
 * });
 */
export function usePatientsSubscriptionSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<PatientsSubscriptionSubscription, PatientsSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<PatientsSubscriptionSubscription, PatientsSubscriptionSubscriptionVariables>(PatientsSubscriptionDocument, options);
      }
export type PatientsSubscriptionSubscriptionHookResult = ReturnType<typeof usePatientsSubscriptionSubscription>;
export type PatientsSubscriptionSubscriptionResult = Apollo.SubscriptionResult<PatientsSubscriptionSubscription>;
export const AppointmentsSubscriptionDocument = gql`
    subscription AppointmentsSubscription {
  appointments {
    id
    tenant_id
    patient_id
    professional_id
    title
    description
    start_datetime
    end_datetime
    status
    service_type
    notes
    created_by
    created_at
    updated_at
    patient {
      id
      name
      phone
      email
    }
    professional {
      id
      name
      specialty
    }
  }
}
    `;

/**
 * __useAppointmentsSubscriptionSubscription__
 *
 * To run a query within a React component, call `useAppointmentsSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAppointmentsSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAppointmentsSubscriptionSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAppointmentsSubscriptionSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<AppointmentsSubscriptionSubscription, AppointmentsSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<AppointmentsSubscriptionSubscription, AppointmentsSubscriptionSubscriptionVariables>(AppointmentsSubscriptionDocument, options);
      }
export type AppointmentsSubscriptionSubscriptionHookResult = ReturnType<typeof useAppointmentsSubscriptionSubscription>;
export type AppointmentsSubscriptionSubscriptionResult = Apollo.SubscriptionResult<AppointmentsSubscriptionSubscription>;