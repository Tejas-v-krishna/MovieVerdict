import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
    let dbStatus = "Checking...";
    let dbError = null;
    let envCheck = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Missing",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
        TMDB_API_KEY: process.env.TMDB_API_KEY ? "Set" : "Missing",
        DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing",
    };

    try {
        await prisma.user.count();
        dbStatus = "Connected ✅";
    } catch (e: any) {
        dbStatus = "Failed ❌";
        dbError = e.message;
        console.error("Health Check DB Error:", e);
    }

    return (
        <div className="p-10 font-mono space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold">System Health Check</h1>

            <div className="p-4 border rounded bg-slate-50">
                <h2 className="font-bold mb-2">Database Connection</h2>
                <div className="text-lg">{dbStatus}</div>
                {dbError && (
                    <pre className="mt-2 p-2 bg-red-100 text-red-800 text-xs overflow-auto rounded">
                        {dbError}
                    </pre>
                )}
            </div>

            <div className="p-4 border rounded bg-slate-50">
                <h2 className="font-bold mb-2">Environment Variables</h2>
                <ul className="space-y-1 text-sm">
                    {Object.entries(envCheck).map(([key, status]) => (
                        <li key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className={status === "Set" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                {status}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-xs text-muted-foreground mt-8">
                Time: {new Date().toISOString()}
            </div>
        </div>
    );
}
