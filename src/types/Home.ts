export type FeedFilter = "for-you" | "recent" | "by-group";

export interface GroupHighlight {
  id: string;
  name: string;
  imageUri?: string;
  fallbackColor?: string;
}
