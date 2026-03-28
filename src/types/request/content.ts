export type TGetPagesRequest = {
  status?: "draft" | "published";
};

export type TGetPageByIdRequest = {
  id: number;
};

export type TGetPageBySlugRequest = {
  slug: string;
};

export type TCreatePageRequest = {
  title: string;
  status?: "draft" | "published";
  slug: string;
  pageContent: string;
};

export type TUpdatePageRequest = {
  id: number;
  title?: string;
  status?: "draft" | "published";
  slug?: string;
  pageContent?: string;
};

export type TDeletePageRequest = {
  id: number;
};

