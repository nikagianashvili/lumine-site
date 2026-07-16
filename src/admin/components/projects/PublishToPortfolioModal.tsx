import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Client, type Engagement } from "@/lib/api";
import { PORTFOLIO_SERVICE_TYPES, INDUSTRIES } from "@/lib/portfolioTaxonomy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PORTFOLIO_SERVICE_IDS = PORTFOLIO_SERVICE_TYPES.map((s) => s.id) as readonly string[];

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Deep, per-service narrative fields (challenge/research/development for
// web, concept for photo-video, brief for design) exist on published
// projects but aren't collected here - this modal covers exactly what was
// asked for (name/client/cover/description/service/industry + a real
// testimonial), not a full case-study editor. The row this creates is a
// real, live entry the founder can enrich further directly once real
// photography/copy exists for it.
function narrativeField(serviceType: string) {
  if (serviceType === "photo-video") return "concept";
  if (serviceType === "design") return "brief";
  return "challenge";
}

export function PublishToPortfolioModal({
  open,
  onOpenChange,
  project,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Engagement;
  client: Client | undefined;
}) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(project.title);
  const [clientName, setClientName] = useState(client?.name || client?.company || "");
  const [serviceType, setServiceType] = useState(
    project.service_type && PORTFOLIO_SERVICE_IDS.includes(project.service_type) ? project.service_type : "",
  );
  const [industry, setIndustry] = useState(project.industry || "");
  const [cover, setCover] = useState(project.cover_image_url || "");
  const [description, setDescription] = useState(project.notes || "");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const baseSlug = slugify(title) || "project";
      let slug = baseSlug;
      let attempt = 0;
      // projects.slug is unique - retry with a numeric suffix on collision
      // rather than failing outright, since two engagements can share a title.
      for (;;) {
        try {
          return await api.portfolio.create({
            slug,
            title: title.trim(),
            client: clientName.trim() || null,
            service_type: serviceType,
            industry,
            year: String(new Date().getFullYear()),
            status: "Delivered",
            featured: false,
            content: {
              blurb: description.trim(),
              status_ka: "დასრულებული",
              cover: cover.trim() || undefined,
              // Every template's phase/gallery sections index straight into
              // these fields with no fallback (see js/project.js) - the
              // existing seed data always had every field for its type, so
              // nothing there ever needed to guard against a missing one.
              // Reusing one write-up across every narrative slot and
              // defaulting every array/testimonial the *other* two
              // templates need (harmless extra jsonb keys) means this never
              // renders "undefined" text or throws on .map()/.quote,
              // whichever service type gets picked.
              [narrativeField(serviceType)]: description.trim(),
              research: description.trim(),
              development: description.trim(),
              wireframesImage: cover.trim() || undefined,
              uiImage: cover.trim() || undefined,
              results: [],
              technologies: [],
              gallery: [],
              behindTheScenes: [],
              galleryImages: [],
              moodboardImages: [],
              deliverablesImages: [],
              testimonial: { quote: quote.trim(), author: author.trim() },
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("duplicate key") && message.includes("slug")) {
            attempt += 1;
            slug = `${baseSlug}-${attempt + 1}`;
            continue;
          }
          throw err;
        }
      }
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      setPublishedSlug(created.slug);
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give it a title");
      return;
    }
    if (!serviceType) {
      setError("Pick a portfolio service — the public site only shows Web, Photo & Video, or Design case studies");
      return;
    }
    if (!industry) {
      setError("Pick an industry");
      return;
    }
    setError(null);
    mutation.mutate();
  }

  function handleClose(next: boolean) {
    if (!next) setPublishedSlug(null);
    onOpenChange(next);
  }

  if (publishedSlug) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent open={open}>
          <DialogHeader>
            <DialogTitle>Published</DialogTitle>
            <DialogDescription>
              Live on the site now at <span className="font-mono">/project.html?slug={publishedSlug}</span>. Deeper
              narrative sections (results, gallery, full case-study copy) are still blank — add those directly
              whenever the real photography and copy are ready.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent open={open}>
        <DialogHeader>
          <DialogTitle>Publish to Portfolio</DialogTitle>
          <DialogDescription>Creates a real, live case study on the public site.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pub-title">Title</Label>
              <Input id="pub-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pub-client">Client name</Label>
              <Input id="pub-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Service</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {PORTFOLIO_SERVICE_TYPES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pub-cover">Cover image URL</Label>
            <Input id="pub-cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pub-description">Description</Label>
            <Textarea
              id="pub-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What this project was and what it delivered — shows on the work grid and the case-study page."
            />
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              In the client's own words (optional)
            </p>
            <div className="flex flex-col gap-3">
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={2}
                placeholder="A real quote from the client — becomes the testimonial on their case study."
              />
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={'Who said it — e.g. "Kera Hotel, Owner"'}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Publishing…" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
