import { ProjectSectionNav, SettingsNav, SidebarNav, type ProjectNavItem } from "./sidebar-nav";
import { SignOut } from "./sign-out";
import { UserProfile } from "./user-profile";
import { Wordmark } from "./wordmark";
import { Badge } from "@/components/ui/badge";
import { QuickSearchButton } from "./quick-search-button";

export function SidebarBody({
  name,
  email,
  projects,
  isPro,
  credits,
  onNavigate,
}: {
  name?: string;
  email?: string;
  projects?: ProjectNavItem[];
  isPro?: boolean;
  credits?: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <SidebarNav onNavigate={onNavigate} />
        <ProjectSectionNav projects={projects} />
        <SettingsNav onNavigate={onNavigate} />
      </div>
      <div className="shrink-0 border-t border-line px-4 py-4">
        <QuickSearchButton />
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <Badge tone={isPro ? "brand" : "neutral"}>{isPro ? "Pro" : "Free"}</Badge>
          <span className="text-xs text-ink-muted">{credits ?? 0} credits</span>
        </div>
        <UserProfile name={name} email={email} />
        <SignOut />
      </div>
    </div>
  );
}

export function Sidebar({
  name,
  email,
  projects,
  isPro,
  credits,
}: {
  name?: string;
  email?: string;
  projects?: ProjectNavItem[];
  isPro?: boolean;
  credits?: number;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
      <div className="px-6 pb-8 pt-7">
        <Wordmark />
      </div>
      <SidebarBody
        name={name}
        email={email}
        projects={projects}
        isPro={isPro}
        credits={credits}
      />
    </aside>
  );
}
