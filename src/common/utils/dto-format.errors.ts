import { ValidationError } from 'class-validator';

export function formatErrors(errors: ValidationError[]) {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    value: error.value,
  }));
}
