/**
 * Statutory Concordance Mapping Utility
 * Translates historical Indian Penal Code (IPC, 1860) charge codes to the
 * contemporary Bharatiya Nyaya Sanhita (BNS, 2023) statutory framework
 * while preserving legal accuracy and historical context for pre-July 1, 2024 matters.
 */

export interface StatuteMetadata {
  chargeCode: string;
  bnsSection: string;
  ipcSection: string;
  actTitle: string;
  offenceDescription: string;
  isSpecialAct?: boolean;
}

export const STATUTE_CATALOG: Record<string, StatuteMetadata> = {
  IPC_420: {
    chargeCode: 'IPC_420',
    bnsSection: 'BNS § 318(4)',
    ipcSection: 'IPC § 420',
    actTitle: 'Bharatiya Nyaya Sanhita, 2023',
    offenceDescription: 'Cheating and dishonestly inducing delivery of property',
  },
  IPC_406: {
    chargeCode: 'IPC_406',
    bnsSection: 'BNS § 316(2)',
    ipcSection: 'IPC § 406',
    actTitle: 'Bharatiya Nyaya Sanhita, 2023',
    offenceDescription: 'Criminal breach of trust',
  },
  IPC_467: {
    chargeCode: 'IPC_467',
    bnsSection: 'BNS § 338',
    ipcSection: 'IPC § 467',
    actTitle: 'Bharatiya Nyaya Sanhita, 2023',
    offenceDescription: 'Forgery of valuable security, will, etc.',
  },
  IPC_120B: {
    chargeCode: 'IPC_120B',
    bnsSection: 'BNS § 61(2)',
    ipcSection: 'IPC § 120B',
    actTitle: 'Bharatiya Nyaya Sanhita, 2023',
    offenceDescription: 'Criminal conspiracy',
  },
  IPC_302: {
    chargeCode: 'IPC_302',
    bnsSection: 'BNS § 103(1)',
    ipcSection: 'IPC § 302',
    actTitle: 'Bharatiya Nyaya Sanhita, 2023',
    offenceDescription: 'Punishment for murder',
  },
  IT_66D: {
    chargeCode: 'IT_66D',
    bnsSection: 'IT Act § 66D',
    ipcSection: 'IT Act § 66D',
    actTitle: 'Information Technology Act, 2000',
    offenceDescription: 'Punishment for cheating by personation by using computer resource',
    isSpecialAct: true,
  },
};

/**
 * Returns formatted dual-concordance label for dropdowns and displays
 * e.g. "BNS § 318(4) (formerly IPC § 420) — Cheating"
 */
export function formatStatuteConcordance(chargeCode: string): string {
  const meta = STATUTE_CATALOG[chargeCode];
  if (!meta) {
    return chargeCode;
  }
  if (meta.isSpecialAct) {
    return `${meta.bnsSection} — ${meta.offenceDescription}`;
  }
  return `${meta.bnsSection} (hist. ${meta.ipcSection}) — ${meta.offenceDescription}`;
}

/**
 * Formats statutory section badge with BNS preference and historical footnote
 */
export function getStatuteDisplay(chargeCode: string, filingDate?: string): {
  primary: string;
  secondary: string;
  regime: 'BNS' | 'IPC' | 'SPECIAL';
} {
  const meta = STATUTE_CATALOG[chargeCode];
  if (!meta) {
    return {
      primary: chargeCode,
      secondary: '',
      regime: 'SPECIAL',
    };
  }

  if (meta.isSpecialAct) {
    return {
      primary: meta.bnsSection,
      secondary: meta.actTitle,
      regime: 'SPECIAL',
    };
  }

  // Pre-July 1, 2024 matters historically initiated under IPC
  const isPreBNS = filingDate ? new Date(filingDate) < new Date('2024-07-01') : false;

  if (isPreBNS) {
    return {
      primary: meta.ipcSection,
      secondary: `BNS Concordance: ${meta.bnsSection}`,
      regime: 'IPC',
    };
  }

  return {
    primary: meta.bnsSection,
    secondary: `Historical: ${meta.ipcSection}`,
    regime: 'BNS',
  };
}
