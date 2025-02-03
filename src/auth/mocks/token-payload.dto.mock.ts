import { TokenPayloadDto } from '../dto/token-payload.dto';

export function generateTokenPayloadDtoMock(): TokenPayloadDto {
  return {
    sub: '42-d-f-df4',
    username: 'jDoe453',
    iat: 123456,
    exp: 123456,
    aud: '42-d-f-df4',
    iss: '42-d-f-df4',
  };
}
