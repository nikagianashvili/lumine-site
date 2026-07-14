import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePage() {
  const session = getSession();
  const queryClient = useQueryClient();
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: api.teamMembers.list });
  const me = teamQuery.data?.find((m) => m.id === session?.user.id);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!me) return;
    const [first = "", ...rest] = (me.name || "").split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
    setRole(me.role);
  }, [me]);

  const profileMutation = useMutation({
    mutationFn: () => api.profile.update({ name: `${firstName} ${lastName}`.trim(), role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setProfileMsg({ text: "Profile updated" });
    },
    onError: (err: Error) => setProfileMsg({ text: err.message, error: true }),
  });

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
    <div className="flex max-w-xl flex-col gap-4 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account, not the whole team's.</p>
      </div>

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
    </div>
  );
}
