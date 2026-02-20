const statusClasses = {
  success: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
  pending: "bg-warning/20 text-warning",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusClasses[status as keyof typeof statusClasses]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}

export { StatusBadge };
