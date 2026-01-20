export default function HowTrustWorksPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
                <h1>How Trust Works on MovieVerdict</h1>

                <p className="lead">
                    MovieVerdict is built on knowledge, transparency, and peer trust—not influence or popularity.
                </p>

                <h2>Why Reviews Are Restricted</h2>
                <p>
                    Anyone can read reviews on MovieVerdict, but writing them is earned through demonstrated knowledge.
                    This ensures that reviews come from people who&#39;ve actually watched the movie and understand cinema.
                </p>

                <h2>How It Works</h2>

                <h3>1. Knowledge Tests</h3>
                <p>
                    Before reviewing a movie, you must pass a factual test about the film. These tests cover:
                </p>
                <ul>
                    <li>Plot points and events</li>
                    <li>Character names and relationships</li>
                    <li>Key scenes and dialogue</li>
                </ul>
                <p>
                    Tests contain <strong>no opinions</strong>—only facts. If you&#39;ve watched the movie, you&#39;ll pass.
                    Passing your first test upgrades you to <strong>Non-Core Member</strong> status.
                </p>

                <h3>2. Private Reviews</h3>
                <p>
                    As a Non-Core Member, you can write <strong>private reviews</strong> visible only to Core Reviewers.
                    This is your opportunity to demonstrate thoughtful film analysis.
                </p>

                <h3>3. Peer Promotion</h3>
                <p>
                    Core Reviewers read your private reviews and vote to promote them to public visibility.
                    Consistently high-quality reviews earn trust and may lead to promotion to Core Reviewer status.
                </p>

                <h3>4. Public Reviews</h3>
                <p>
                    Core Reviewers can publish reviews directly. These represent MovieVerdict&#39;s voice and set the verdict for each film.
                </p>

                <h2>Verdicts, Not Ratings</h2>
                <p>
                    MovieVerdict uses verdict labels (S+, S, A, B, C) instead of numeric ratings. Verdicts answer:
                    <strong>&quot;Is this worth watching?&quot;</strong>
                </p>

                <dl>
                    <dt>S+ (Exceptional)</dt>
                    <dd>Must-watch. Exceptional filmmaking that stands the test of time.</dd>

                    <dt>S (Great)</dt>
                    <dd>Highly recommended. Strong execution with memorable elements.</dd>

                    <dt>A (Good)</dt>
                    <dd>Worth watching. Solid film with clear strengths.</dd>

                    <dt>B (Average)</dt>
                    <dd>Conditional. May appeal to specific audiences or has notable flaws.</dd>

                    <dt>C (Below Average)</dt>
                    <dd>Skip. Significant issues outweigh any positives.</dd>
                </dl>

                <h2>Transparency & Accountability</h2>
                <p>
                    Every verdict change is tracked with:
                </p>
                <ul>
                    <li>Who proposed it</li>
                    <li>Who approved it</li>
                    <li>Why it changed</li>
                    <li>When it changed</li>
                </ul>
                <p>
                    All reviewers must disclose conflicts of interest. MovieVerdict never sells data or accepts payment for reviews.
                </p>

                <h2>Why This Works</h2>
                <p>
                    By requiring knowledge and peer validation, MovieVerdict ensures reviews are:
                </p>
                <ul>
                    <li>From people who actually watched the film</li>
                    <li>Thoughtful and analytical</li>
                    <li>Free from commercial influence</li>
                    <li>Accountable and transparent</li>
                </ul>

                <p>
                    <a href="/rules" className="text-primary hover:underline">
                        Read our reviewing rules →
                    </a>
                </p>
            </div>
        </div>
    );
}
