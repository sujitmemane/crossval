import { AppError } from '../../lib/errors';
import { success } from '../../lib/response';
import { findOrganizationById, updateOrganizationById } from './organization.repository';

export const getMyOrganization = async (organizationId: string) => {
    const organization = await findOrganizationById(organizationId);
    if (!organization) throw new AppError('Organization not found', 404);
    return success('Organization fetched successfully', organization);
};

export const updateMyOrganization = async (
    organizationId: string,
    updates: { name?: string; country?: string; currency?: string }
) => {
    const organization = await updateOrganizationById(organizationId, updates);
    if (!organization) throw new AppError('Organization not found', 404);
    return success('Organization updated successfully', organization);
};
