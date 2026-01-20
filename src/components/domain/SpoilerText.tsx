"use client";

import { useState } from "react";

interface SpoilerTextProps {
    content: string;
}

export function SpoilerText({ content }: SpoilerTextProps) {
    const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

    // Parse spoilers and regular text
    const parts: Array<{ type: "text" | "spoiler"; content: string; index?: number }> = [];
    const spoilerRegex = /\[SPOILER\](.*?)\[\/SPOILER\]/gs;

    let lastIndex = 0;
    let match;
    let spoilerIndex = 0;

    while ((match = spoilerRegex.exec(content)) !== null) {
        // Add text before spoiler
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
        }

        // Add spoiler
        parts.push({ type: "spoiler", content: match[1], index: spoilerIndex });
        spoilerIndex++;
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push({ type: "text", content: content.slice(lastIndex) });
    }

    const toggleSpoiler = (index: number) => {
        setRevealedSpoilers((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    return (
        <div className="whitespace-pre-wrap">
            {parts.map((part, idx) => {
                if (part.type === "text") {
                    return <span key={idx}>{part.content}</span>;
                }

                const isRevealed = revealedSpoilers.has(part.index!);

                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSpoiler(part.index!)}
                        className={`inline-block px-2 py-1 mx-1 rounded transition ${isRevealed
                                ? "bg-muted text-foreground"
                                : "bg-black text-black hover:bg-gray-800 hover:text-gray-200 cursor-pointer"
                            }`}
                        title={isRevealed ? "Click to hide spoiler" : "Click to reveal spoiler"}
                    >
                        {isRevealed ? part.content : "SPOILER"}
                    </button>
                );
            })}
        </div>
    );
}
