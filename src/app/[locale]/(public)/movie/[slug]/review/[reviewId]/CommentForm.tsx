"use client";

import { useTransition } from "react";
import { addReviewComment } from "./actions"; // Import from sibling
import { Button } from "@/components/ui/button";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export function CommentForm({ reviewId }: { reviewId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    // const t = useTranslations("ReviewDiscussion"); // Assuming we'll add this later

    async function action(formData: FormData) {
        startTransition(async () => {
            const result = await addReviewComment(reviewId, formData);
            if (result.error) {
                alert(result.error);
            } else {
                // Reset form?
                // Ideally use useFormStatus but simple reload works for now
                router.refresh();
                // Clear textarea manually if simple
                (document.getElementById("comment-form") as HTMLFormElement)?.reset();
            }
        });
    }

    return (
        <form id="comment-form" action={action} className="space-y-4">
            <textarea
                name="body"
                placeholder="Write a private comment..."
                className="w-full p-3 border border-border rounded-md min-h-[100px] bg-background text-foreground"
                required
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Posting..." : "Post Private Comment"}
                </Button>
            </div>
        </form>
    );
}
