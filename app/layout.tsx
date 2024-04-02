import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Star Sailors',
    // description: 'By Talonova Aerospace',
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
    }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
};