import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '../api/organizations.api';

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => organizationsApi.getMe().then((res) => res.data),
  });
}
