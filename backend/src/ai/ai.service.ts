import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

export interface ExtractedSkill {
  name: string;
  category: 'language' | 'framework' | 'platform' | 'tool' | 'domain';
  proficiency: 'novice' | 'intermediate' | 'expert';
  yearsExperience: number | null;
  inferred: boolean;
  inferenceConfidence?: number;
}

export interface ExtractedProfile {
  name: string;
  location: string | null;
  summary: string;
  yearsTotal: number | null;
  skills: ExtractedSkill[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
  }>;
}

export interface SearchResult {
  userId: string;
  profileId: string;
  matchScore: number;
  reasoning: string;
  highlights: string[];
}

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async extractProfile(resumeText: string): Promise<ExtractedProfile> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a resume parser. Extract structured profile data and return valid JSON only.',
        },
        {
          role: 'user',
          content: `Extract structured profile data from this resume. Return valid JSON matching the schema exactly.

Schema:
{
  "name": string,
  "location": string | null,
  "summary": string (2-3 sentence professional summary),
  "yearsTotal": number | null (total years of experience),
  "skills": [{
    "name": string,
    "category": "language" | "framework" | "platform" | "tool" | "domain",
    "proficiency": "novice" | "intermediate" | "expert",
    "yearsExperience": number | null,
    "inferred": false
  }],
  "inferredSkills": [{
    "name": string,
    "category": "language" | "framework" | "platform" | "tool" | "domain",
    "proficiency": "novice" | "intermediate" | "expert",
    "yearsExperience": number | null,
    "inferred": true,
    "inferenceConfidence": number (0.0-1.0),
    "inferredFrom": string (what skill implies this)
  }],
  "projects": [{
    "title": string,
    "description": string,
    "technologies": string[],
    "startDate": string | null,
    "endDate": string | null
  }]
}

Proficiency guide: novice = <1yr or basic exposure, intermediate = 1-3yrs or solid usage, expert = 3+yrs or led projects with it.
For inferred skills: if someone has Next.js → infer React; TypeScript → infer JavaScript; Spring Boot → infer Java + Spring; etc.

Resume text:
${resumeText}`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(text) as {
      name: string;
      location: string | null;
      summary: string;
      yearsTotal: number | null;
      skills: ExtractedSkill[];
      inferredSkills: ExtractedSkill[];
      projects: Array<{
        title: string;
        description: string;
        technologies: string[];
        startDate?: string;
        endDate?: string;
      }>;
    };

    const allSkills = [
      ...(parsed.skills || []).map((s) => ({ ...s, inferred: false as const })),
      ...(parsed.inferredSkills || []).map((s) => ({ ...s, inferred: true as const })),
    ];

    return {
      name: parsed.name,
      location: parsed.location,
      summary: parsed.summary,
      yearsTotal: parsed.yearsTotal,
      skills: allSkills,
      projects: parsed.projects || [],
    };
  }

  async semanticSearch(
    query: string,
    profiles: Array<{
      userId: string;
      profileId: string;
      name: string;
      summary: string;
      location: string | null;
      skills: Array<{ name: string; proficiency: string; yearsExperience: number | null }>;
      projects: Array<{ title: string; technologies: string[] }>;
    }>,
  ): Promise<SearchResult[]> {
    const profileSummaries = profiles
      .map(
        (p, i) =>
          `[${i}] ${p.name} (${p.location || 'Location unknown'})
Summary: ${p.summary}
Skills: ${p.skills.map((s) => `${s.name} (${s.proficiency}${s.yearsExperience ? `, ${s.yearsExperience}yr` : ''})`).join(', ')}
Projects: ${p.projects.map((pr) => `${pr.title}: ${pr.technologies.join(', ')}`).join(' | ')}`,
      )
      .join('\n\n');

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a talent matching system. Return ranked employee matches as JSON.',
        },
        {
          role: 'user',
          content: `Given an HR query and employee profiles, return ranked matches.

HR Query: "${query}"

Employee Profiles:
${profileSummaries}

Return JSON with a "results" array (ranked best to worst, include only relevant matches):
{
  "results": [{
    "index": number (profile index from above),
    "matchScore": number (0-100),
    "reasoning": string (one clear sentence explaining why this person matches),
    "highlights": string[] (2-3 specific matching points)
  }]
}

Only include profiles with matchScore >= 40. Be precise about years of experience and skills.`,
        },
      ],
    });

    const text = completion.choices[0].message.content ?? '{"results":[]}';
    const parsed = JSON.parse(text) as {
      results: Array<{
        index: number;
        matchScore: number;
        reasoning: string;
        highlights: string[];
      }>;
    };

    return (parsed.results || []).map((r) => ({
      userId: profiles[r.index].userId,
      profileId: profiles[r.index].profileId,
      matchScore: r.matchScore,
      reasoning: r.reasoning,
      highlights: r.highlights,
    }));
  }
}
