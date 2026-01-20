export default function ConflictOfInterestPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
                <h1>Conflict of Interest Policy</h1>

                <p className="lead">
                    Transparency builds trust. MovieVerdict requires all reviewers to disclose conflicts of interest.
                </p>

                <h2>What Is a Conflict of Interest?</h2>
                <p>
                    A conflict exists when you have a relationship to the film that could influence your judgment.
                    Conflicts can be:
                </p>

                <h3>Financial</h3>
                <ul>
                    <li>You invested in the film or production company</li>
                    <li>You own stock in the distributor</li>
                    <li>You were paid to consult on the film</li>
                    <li>You received compensation for the review</li>
                </ul>

                <h3>Personal</h3>
                <ul>
                    <li>You are related to cast or crew</li>
                    <li>You have a close friendship with filmmakers</li>
                    <li>You are in a relationship with someone involved</li>
                </ul>

                <h3>Professional</h3>
                <ul>
                    <li>You worked on the film</li>
                    <li>You work for the studio or distributor</li>
                    <li>You are employed by a competing studio</li>
                    <li>You have professional rivalry with filmmakers</li>
                </ul>

                <h2>Mandatory Disclosure</h2>
                <p>
                    When writing a review, you must check a box confirming <strong>no conflict</strong>.
                    If a conflict exists, you must explain it in the disclosure field.
                </p>

                <h3>Example Disclosures</h3>
                <blockquote>
                    <p>&quot;I worked as a consultant on this film&#39;s historical accuracy.&quot;</p>
                </blockquote>
                <blockquote>
                    <p>&quot;The director is a close friend from film school.&quot;</p>
                </blockquote>
                <blockquote>
                    <p>&quot;I own stock in the production company.&quot;</p>
                </blockquote>

                <h2>Why Disclosure Matters</h2>
                <p>
                    Disclosure doesn&#39;t invalidate your review—it provides context. Readers can decide
                    how much weight to give disclosed conflicts. Transparency prevents hidden biases.
                </p>

                <h2>What Happens If You Don&#39;t Disclose?</h2>
                <p>
                    Failure to disclose a conflict is a <strong>serious violation</strong>. Consequences:
                </p>
                <ul>
                    <li>Immediate review removal</li>
                    <li>Loss of Core Reviewer status (if applicable)</li>
                    <li>Permanent ban for severe cases</li>
                </ul>

                <h2>When in Doubt, Disclose</h2>
                <p>
                    If you&#39;re unsure whether something qualifies as a conflict, err on the side of disclosure.
                    Over-disclosure is always better than under-disclosure.
                </p>

                <h2>MovieVerdict&#39;s Commitment</h2>
                <p>
                    MovieVerdict itself has no conflicts. We:
                </p>
                <ul>
                    <li>Never accept payment for reviews or verdicts</li>
                    <li>Have no financial stake in any film</li>
                    <li>Do not sell user data to studios</li>
                    <li>Operate independently of the film industry</li>
                </ul>

                <h2>Reporting Undisclosed Conflicts</h2>
                <p>
                    If you discover a reviewer failed to disclose a conflict, report it to admins with evidence.
                    All reports are investigated confidentially.
                </p>

                <p className="mt-8">
                    <a href="/rules" className="text-primary hover:underline">
                        Read all community rules →
                    </a>
                </p>
            </div>
        </div>
    );
}
