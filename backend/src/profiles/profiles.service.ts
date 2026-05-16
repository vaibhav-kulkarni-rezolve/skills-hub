import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { profiles, skills, profileSkills, projects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AiService, ExtractedProfile } from '../ai/ai.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

// Never send the raw binary back over the wire
const WITHOUT_FILE_DATA = { fileData: false } as const;

@Injectable()
export class ProfilesService {
  constructor(private aiService: AiService) {}

  async uploadAndExtract(userId: string, file: Express.Multer.File) {
    const pdfData = await pdfParse(file.buffer);

    const [profile] = await db
      .insert(profiles)
      .values({ userId, fileData: file.buffer, rawText: pdfData.text, status: 'pending' })
      .returning({ id: profiles.id, userId: profiles.userId, status: profiles.status, createdAt: profiles.createdAt, updatedAt: profiles.updatedAt });

    this.extractAndSave(profile.id, pdfData.text).catch(console.error);

    return profile;
  }

  private async extractAndSave(profileId: string, rawText: string) {
    const extracted = await this.aiService.extractProfile(rawText);
    await this.saveExtractedProfile(profileId, extracted);
  }

  async saveExtractedProfile(profileId: string, extracted: ExtractedProfile) {
    await db
      .update(profiles)
      .set({ summary: extracted.summary, location: extracted.location, yearsTotal: extracted.yearsTotal, updatedAt: new Date() })
      .where(eq(profiles.id, profileId));

    for (const skill of extracted.skills) {
      const normalized = skill.name.toLowerCase().trim();
      let [existingSkill] = await db.select().from(skills).where(eq(skills.normalizedName, normalized));

      if (!existingSkill) {
        [existingSkill] = await db
          .insert(skills)
          .values({ name: skill.name, normalizedName: normalized, category: skill.category })
          .returning();
      }

      await db
        .insert(profileSkills)
        .values({
          profileId,
          skillId: existingSkill.id,
          proficiency: skill.proficiency,
          yearsExperience: skill.yearsExperience,
          inferred: skill.inferred,
          inferenceConfidence: skill.inferenceConfidence,
        })
        .onConflictDoNothing();
    }

    for (const project of extracted.projects) {
      await db.insert(projects).values({
        profileId,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        startDate: project.startDate,
        endDate: project.endDate,
      });
    }
  }

  async getProfile(profileId: string) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
      columns: WITHOUT_FILE_DATA,
      with: { user: true, profileSkills: { with: { skill: true } }, projects: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getProfileByUserId(userId: string) {
    return db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
      columns: WITHOUT_FILE_DATA,
      with: { user: true, profileSkills: { with: { skill: true } }, projects: true },
    });
  }

  async getPendingQueue() {
    return db.query.profiles.findMany({
      where: eq(profiles.status, 'pending'),
      columns: WITHOUT_FILE_DATA,
      with: { user: true, profileSkills: { with: { skill: true } }, projects: true },
    });
  }

  async updateStatus(profileId: string, status: 'approved' | 'rejected') {
    const [updated] = await db
      .update(profiles)
      .set({ status, updatedAt: new Date() })
      .where(eq(profiles.id, profileId))
      .returning({ id: profiles.id, status: profiles.status, updatedAt: profiles.updatedAt });
    if (!updated) throw new NotFoundException('Profile not found');
    return updated;
  }

  async getAllApproved() {
    return db.query.profiles.findMany({
      where: eq(profiles.status, 'approved'),
      columns: WITHOUT_FILE_DATA,
      with: { user: true, profileSkills: { with: { skill: true } }, projects: true },
    });
  }
}
