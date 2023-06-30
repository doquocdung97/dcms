export class Config {
  static readonly PRODUCTION: boolean = false;
  static readonly PORT = process.env.API_PORT || 5000;
  static readonly CACHE_MAXAGE = process.env.CACHE_MAXAGE || 6000;
  static readonly TOKEN_KEY = process.env.TOKEN_KEY || String('security_key');
  static readonly TOKEN_ACCESS = 'x-access-token'
}