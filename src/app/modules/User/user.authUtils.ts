import jwt from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { email: string; username: string, is_staff: boolean, is_superuser: boolean },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};
