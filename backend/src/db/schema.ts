import { pgTable, uuid, text, timestamp, pgEnum, integer, boolean, jsonb, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['hr', 'employee']);
export const profileStatusEnum = pgEnum('profile_status', ['pending', 'approved', 'rejected']);
export const skillCategoryEnum = pgEnum('skill_category', ['language', 'framework', 'platform', 'tool', 'domain']);
export const proficiencyEnum = pgEnum('proficiency', ['novice', 'intermediate', 'expert']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('employee'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: profileStatusEnum('status').notNull().default('pending'),
  fileKey: text('file_key'),
  rawText: text('raw_text'),
  summary: text('summary'),
  location: text('location'),
  yearsTotal: real('years_total'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  normalizedName: text('normalized_name').notNull().unique(),
  category: skillCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profileSkills = pgTable('profile_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  skillId: uuid('skill_id').references(() => skills.id).notNull(),
  proficiency: proficiencyEnum('proficiency').notNull().default('intermediate'),
  yearsExperience: integer('years_experience'),
  inferred: boolean('inferred').notNull().default(false),
  inferenceConfidence: real('inference_confidence'),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  technologies: jsonb('technologies').$type<string[]>().default([]),
  startDate: text('start_date'),
  endDate: text('end_date'),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  sessions: many(sessions),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  profileSkills: many(profileSkills),
  projects: many(projects),
}));

export const profileSkillsRelations = relations(profileSkills, ({ one }) => ({
  profile: one(profiles, { fields: [profileSkills.profileId], references: [profiles.id] }),
  skill: one(skills, { fields: [profileSkills.skillId], references: [skills.id] }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  profile: one(profiles, { fields: [projects.profileId], references: [profiles.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
