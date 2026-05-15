import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class SearchService {
  constructor(
    private aiService: AiService,
    private profilesService: ProfilesService,
  ) {}

  async search(query: string) {
    const approvedProfiles = await this.profilesService.getAllApproved();

    const profilesForAi = approvedProfiles.map((p) => ({
      userId: p.userId,
      profileId: p.id,
      name: p.user.name,
      summary: p.summary || '',
      location: p.location,
      skills: p.profileSkills.map((ps) => ({
        name: ps.skill.name,
        proficiency: ps.proficiency,
        yearsExperience: ps.yearsExperience,
      })),
      projects: p.projects.map((pr) => ({
        title: pr.title,
        technologies: (pr.technologies as string[]) || [],
      })),
    }));

    const results = await this.aiService.semanticSearch(query, profilesForAi);

    return {
      query,
      results: results.map((r) => ({
        ...r,
        profile: approvedProfiles.find((p) => p.id === r.profileId),
      })),
    };
  }
}
