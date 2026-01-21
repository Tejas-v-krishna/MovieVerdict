import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return <OnboardingFlow />;
}
