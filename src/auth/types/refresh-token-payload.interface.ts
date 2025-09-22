export interface IRefreshTokenPayload {
  sub: string;
  jti: string; // JWT ID untuk tracking
  type: 'refresh';
}
