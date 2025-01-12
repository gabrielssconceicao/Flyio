export enum DtoErrorType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  IS_EMAIL = 'isEmail',
  IS_STRING = 'isString',
}

export function dtoErrorMessages(
  field: string,
  type: DtoErrorType,
  value?: number,
): string {
  const messages: Record<DtoErrorType, string> = {
    [DtoErrorType.REQUIRED]: `${field} is required`,
    [DtoErrorType.MIN_LENGTH]: `${field} must be at least ${value} characters long`,
    [DtoErrorType.MAX_LENGTH]: `${field} must be at most ${value} characters long`,
    [DtoErrorType.IS_EMAIL]: `${field} must be a valid email address`,
    [DtoErrorType.IS_STRING]: `${field} must be a string`,
  };

  return messages[type];
}
