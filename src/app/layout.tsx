import { ReactNode } from "react";

// Since we have a root `[locale]` layout, this root layout
// just passes through to it (via middleware match).
// However, Next.js needs a root layout file.
export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
