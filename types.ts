
export interface FormData {
  name: string;
  spouseName: string;
  phone: string;
  spousePhone: string;
  address: string;
  civilStatus: string[];
  participatesInPastoral: string;
  pastoralName: string;
}

export interface FormErrors {
  name?: string;
  spouseName?: string;
  phone?: string;
  spousePhone?: string;
  address?: string;
  civilStatus?: string;
  participatesInPastoral?: string;
  pastoralName?: string;
}

export enum RegistrationStep {
  FORM = 'FORM',
  SUCCESS = 'SUCCESS'
}
