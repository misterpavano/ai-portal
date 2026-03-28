import { TContentPage } from "../local/content";

export type TGetPagesResponse = {
  success: boolean;
  message?: string;
  data: TContentPage[];
  error?: string;
};

export type TGetPageByIdResponse = {
  success: boolean;
  message?: string;
  data: TContentPage;
  error?: string;
};

export type TGetPageBySlugResponse = {
  success: boolean;
  message?: string;
  data: TContentPage;
  error?: string;
};

export type TCreatePageResponse = {
  success: boolean;
  message?: string;
  data: TContentPage;
  error?: string;
};

export type TUpdatePageResponse = {
  success: boolean;
  message?: string;
  data: TContentPage;
  error?: string;
};

export type TDeletePageResponse = {
  success: boolean;
  message?: string;
  data: void;
  error?: string;
};

