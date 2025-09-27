import React from 'react';
import { useForm, FormProvider, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { cn } from '../../../utils/cn';

interface FormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  showCard?: boolean;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  title,
  description,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onCancel,
  isLoading = false,
  className,
  showCard = true,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    }
  };

  const formContent = (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <Text variant="h3" weight="semibold">
                {title}
              </Text>
            )}
            {description && (
              <Text variant="body" color="muted">
                {description}
              </Text>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );

  if (showCard) {
    return (
      <Card className={cn('max-w-2xl mx-auto', className)}>
        {formContent}
      </Card>
    );
  }

  return (
    <div className={className}>
      {formContent}
    </div>
  );
}