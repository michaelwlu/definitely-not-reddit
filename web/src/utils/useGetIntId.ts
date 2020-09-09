export const useGetIntId = (stringId: any) => {
  return typeof stringId === 'string' ? Number(stringId) : -1;
};
