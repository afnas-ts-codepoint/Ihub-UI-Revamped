import { currentUser } from '../data/current-user.mock';

export function useCurrentUser() {
  return {
    data: currentUser,
    error: null,
    isError: false,
    isPending: false,
  } as const;
}
