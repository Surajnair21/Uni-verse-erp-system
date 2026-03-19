"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ReadOnlyTimetableGrid from "@/components/timetable/ReadOnlyTimetableGrid";

export default function StudentTimetablePage() {
    return (
        <Protected allow={["STUDENT"]}>
            <DashboardShell
                role="STUDENT"
                pageTitle="My Timetable"
                pageSubtitle="Your weekly class schedule based on your assigned section."
            >
                <div className="mt-2">
                    <ReadOnlyTimetableGrid />
                </div>
            </DashboardShell>
        </Protected>
    );
}
