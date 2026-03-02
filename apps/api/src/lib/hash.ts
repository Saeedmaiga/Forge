import argon2 from 'argon2';

export async function hashPassword(password: string) {
    return await argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
    return await argon2.verify(hash, password);
}

export async function hashToken(token: string) {
    return argon2.hash(token);
  }
  
  export async function verifyTokenHash(token: string, hash: string) {
    return argon2.verify(hash, token);
  }

  