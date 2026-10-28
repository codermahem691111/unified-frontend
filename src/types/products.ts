export interface Product {
  id: string;
  name: string;
  details: string | null;
  sellingPrice: number;
  buyingPrice: number;
  /** Temporary signed link (about an hour); null when the product has no image. */
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  details: string | null;
  sellingPrice: number;
  buyingPrice: number;
}

/** What the person did with the image field in the form. */
export interface ImageChange {
  /** A newly chosen file to upload. */
  file: File | null;
  /** True when the existing image should be removed. */
  remove: boolean;
}
