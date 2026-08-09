import Organization, { IOrganization } from "./organization.model";
import { generateSlug } from "../../domain/organization/generate-slug";

export const createOrganization = async (input: { name: string; ownerId: string; country: string; currency: string }) => {
    const organization = await Organization.create({ ...input, slug: generateSlug(input.name) });
    return organization;
};

export const findOrganizationById = async (id: string) => {
    const organization = await Organization.findById(id);
    return organization;
};

export const updateOrganizationById = async (id: string, updates: Partial<Pick<IOrganization, 'name' | 'country' | 'currency'>>) => {
    return await Organization.findByIdAndUpdate(id, updates, { new: true });
};

