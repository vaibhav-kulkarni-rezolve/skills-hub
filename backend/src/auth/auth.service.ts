import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  async register(email: string, password: string, name: string, role: 'hr' | 'employee' = 'employee') {
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const [user] = await db.insert(users).values({ email, name, passwordHash, role }).returning();
    return this.createSession(user.id);
  }

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) throw new UnauthorizedException('Invalid credentials');

    return this.createSession(user.id);
  }

  async createSession(userId: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.insert(sessions).values({ userId, token, expiresAt });

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    return { token, user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role } };
  }

  async validateToken(token: string) {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  }

  async logout(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}
