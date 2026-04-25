import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export function generate2FASecret(username: string) {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(username, 'QR Cafe', secret);
  
  return {
    ascii: secret,
    base32: secret,
    hex: secret,
    otpauth_url: otpauthUrl
  };
}

export async function generateQRCode(otpauthUrl: string) {
  return await QRCode.toDataURL(otpauthUrl);
}

export function verify2FACode(secret: string, token: string) {
  try {
    return authenticator.verify({
      token,
      secret
    });
  } catch {
    return false;
  }
}
