export class TokenPayloadDto {
  sub: string;
  username: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
