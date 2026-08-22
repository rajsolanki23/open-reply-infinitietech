"use client";

import { StatusBadge as RefinedStatusBadge } from "@/components/ui-refined/status-badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <RefinedStatusBadge status={status} />;
}
