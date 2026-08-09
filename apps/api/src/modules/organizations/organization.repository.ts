import Organization from "./organization.model";

export const createOrganization = async (input: { name: string; ownerId: string }) => {
    const organization = await Organization.create(input);
    return organization;
};

export const findOrganizationById = async (id: string) => {
    const organization = await Organization.findById(id);
    return organization;
};

