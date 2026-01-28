import Protected from "../../components/Protected";

export default function FacultyHome() {
  return (
    <Protected allow={["FACULTY"]}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Faculty Dashboard</h1>
      </div>
    </Protected>
  );
}
