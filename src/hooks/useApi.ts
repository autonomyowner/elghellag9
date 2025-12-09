'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';

// Equipment hooks
export function useEquipment(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => apiClient.getEquipment(params),
  });
}

export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => apiClient.getEquipmentById(id),
    enabled: !!id,
  });
}

export function useFeaturedEquipment(limit?: number) {
  return useQuery({
    queryKey: ['equipment', 'featured', limit],
    queryFn: () => apiClient.getFeaturedEquipment(limit),
  });
}

export function useMyEquipment() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['equipment', 'my'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.getMyEquipment(token);
    },
  });
}

export function useCreateEquipment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.createEquipment(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.updateEquipment(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useDeleteEquipment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.deleteEquipment(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Land hooks
export function useLand(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['land', params],
    queryFn: () => apiClient.getLand(params),
  });
}

export function useLandById(id: string) {
  return useQuery({
    queryKey: ['land', id],
    queryFn: () => apiClient.getLandById(id),
    enabled: !!id,
  });
}

export function useFeaturedLand(limit?: number) {
  return useQuery({
    queryKey: ['land', 'featured', limit],
    queryFn: () => apiClient.getFeaturedLand(limit),
  });
}

export function useMyLand() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['land', 'my'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.getMyLand(token);
    },
  });
}

export function useCreateLand() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.createLand(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['land'] });
    },
  });
}

export function useUpdateLand() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.updateLand(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['land'] });
    },
  });
}

export function useDeleteLand() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.deleteLand(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['land'] });
    },
  });
}

// Animals hooks
export function useAnimals(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['animals', params],
    queryFn: () => apiClient.getAnimals(params),
  });
}

export function useAnimalById(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: () => apiClient.getAnimalById(id),
    enabled: !!id,
  });
}

export function useFeaturedAnimals(limit?: number) {
  return useQuery({
    queryKey: ['animals', 'featured', limit],
    queryFn: () => apiClient.getFeaturedAnimals(limit),
  });
}

export function useCreateAnimal() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.createAnimal(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}

// Vegetables hooks
export function useVegetables(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['vegetables', params],
    queryFn: () => apiClient.getVegetables(params),
  });
}

export function useVegetableById(id: string) {
  return useQuery({
    queryKey: ['vegetables', id],
    queryFn: () => apiClient.getVegetableById(id),
    enabled: !!id,
  });
}

export function useFeaturedVegetables(limit?: number) {
  return useQuery({
    queryKey: ['vegetables', 'featured', limit],
    queryFn: () => apiClient.getFeaturedVegetables(limit),
  });
}

// Nurseries hooks
export function useNurseries(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['nurseries', params],
    queryFn: () => apiClient.getNurseries(params),
  });
}

export function useNurseryById(id: string) {
  return useQuery({
    queryKey: ['nurseries', id],
    queryFn: () => apiClient.getNurseryById(id),
    enabled: !!id,
  });
}

export function useFeaturedNurseries(limit?: number) {
  return useQuery({
    queryKey: ['nurseries', 'featured', limit],
    queryFn: () => apiClient.getFeaturedNurseries(limit),
  });
}

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Search hooks
export function useSearch(query: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['search', query, params],
    queryFn: () => apiClient.search(query, params),
    enabled: query.length >= 2,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => apiClient.getSuggestions(query),
    enabled: query.length >= 2,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.getLocations(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

// Upload hooks
export function useUploadFile() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.uploadFile(token, file, folder);
    },
  });
}

export function useUploadFiles() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ files, folder }: { files: File[]; folder?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.uploadFiles(token, files, folder);
    },
  });
}

export function useDeleteFile() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (key: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return apiClient.deleteFile(token, key);
    },
  });
}
