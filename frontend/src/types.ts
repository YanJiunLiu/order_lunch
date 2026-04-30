export interface LunchOption {
  restaurant: string;
  purchase_link: string;
  banned: boolean;
  blacklist_id?: number;
}

export interface RecordData {
  id: number;
  name: string;
  created: string;
  description: string;
}
