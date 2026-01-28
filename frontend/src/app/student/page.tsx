import Protected from "../../components/Protected";

export default function StudentHome() {
  return (
    <Protected allow={["STUDENT"]}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
      </div>
    </Protected>
  );
}
