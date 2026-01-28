import Protected from "../../components/Protected";

export default function HodHome() {
  return (
    <Protected allow={["HOD"]}>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">HOD Dashboard</h1>
      </div>
    </Protected>
  );
}
