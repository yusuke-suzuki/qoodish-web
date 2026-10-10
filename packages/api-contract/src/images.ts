export type ImageVariants = {
  url: string;
  avatar: string;
  card: string;
  hero: string;
  ogp: string;
};

export type Image = { id: number } & ImageVariants;

export type ImageUpload = {
  id: number;
  upload_url: string;
};
