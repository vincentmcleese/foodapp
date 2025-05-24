import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PageLayout } from "@/components/common/PageLayout";
import { FridgeItemForm } from "@/components/features/fridge/FridgeItemForm";

export const dynamic = "force-dynamic";

interface FridgeItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function FridgeItemPage({ params }: FridgeItemPageProps) {
  // Await params to access id safely
  const { id } = await params;

  // Fetch the fridge item
  const { data: fridgeItem, error } = await supabaseAdmin
    .from("fridge_item")
    .select(
      `
      *,
      ingredient(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching fridge item:", error);
    notFound();
  }

  return (
    <PageLayout
      title="Edit Fridge Item"
      subtitle="Update your fridge inventory"
    >
      <FridgeItemForm fridgeItem={fridgeItem} isEditing={true} />
    </PageLayout>
  );
}
