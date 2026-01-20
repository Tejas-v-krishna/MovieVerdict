export default function RulesPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
                <h1>MovieVerdict Community Rules</h1>

                <p className="lead">
                    These rules ensure MovieVerdict remains a trusted source for film verdicts and reviews.
                </p>

                <h2>Reviewing Rules</h2>

                <h3>1. Watch Before Reviewing</h3>
                <p>
                    You must pass the factual test for a movie before writing a review.
                    No exceptions. This confirms you&#39;ve actually watched the film.
                </p>

                <h3>2. One Review Per Movie</h3>
                <p>
                    Each user may write only one review per movie. You can edit your review at any time,
                    and edits are tracked in the edit history.
                </p>

                <h3>3. Be Substantive</h3>
                <p>
                    Reviews should analyze the film. Avoid one-liners or vague statements.
                    Good reviews discuss:
                </p>
                <ul>
                    <li>Direction and storytelling</li>
                    <li>Performances</li>
                    <li>Technical aspects (cinematography, sound, editing)</li>
                    <li>Themes and context</li>
                </ul>

                <h3>4. Respect Spoilers</h3>
                <p>
                    Use spoiler tags for plot reveals. Syntax: <code>[SPOILER]text[/SPOILER]</code>.
                    Spoilers include:
                </p>
                <ul>
                    <li>Major plot twists</li>
                    <li>Character deaths or reveals</li>
                    <li>Ending details</li>
                </ul>
                <p>
                    Do NOT spoiler tag: genre, tone, basic premise, cast, crew.
                </p>

                <h3>5. Disclose Conflicts</h3>
                <p>
                    You must disclose if you have any conflict of interest:
                </p>
                <ul>
                    <li>Financial stake in the film</li>
                    <li>Personal relationship with cast/crew</li>
                    <li>Professional involvement</li>
                </ul>
                <p>
                    Disclosure doesn&#39;t disqualify your review—it adds context for readers.
                </p>

                <h2>Editing Rules</h2>

                <h3>1. Edits Are Tracked</h3>
                <p>
                    All edits to reviews are logged with timestamps. Readers can view edit history.
                    This ensures transparency and prevents deceptive changes.
                </p>

                <h3>2. No Verdict Shopping</h3>
                <p>
                    Core Reviewers cannot repeatedly change verdicts based on external pressure.
                    Verdict changes require reasoning and admin approval.
                </p>

                <h2>Conduct Rules</h2>

                <h3>1. Be Respectful</h3>
                <p>
                    Disagree with films, not people. Personal attacks, harassment, or hateful content
                    result in immediate bans.
                </p>

                <h3>2. No Gaming the System</h3>
                <p>
                    Do not:
                </p>
                <ul>
                    <li>Share test answers</li>
                    <li>Create multiple accounts</li>
                    <li>Coordinate voting or reviews</li>
                    <li>Accept payment for reviews</li>
                </ul>

                <h3>3. No Commercial Promotion</h3>
                <p>
                    MovieVerdict is ad-free and independent. Do not use reviews to promote products, services,
                    or commercial interests.
                </p>

                <h2>Consequences</h2>

                <h3>Minor Violations</h3>
                <p>
                    Warning + review removal or edit request.
                </p>

                <h3>Serious Violations</h3>
                <p>
                    Temporary ban (7–30 days) or permanent ban depending on severity.
                    Serious violations include:
                </p>
                <ul>
                    <li>Harassment or hate speech</li>
                    <li>Gaming the system</li>
                    <li>Undisclosed conflicts of interest</li>
                    <li>Accepting payment for reviews</li>
                </ul>

                <h2>Appeals</h2>
                <p>
                    If you believe you were banned unjustly, contact admins with evidence.
                    All appeals are reviewed within 7 days.
                </p>

                <p className="mt-8">
                    <a href="/conflict-of-interest" className="text-primary hover:underline">
                        Learn more about conflict disclosure →
                    </a>
                </p>
            </div>
        </div>
    );
}
