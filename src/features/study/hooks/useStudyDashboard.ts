import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mockStudyDashboard, StudyDashboardData } from "@/features/study/lib/mockStudyDashboard";

/**
 * Hook to fetch study dashboard data
 * Currently returns mock data, but structured to easily switch to API calls
 *
 * TODO: Эндпоинт /study-dashboard НЕ СУЩЕСТВУЕТ в текущем API бэкенда!
 * Когда бэкенд добавит этот эндпоинт, раскомментировать строку с api.get
 * и удалить мок-данные:
 *
 * queryFn: async () => {
 *   return api.get<StudyDashboardData>("/study-dashboard");
 * },
 */
export function useStudyDashboard() {
  return useQuery<StudyDashboardData>({
    queryKey: ["study-dashboard"],
    queryFn: async () => {
      // TODO: Раскомментировать когда бэкенд добавит эндпоинт:
      // return api.get<StudyDashboardData>("/study-dashboard");

      // Мок-данные пока эндпоинт не реализован
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockStudyDashboard;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

