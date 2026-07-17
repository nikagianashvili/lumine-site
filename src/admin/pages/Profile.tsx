import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { api, type TeamMember } from "@/lib/api";
import { getSession } from "@/lib/session";
import { HATS } from "@/lib/hats";
import { TEAM_STATUSES } from "@/lib/teamStatus";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STAGGER_CONTAINER = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const STAGGER_ITEM = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } } };

export function ProfilePage() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const me = teamQuery.data?.find((m) => m.id === session?.user.id);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!me) return;
    const [first = "", ...rest] = (me.name || "").split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
    setRole(me.role);
    setSkillsTags(me.skills_tags ?? []);
  }, [me]);

  const profileMutation = useMutation({
    mutationFn: () => api.profile.update({ name: `${firstName} ${lastName}`.trim(), role, skills_tags: skillsTags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setProfileMsg({ text: "Profile updated" });
    },
    onError: (err: Error) => setProfileMsg({ text: err.message, error: true }),
  });

  const statusMutation = useMutation({
    mutationFn: (updates: { status?: string; focus_mode?: boolean }) => api.profile.update(updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });

  function toggleSkill(hat: string) {
    setSkillsTags((tags) => (tags.includes(hat) ? tags.filter((h) => h !== hat) : [...tags, hat]));
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const passwordMutation = useMutation({
    mutationFn: () => api.profile.update({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwError(null);
      setPwSuccess(true);
    },
    onError: (err: Error) => {
      setPwSuccess(false);
      setPwError(err.message);
    },
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password needs at least 8 characters.");
      return;
    }
    setPwError(null);
    passwordMutation.mutate();
  }

  if (teamQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account, not the whole team's.</p>
      </div>

      <motion.div
        className="flex flex-col gap-4"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={STAGGER_CONTAINER}
      >
      <motion.div variants={STAGGER_ITEM}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How your name shows up across the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setProfileMsg(null);
              profileMutation.mutate();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              {/* read-only: the API doesn't support changing auth email from
                  this endpoint, so an editable field here would silently do
                  nothing on save - not carrying that gap forward */}
              <Input id="profile-email" value={session?.user.email ?? ""} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Hats (what you're skilled at)</Label>
              <div className="flex flex-wrap gap-1.5">
                {HATS.map((hat) => (
                  <button
                    key={hat}
                    type="button"
                    onClick={() => toggleSkill(hat)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      skillsTags.includes(hat)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {hat}
                  </button>
                ))}
              </div>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.error ? "text-destructive" : "text-success"}`}>{profileMsg.text}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Shown as a dot next to your avatar wherever it appears.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Right now</Label>
            <Select value={me?.status ?? "Available"} onValueChange={(v) => statusMutation.mutate({ status: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Focus Mode</Label>
            <button
              type="button"
              onClick={() => statusMutation.mutate({ focus_mode: !me?.focus_mode })}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
                me?.focus_mode ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground",
              )}
            >
              <span className={cn("size-2 rounded-full", me?.focus_mode ? "bg-primary" : "bg-muted-foreground")} />
              {me?.focus_mode ? "On — avatar greyed" : "Off"}
            </button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password. You'll need your current one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pw-current">Current password</Label>
              <Input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pw-new">New password</Label>
                <Input
                  id="pw-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pw-confirm">Confirm new password</Label>
                <Input
                  id="pw-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-success">Password changed</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? "Changing…" : "Change password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div variants={STAGGER_ITEM}>
        <TeamCard team={teamQuery.data ?? []} myId={session?.user.id} />
      </motion.div>
      </motion.div>
    </div>
  );
}

function TeamCard({ team, myId }: { team: TeamMember[]; myId: string | undefined }) {
  const queryClient = useQueryClient();
  const accessMutation = useMutation({
    mutationFn: ({ id, access_level }: { id: string; access_level: string }) =>
      api.teamMembers.update(id, { access_level }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          Access level doesn't restrict anything yet — everyone has full access while the team's this size. It's here
          so it's ready when that changes.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-1 px-5 pb-5">
        {team.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
            <span className="flex-1 truncate font-medium">
              {m.name || "Unnamed"}
              {m.id === myId && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
            </span>
            <span className="w-28 truncate text-xs text-muted-foreground">{m.role}</span>
            <span className="w-40 truncate text-xs text-muted-foreground">
              {(m.skills_tags ?? []).join(" ") || "No hats set"}
            </span>
            <Select
              value={m.access_level ?? "admin"}
              onValueChange={(v) => accessMutation.mutate({ id: m.id, access_level: v })}
            >
              <SelectTrigger className="h-7 w-36 border-none bg-transparent px-2 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Team Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </Card>
  );
}
