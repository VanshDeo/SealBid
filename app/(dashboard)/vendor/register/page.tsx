import React from "react";
import { VendorRegistrationForm } from "@/components/vendor/vendor-registration-form";

export const metadata = {
  title: "Vendor Registration | SealBid Privacy Protocol",
  description:
    "Register a confidential business profile on Midnight Network using zero-knowledge commitments and client-side encryption.",
};

export default function VendorRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <VendorRegistrationForm />
    </div>
  );
}
