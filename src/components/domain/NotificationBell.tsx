"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Make sure we have shadcn dropdown installed
import { useState } from "react";
import { markAsRead, markAllAsRead } from "@/lib/actions/notification";
import { useRouter } from "@/navigation";
import { cn } from "@/lib/utils";

interface NotificationType {
    id: string;
    title: string;
    message: string | null;
    link: string | null;
    read: boolean;
    createdAt: Date;
}

interface NotificationBellProps {
    initialNotifications: NotificationType[];
}

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // We rely on Props + Router Refresh for state management
    // Optimistic UI could be added for instant feedback
    const unreadCount = initialNotifications.filter(n => !n.read).length;

    const handleRead = async (id: string, link: string | null) => {
        setOpen(false);
        if (link) router.push(link);
        await markAsRead(id);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground"
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {initialNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {initialNotifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.read && "bg-muted/50"
                                )}
                                onClick={() => handleRead(notification.id, notification.link)}
                            >
                                <div className="font-medium text-sm w-full truncate">
                                    {notification.title}
                                    {!notification.read && (
                                        <span className="ml-2 inline-block h-1.5 w-1.5 bg-primary rounded-full align-middle" />
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1 w-full text-right">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
