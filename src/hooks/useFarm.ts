import { useQuery } from '@tanstack/react-query';
import { getCurrentFarm, type FarmInfo } from '@/api/farms';

export function useFarm() {
    return useQuery<FarmInfo>({
        queryKey: ['farm'],
        queryFn: async () => {
            const response = await getCurrentFarm();
            return response.data;
        },
        staleTime: 60_000,
    });
}