
export enum ApplicationType {
  BMS = 'Battery Management System (BMS)',
  MOTOR_CONTROL = 'Motor Control System',
  GENERIC_EMBEDDED = 'Generic Embedded Controller',
  UNKNOWN = 'Unknown/Analyzing'
}

export interface SystemProfile {
  type: ApplicationType;
  confidence: number;
  extractedEntities: {
    voltages?: string[];
    mcu?: string[];
    interfaces?: string[];
    safetyKeywords?: string[];
  };
}

export interface GapDetail {
  title: string;
  explanation: string;
  implication: string;
}

export interface GapAnalysis {
  missingTopics: GapDetail[];
  vagueSpecifications: GapDetail[];
  dangerousAssumptions: GapDetail[];
}

export interface Artifact {
  title: string;
  type: 'doc' | 'table' | 'code' | 'diagram';
  content: string;
  disclaimer: string;
}

export interface AnalysisResult {
  profile: SystemProfile;
  gaps: GapAnalysis;
  artifacts: Artifact[];
}

export enum WorkflowStep {
  IDLE = 0,
  USER_INPUT = 1,
  PARSING = 2,
  DETECTION = 3,
  PROFILE_LOADING = 4,
  GAP_ANALYSIS = 5,
  GENERATION = 6,
  FINAL_STOP = 7
}
