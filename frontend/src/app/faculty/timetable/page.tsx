"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ReadOnlyTimetableGrid from "@/components/timetable/ReadOnlyTimetableGrid";

export default function FacultyTimetablePage() {
    return (
        <Protected allow={["FACULTY"]}>
            <DashboardShell
                role="FACULTY"
                pageTitle="My Schedule"
                pageSubtitle="Your complete global teaching timetable across all sections."
            >
                <div className="mt-2">
                    <ReadOnlyTimetableGrid />
                </div>
            </DashboardShell>
        </Protected>
    );
}
