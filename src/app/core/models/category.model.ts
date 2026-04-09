export interface Category {
  id: number;
  name: string;
  parent: number | null;
  parent_name: string | null;
  full_path: string;
  children: { id: number; name: string }[];
  created_at: string;
}
