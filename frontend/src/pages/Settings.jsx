import PageHeader from "../components/PageHeader";

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and application preferences." />
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">
          Login, profile and preference settings will be added in the final phase, once authentication is wired up.
        </p>
      </div>
    </div>
  );
}
