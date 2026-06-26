import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '@/lib/profile/profile.service'

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: getMyProfile })
}
