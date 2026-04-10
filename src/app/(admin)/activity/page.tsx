import { getRecentActivities } from "@/actions/activities";
import { ActivityTable } from "@/components/activity/ActivityTable";

export default async function ActivityPage() {
  const activities = await getRecentActivities(100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Activité</h1>
        <p className="text-muted-foreground">Journal de toutes les actions récentes du studio.</p>
      </div>

      <ActivityTable activities={activities} />
    </div>
  );
}
