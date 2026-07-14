// The "hat" taxonomy (Phase 7) - what a team member is skilled at
// (team_members.skills_tags) and what a task needs (tasks.hat_tags).
// Independent of the single `assignee` - a task can need @web-dev even
// when assigned to someone who's covering it outside their main hat, and
// a bandwidth view groups by hat, not by person.
export const HATS = ["@ai-ops", "@web-dev", "@photo", "@brand-design", "@smm", "@strategy"] as const;

export type Hat = (typeof HATS)[number];
