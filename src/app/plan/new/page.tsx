import { PageLayout } from "@/components/common/PageLayout";
import { PlanEntryForm } from "@/components/features/plan/PlanEntryForm";

export const dynamic = "force-dynamic";

export default function NewPlanPage() {
  return (
    <PageLayout title="Add Plan Entry" subtitle="Add a new meal to your plan">
      <PlanEntryForm isEditing={false} />
    </PageLayout>
  );
}
