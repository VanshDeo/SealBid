import { PROOF_STATUS } from "@/lib/constants";
import { ProofStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export interface ProofStatusBadgeProps {
  status: ProofStatus;
}

export function ProofStatusBadge({ status }: ProofStatusBadgeProps) {
  const configs: Record<
    ProofStatus,
    { label: string; variant: "default" | "active" | "revealing" | "settled" | "zk" | "outline" }
  > = {
    [PROOF_STATUS.IDLE]: { label: "Idle", variant: "outline" },
    [PROOF_STATUS.GENERATING_WITNESS]: { label: "Witness Gen...", variant: "revealing" },
    [PROOF_STATUS.PROVING]: { label: "ZK Proving...", variant: "zk" },
    [PROOF_STATUS.VERIFIED]: { label: "Proof Verified", variant: "active" },
    [PROOF_STATUS.SUBMITTED]: { label: "On-Chain Submitted", variant: "settled" },
    [PROOF_STATUS.FAILED]: { label: "Proving Failed", variant: "default" },
  };

  const config = configs[status] || configs[PROOF_STATUS.IDLE];

  return <Badge variant={config.variant}>🔒 {config.label}</Badge>;
}
