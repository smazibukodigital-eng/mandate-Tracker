export interface Skill {
  name: string;
  level: number;
  xp: number;
  color: string;
}

export const INITIAL_SKILLS: Skill[] = [
  { name: 'Empire', level: 1, xp: 0, color: '#3b82f6' }, // Agency / Trading
  { name: 'Vitality', level: 1, xp: 0, color: '#ef4444' }, // Fitness
  { name: 'Intel', level: 1, xp: 0, color: '#f59e0b' }, // UNISA / Reading
  { name: 'Articulation', level: 1, xp: 0, color: '#8b5cf6' }, // Writing / Memo
  { name: 'Spirit', level: 1, xp: 0, color: '#10b981' } // Reviewing Mandate / Discipline
];

export const XP_PER_LEVEL = 100;

export function calculateLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpForCurrentLevel(xp: number) {
  return xp % XP_PER_LEVEL;
}

export function getSkillForMission(missionTitle: string): string {
  const title = missionTitle.toLowerCase();
  if (title.includes('agency') || title.includes('trading')) return 'Empire';
  if (title.includes('fitness')) return 'Vitality';
  if (title.includes('unisa') || title.includes('intel')) return 'Intel';
  if (title.includes('articulation') || title.includes('newsletter')) return 'Articulation';
  return 'Spirit';
}
