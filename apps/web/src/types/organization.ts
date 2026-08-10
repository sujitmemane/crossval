export interface Organization {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  country: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationPayload {
  name: string;
  country: string;
  currency: string;
}
