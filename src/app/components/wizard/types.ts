import type { ReactNode } from "react";

export interface WizardStep {
  label: string;
  content: ReactNode;
}

interface StepWizardBaseProps {
  steps: WizardStep[];
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  confirmLabel?: string;
  submittingLabel?: string;
}

export type StepWizardProps = StepWizardBaseProps & {
  disableConfirm?: boolean;
  disableConfirmReason?: string;
};
