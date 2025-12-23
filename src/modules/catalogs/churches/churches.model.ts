export class Churches {
  church_id: number;
  name: string;
  active: boolean;
  district_id?: number;
  districts?: {
    name: string;
    district_id?: number;
  };
} 