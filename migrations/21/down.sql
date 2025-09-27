
-- Remove default templates and keywords that were added
DELETE FROM anamnesis_keywords WHERE keyword IN (
  'grávida', 'gestante', 'amamentando', 'lactante', 'anticoagulante', 
  'diabetes', 'hipertensão', 'quelóide', 'alergia anestésico', 'marcapasso', 
  'epilepsia', 'isotretinoína', 'roacutan', 'herpes', 'câncer'
);

DELETE FROM anamnesis_templates WHERE name = 'Anamnese Estética Completa';
