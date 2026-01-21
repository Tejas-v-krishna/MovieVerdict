"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveOnboardingPreferences, completeOnboarding } from "@/app/[locale]/onboarding/actions";
import { ChevronRight, Check } from "lucide-react";

// --- Types ---
type OnboardingData = {
    user_intent: string[];
    watch_mode: string;
    watch_frequency: string;
    preferred_genres: string[];
    taste_factors: string[];
    preferred_industries: string[];
    review_style_preferences: string[]; // Fixed name
    spoiler_tolerance: string;
};

const INITIAL_DATA: OnboardingData = {
    user_intent: [],
    watch_mode: "",
    watch_frequency: "",
    preferred_genres: [],
    taste_factors: [],
    preferred_industries: [],
    review_style_preferences: [],
    spoiler_tolerance: "",
};

// --- Styled Components ---

const StepContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("w-full max-w-2xl bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-8 sm:p-12 border border-white/20", className)}>
        {children}
    </div>
);

const OptionButton = ({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left px-6 py-4 rounded-xl text-lg font-medium transition-all duration-200 border-2",
            selected
                ? "border-primary bg-primary/5 text-foreground shadow-sm"
                : "border-transparent bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
        )}
    >
        <div className="flex items-center justify-between">
            <span>{children}</span>
            {selected && <Check className="w-5 h-5 text-primary" />}
        </div>
    </button>
);

const MultiSelectOptions = ({
    options,
    selected,
    onChange,
}: {
    options: string[];
    selected: string[];
    onChange: (value: string[]) => void;
}) => (
    <div className="flex flex-col gap-3">
        {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
                <OptionButton
                    key={option}
                    selected={isSelected}
                    onClick={() => {
                        if (isSelected) {
                            onChange(selected.filter((item) => item !== option));
                        } else {
                            onChange([...selected, option]);
                        }
                    }}
                >
                    {option}
                </OptionButton>
            );
        })}
    </div>
);

const SingleSelectOptions = ({
    options,
    selected,
    onChange,
    autoAdvance,
}: {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
    autoAdvance?: () => void;
}) => (
    <div className="flex flex-col gap-3">
        {options.map((option) => {
            const isSelected = selected === option;
            return (
                <OptionButton
                    key={option}
                    selected={isSelected}
                    onClick={() => {
                        onChange(option);
                        if (autoAdvance) setTimeout(autoAdvance, 300);
                    }}
                >
                    {option}
                </OptionButton>
            );
        })}
    </div>
);

// --- Main Component ---

export function OnboardingFlow() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);

    const totalSteps = 8; // Excluding final screen

    const saveData = async (newData: OnboardingData) => {
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
        await saveData(data);
        await completeOnboarding();
    };

    const skipStep = async () => {
        setLoading(true);
        await saveData(data);
        setStep((prev) => prev + 1);
        setLoading(false);
    };

    // --- Steps Content ---

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">What brings you here?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Select all that apply.</p>
                        <MultiSelectOptions
                            options={[
                                "Deciding if a movie is worth watching",
                                "Avoiding bad or overhyped movies",
                                "Finding genuinely good films",
                                "Discovering hidden gems",
                                "Following trusted reviewers",
                            ]}
                            selected={data.user_intent}
                            onChange={(vals) => setData({ ...data, user_intent: vals })}
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">How do you usually watch movies?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Select one.</p>
                        <SingleSelectOptions
                            options={["Mostly in theatres", "Mostly at home (streaming)", "Both equally"]}
                            selected={data.watch_mode}
                            onChange={(val) => setData({ ...data, watch_mode: val })}
                            autoAdvance={nextStep}
                        />
                    </>
                );
            case 3:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">How often do you watch movies?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Usually.</p>
                        <SingleSelectOptions
                            options={["Occasionally (1–2 per month)", "Regularly (weekly)", "Very often (multiple times a week)"]}
                            selected={data.watch_frequency}
                            onChange={(val) => setData({ ...data, watch_frequency: val })}
                            autoAdvance={nextStep}
                        />
                    </>
                );
            case 4:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">What kinds of movies do you enjoy?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Select your favorites.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {["Drama", "Thriller", "Crime", "Romance", "Action", "Sci-Fi", "Fantasy", "Horror", "Comedy", "Animation", "Documentary", "Indie"].map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => {
                                        const selected = data.preferred_genres.includes(genre);
                                        if (selected) {
                                            setData({ ...data, preferred_genres: data.preferred_genres.filter(g => g !== genre) });
                                        } else {
                                            setData({ ...data, preferred_genres: [...data.preferred_genres, genre] });
                                        }
                                    }}
                                    className={cn(
                                        "py-3 px-2 rounded-xl text-center font-medium border-2 transition-all",
                                        data.preferred_genres.includes(genre)
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-transparent bg-secondary/50 hover:bg-secondary text-muted-foreground"
                                    )}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">What matters most to you?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Select your top priorities.</p>
                        <MultiSelectOptions
                            options={[
                                "Strong story & writing",
                                "Acting performances",
                                "Direction & cinematography",
                                "Emotional impact",
                                "Original ideas",
                                "Entertainment value",
                            ]}
                            selected={data.taste_factors}
                            onChange={(vals) => setData({ ...data, taste_factors: vals })}
                        />
                    </>
                );
            case 6:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">Which movie industries do you watch?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Select all that apply.</p>
                        <div className="flex flex-wrap gap-3">
                            {["Hollywood", "Indian", "Korean", "Japanese", "European", "World cinema"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        const selected = data.preferred_industries.includes(opt);
                                        if (selected) {
                                            setData({ ...data, preferred_industries: data.preferred_industries.filter(i => i !== opt) });
                                        } else {
                                            setData({ ...data, preferred_industries: [...data.preferred_industries, opt] });
                                        }
                                    }}
                                    className={cn(
                                        "px-6 py-3 rounded-full text-lg font-medium border-2 transition-all",
                                        data.preferred_industries.includes(opt)
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-transparent hover:border-primary/50 text-foreground"
                                    )}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                );
            case 7:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">How do you prefer movie reviews?</h1>
                        <p className="text-muted-foreground text-lg mb-8">Help us tailor your feed.</p>
                        <MultiSelectOptions
                            options={[
                                "Short verdicts",
                                "Detailed reviews",
                                "Curated lists",
                                "A few trusted reviewers",
                                "Consensus from trusted voices",
                            ]}
                            selected={data.review_style_preferences}
                            onChange={(vals) => setData({ ...data, review_style_preferences: vals })}
                        />
                    </>
                );
            case 8:
                return (
                    <>
                        <h1 className="text-3xl font-bold mb-2">How do you feel about spoilers?</h1>
                        <p className="text-muted-foreground text-lg mb-8">We can hide them for you.</p>
                        <SingleSelectOptions
                            options={["Avoid all spoilers", "Minor hints are okay", "Spoilers don’t bother me"]}
                            selected={data.spoiler_tolerance}
                            onChange={(val) => setData({ ...data, spoiler_tolerance: val })}
                            autoAdvance={() => setStep(9)}
                        />
                    </>
                );
            case 9: // Final
                return (
                    <div className="text-center py-8">
                        <h1 className="text-4xl font-bold mb-6">How this platform works</h1>
                        <div className="text-left bg-secondary/30 p-8 rounded-2xl space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">1</div>
                                <p className="text-lg">Anyone can read reviews, but writing them is an earned privilege.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">2</div>
                                <p className="text-lg">We don't use star ratings or popularity metrics to judge quality.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">3</div>
                                <p className="text-lg">Our goal is to help you decide confidently, not to sell you tickets.</p>
                            </div>
                        </div>
                        <Button size="lg" className="w-full text-lg h-14 rounded-xl" onClick={handleComplete} disabled={loading}>
                            {loading ? "Setting up..." : "Start Exploring"}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col items-center justify-center p-4">

            {/* Progress Bar - Only check until step 8 */}
            {step <= 8 && (
                <div className="w-full max-w-xl mb-8 flex justify-between px-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 flex-1 mx-1 rounded-full transition-all duration-300",
                                i + 1 <= step ? "bg-primary" : "bg-black/10"
                            )}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <StepContainer>
                        {renderContent()}
                    </StepContainer>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step <= 8 && (
                <div className="w-full max-w-2xl mt-8 flex justify-between items-center px-4">
                    <button
                        onClick={skipStep}
                        className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        Skip for now
                    </button>

                    <Button
                        onClick={nextStep}
                        size="lg"
                        className="rounded-xl px-8"
                        disabled={loading}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
