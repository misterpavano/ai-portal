export type TContentPage = {
  id: number;
  title: string;
  status: "draft" | "published";
  slug: string;
  pageContent: string;
  createdAt: string;
  updatedAt: string;
};

