import 'vue'
import '@vuelidate/core'

declare module 'vue' {
  // ... (previous Vue declarations remain the same)
}

declare module '@vuelidate/core' {
  export interface ValidationRule {
    $validator: (value: any) => boolean | Promise<boolean>
    $message?: string | (() => string)
    $params?: Record<string, any>
  }

  export interface ValidationRules {
    [key: string]: ValidationRule | ValidationRules
  }

  export interface ValidationErrors {
    $message: string
    $params: Record<string, any>
    $pending: boolean
    $property: string
  }

  export interface ValidationState {
    $model: any
    $dirty: boolean
    $error: boolean
    $invalid: boolean
    $pending: boolean
    $params: Record<string, any>
    $touch(): void
    $reset(): void
    $errors: ValidationErrors[]
    $silentErrors: ValidationErrors[]
    $value: any
  }

  export type Validation = ValidationState & {
    value: ValidationState
    [key: string]: any
  }

  export function useVuelidate(
    rules: ValidationRules,
    state: Record<string, any>,
    options?: {
      $lazy?: boolean
      $autoDirty?: boolean
      $scope?: string | number | symbol
    }
  ): Validation

  export const required: ValidationRule
  export const minValue: (min: number) => ValidationRule
  export const maxValue: (max: number) => ValidationRule
  export const minLength: (min: number) => ValidationRule
  export const maxLength: (max: number) => ValidationRule
  export const email: ValidationRule
  export const helpers: {
    withMessage: (
      message: string | (() => string),
      validator: ValidationRule
    ) => ValidationRule
  }
}
