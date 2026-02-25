import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mockStudyDashboard, StudyDashboardData } from "@/lib/mockStudyDashboard";

/**
 * Hook to fetch study dashboard data
 * Currently returns mock data, but structured to easily switch to API calls
 */
export function useStudyDashboard() {
  return useQuery<StudyDashboardData>({
    queryKey: ["study-dashboard"],
    queryFn: async () => {
      // TODO: Replace with actual API call when backend is ready
      // return api.get<StudyDashboardData>("/study-dashboard");
      
      // For now, return mock data with a small delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockStudyDashboard;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

