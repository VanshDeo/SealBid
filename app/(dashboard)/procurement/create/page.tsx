import React from "react";
import { ProcurementCreationWizard } from "@/components/procurement/procurement-creation-wizard";

export const metadata = {
  title: "Create Procurement RFP | SealBid Privacy Protocol",
  description:
    "Define confidential procurement tenders, eligibility thresholds, and compile Midnight Compact ZK circuit rules.",
};

export default function ProcurementCreatePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ProcurementCreationWizard />
    </div>
  );
}
