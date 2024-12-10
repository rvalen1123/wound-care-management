import { ValidationArgs } from '@vuelidate/core';

declare module '@vuelidate/core' {
  export interface ValidationState {
    $validate(): Promise<boolean>;
    $errors: Array<{
      $message: string;
      $params: Record<string, unknown>;
      $property: string;
      $propertyPath: string;
      $validator: string;
    }>;
    $error: boolean;
    $invalid: boolean;
    $pending: boolean;
    $dirty: boolean;
    $touch(): void;
    $reset(): void;
    $model: unknown;
  }

  export interface ValidationArgs {
    $model: unknown;
    $dirty: boolean;
    $error: boolean;
    $invalid: boolean;
    $pending: boolean;
    $touch(): void;
    $reset(): void;
  }
}
