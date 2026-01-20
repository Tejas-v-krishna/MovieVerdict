"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { createList } from "@/lib/actions/list";
import { Input } from "@/components/ui/input"; // Need Input
import { Textarea } from "@/components/ui/textarea"; // Need Textarea
import { useRouter } from "@/navigation";

// Imports already present or need to be added?
// I commented them out or didn't add them. I should ensure they are imported.


export function CreateListButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        startTransition(async () => {
            const result = await createList(title, desc, isPublic);
            if (result.success) {
                setIsExpanded(false);
                setTitle("");
                setDesc("");
                router.refresh(); // Update the list
            } else {
                alert("Failed to create list");
            }
        });
    };

    if (!isExpanded) {
        return (
            <Button onClick={() => setIsExpanded(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New List
            </Button>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-card space-y-4 mb-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Create New List</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                        placeholder="e.g. Cyberpunk Essentials"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        value={desc}
                        onChange={(e: any) => setDesc(e.target.value)}
                        placeholder="What's this list about?"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isPublic" className="text-sm">Publicly visible</label>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsExpanded(false)}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creating..." : "Create List"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
