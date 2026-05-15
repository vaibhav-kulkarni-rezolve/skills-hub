import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  async findAll() {
    return db.query.users.findMany({
      with: { profile: true },
    });
  }

  async findOne(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        profile: {
          with: { profileSkills: { with: { skill: true } }, projects: true },
        },
      },
    });
  }
}
