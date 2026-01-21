"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveOnboardingPreferences, completeOnboarding } from "@/app/[locale]/onboarding/actions";

// --- Types ---
type OnboardingData = {
    user_intent: string[];
    watch_mode: string;
    watch_frequency: string;
    preferred_genres: string[];
    taste_factors: string[];
    preferred_industries: string[];
    preferred_languages: string[];
    review_style_preferences: string[];
    spoiler_tolerance: string;
};

const INITIAL_DATA: OnboardingData = {
    user_intent: [],
    watch_mode: "",
    watch_frequency: "",
    preferred_genres: [],
    taste_factors: [],
    preferred_industries: [],
    preferred_languages: [],
    review_style_preferences: [],
    spoiler_tolerance: "",
};

// --- Step Components ---

const StepHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground text-lg">{subtitle}</p>
    </div>
);

const MultiSelect = ({
    options,
    selected,
    onChange,
}: {
    options: string[];
    selected: string[];
    onChange: (value: string[]) => void;
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
                <button
                    key={option}
                    onClick={() => {
                        if (isSelected) {
                            onChange(selected.filter((item) => item !== option));
                        } else {
                            onChange([...selected, option]);
                        }
                    }}
                    className={cn(
                        "p-4 rounded-xl border text-left transition-all duration-200",
                        isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                >
                    {option}
                </button>
            );
        })}
    </div>
);

const SingleSelect = ({
    options,
    selected,
    onChange,
}: {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}) => (
    <div className="space-y-3">
        {options.map((option) => {
            const isSelected = selected === option;
            return (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-200",
                        isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                >
                    {option}
                </button>
            );
        })}
    </div>
);

// --- Main Component ---

export function OnboardingFlow() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);

    const totalSteps = 6;

    const saveData = async (newData: OnboardingData) => {
        // Persist incrementally
        await saveOnboardingPreferences(newData);
    };

    const nextStep = async () => {
        setLoading(true);
        await saveData(data);
        setStep((prev) => prev + 1);
        setLoading(false);
    };

    const handleComplete = async () => {
        setLoading(true);
        await saveData(data); // one last save
        await completeOnboarding();
        // Server action redirects, so we don't need to unset loading really
    };

    const skipStep = async () => {
        setLoading(true);
        // Persist current state even if incomplete for that step? Or just move on.
        // Prompt says "skip for now", imply just don't validate and move on.
        await saveData(data);
        setStep((prev) => prev + 1);
        setLoading(false);
    };

    // --- Steps Content ---

    const renderStep = () => {
        switch (step) {
            case 1: // Intent
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <StepHeader
                            title="What brings you here?"
                            subtitle="Help us understand your goals."
                        />
                        <MultiSelect
                            options={[
                                "Decide if a movie is worth watching",
                                "Avoid wasting time on bad movies",
                                "Discover genuinely good films",
                                "Read thoughtful reviews",
                                "Follow reviewers I can trust",
                                "Explore curated movie lists",
                            ]}
                            selected={data.user_intent}
                            onChange={(vals) => setData({ ...data, user_intent: vals })}
                        />
                    </motion.div>
                );
            case 2: // Watching Habits
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <StepHeader
                            title="Watching Habits"
                            subtitle="How do you consume movies?"
                        />
                        <div className="space-y-4">
                            <h3 className="font-semibold">How do you usually watch movies?</h3>
                            <SingleSelect
                                options={["In theatres", "At home (streaming)", "Both"]}
                                selected={data.watch_mode}
                                onChange={(val) => setData({ ...data, watch_mode: val })}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold">How often do you watch movies?</h3>
                            <SingleSelect
                                options={["Rarely (1–2 per month)", "Occasionally (3–6 per month)", "Often (weekly)", "Very often (multiple times a week)"]}
                                selected={data.watch_frequency}
                                onChange={(val) => setData({ ...data, watch_frequency: val })}
                            />
                        </div>
                    </motion.div>
                );
            case 3: // Taste & Style
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <StepHeader
                            title="Taste & Style"
                            subtitle="What do you enjoy?"
                        />
                        <div className="space-y-4">
                            <h3 className="font-semibold">Genres you enjoy</h3>
                            <MultiSelect
                                options={["Drama", "Thriller", "Crime", "Romance", "Action", "Sci-Fi", "Fantasy", "Horror", "Comedy", "Animation", "Documentary", "Indie / Experimental"]}
                                selected={data.preferred_genres}
                                onChange={(vals) => setData({ ...data, preferred_genres: vals })}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold">What matters most?</h3>
                            <MultiSelect
                                options={["Writing & story", "Acting performances", "Direction & cinematography", "Emotional impact", "Original ideas", "Entertainment value"]}
                                selected={data.taste_factors}
                                onChange={(vals) => setData({ ...data, taste_factors: vals })}
                            />
                        </div>
                    </motion.div>
                );
            case 4: // Language & Culture
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <StepHeader
                            title="Industries & Languages"
                            subtitle="What regions do you follow?"
                        />
                        <div className="space-y-4">
                            <h3 className="font-semibold">Preferred industries</h3>
                            <MultiSelect
                                options={["Hollywood", "Indian cinema", "Korean", "Japanese", "European", "Mixed / World cinema"]}
                                selected={data.preferred_industries}
                                onChange={(vals) => setData({ ...data, preferred_industries: vals })}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold">Preferred languages</h3>
                            <MultiSelect
                                options={["English", "Hindi", "Spanish", "French", "Korean", "Japanese", "Mandarin", "German"]} // Simplified list
                                selected={data.preferred_languages}
                                onChange={(vals) => setData({ ...data, preferred_languages: vals })}
                            />
                        </div>
                    </motion.div>
                );
            case 5: // Reviews & Spoilers
                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <StepHeader
                            title="Preferences"
                            subtitle="How do you want to see reviews?"
                        />
                        <div className="space-y-4">
                            <h3 className="font-semibold">What kind of reviews are useful?</h3>
                            <MultiSelect
                                options={["Short, clear verdicts", "Detailed written reviews", "Editorial curated lists", "A small set of trusted reviewers", "Overall consensus"]}
                                selected={data.review_style_preferences}
                                onChange={(vals) => setData({ ...data, review_style_preferences: vals })}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold">Spoiler tolerance</h3>
                            <SingleSelect
                                options={["Avoid all spoilers", "Minor hints are okay", "Spoilers don’t bother me"]}
                                selected={data.spoiler_tolerance}
                                onChange={(val) => setData({ ...data, spoiler_tolerance: val })}
                            />
                        </div>
                    </motion.div>
                );
            case 6: // Expectation Setting (Final)
                return (
                    <motion.div
                        key="step6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold">How this platform works</h1>
                            <div className="max-w-md mx-auto space-y-4 text-lg text-muted-foreground text-left bg-muted/30 p-8 rounded-2xl border border-border">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Anyone can read reviews.</li>
                                    <li>Publishing reviews is earned through knowledge and peer trust.</li>
                                    <li>We do not use star ratings or popularity metrics.</li>
                                    <li>Our goal is to help you decide confidently.</li>
                                </ul>
                            </div>
                        </div>
                        <Button size="lg" className="w-full max-w-xs" onClick={handleComplete} disabled={loading}>
                            Start Exploring
                        </Button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Indicator */}
                {step < totalSteps && (
                    <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Step {step} of {totalSteps - 1}</span>
                        <div className="flex gap-1">
                            {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 w-8 rounded-full transition-colors",
                                        i + 1 <= step ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>

                {/* Navigation */}
                {step < totalSteps && (
                    <div className="mt-12 flex justify-between items-center">
                        <button
                            onClick={skipStep}
                            className="text-muted-foreground hover:text-foreground text-sm font-medium px-4 py-2"
                        >
                            Skip for now
                        </button>
                        <Button onClick={nextStep} disabled={loading} size="lg">
                            {loading ? "Saving..." : "Next"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
