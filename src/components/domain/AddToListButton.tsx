"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListPlus, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getUserLists, addMovieToList, createList } from "@/lib/actions/list";
import { useSession } from "next-auth/react"; // or custom auth hook
// Actually I don't set up SessionProvider usually. I'll pass userId or just fail gracefully.
// I'll rely on server action auth check.

interface AddToListButtonProps {
    movieId: string;
}

export function AddToListButton({ movieId }: AddToListButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [lists, setLists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const loadLists = async () => {
        setIsLoading(true);
        try {
            // We need a wrapper action that doesn't require ID if we rely on session
            // But getUserLists requires ID.
            // I'll update getUserLists to be session-aware or create a wrapper.
            // Actually I'll just check if I can get session here.
            // For now, I'll fetch lists via a new action `getMyLists` that infers ID from session.
            const data = await getMyListsClient();
            setLists(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (listId: string) => {
        startTransition(async () => {
            const result = await addMovieToList(listId, movieId);
            if (result.success) {
                // Toast success
                const newList = lists.map(l => l.id === listId ? { ...l, added: true } : l);
                setLists(newList); // Optimistic-ish capability if I tracked it
                alert("Added to list!");
            } else {
                alert(result.error);
            }
        });
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) loadLists();
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Add to List">
                    <ListPlus className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Add to List...</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoading ? (
                    <div className="p-2 text-xs text-center text-muted-foreground">Loading...</div>
                ) : lists.length === 0 ? (
                    <div className="p-2 text-xs text-center text-muted-foreground">No lists found.</div>
                ) : (
                    lists.map((list) => (
                        <DropdownMenuItem key={list.id} onClick={() => handleAdd(list.id)}>
                            <span className="truncate flex-1">{list.title}</span>
                            {/* We don't verify if already in list efficiently yet, simplified for MVP */}
                        </DropdownMenuItem>
                    ))
                )}
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>+ Create New List</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Temporary client-side action wrapper to avoid passing UserID from props
import { getMyLists } from "@/lib/actions/list"; // I need to export this
const getMyListsClient = getMyLists; 
