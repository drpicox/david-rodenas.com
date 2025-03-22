import { type ContentFile, contentIndex } from "@/data/contentIndex";

export function getFileByAbsolutePath(
  absolutePath: string,
): ContentFile | undefined {
  return contentIndex.files.find((file) => file.path === absolutePath);
}

export function getFilesByUser(user: string): ContentFile[] {
  return contentIndex.files.filter(
    (file) => file.user && file.user.toLowerCase() === user.toLowerCase(),
  );
}

export function getFilesByTag(tag: string): ContentFile[] {
  return contentIndex.files.filter(
    (file) =>
      file.tags &&
      Array.isArray(file.tags) &&
      file.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export function getFilesByType(type: string): ContentFile[] {
  return contentIndex.files.filter((file) => file.type === type);
}

export function searchFiles(query: string): ContentFile[] {
  if (!query) return [];

  const searchQuery = query.toLowerCase();

  return contentIndex.files.filter(
    (file) =>
      file?.title?.toLowerCase()?.includes(searchQuery) ||
      file?.name?.toLowerCase()?.includes(searchQuery) ||
      file?.description?.toLowerCase()?.includes(searchQuery) ||
      file?.user?.toLowerCase()?.includes(searchQuery) ||
      (file.tags &&
        Array.isArray(file.tags) &&
        file.tags.some((tag) => tag.toLowerCase().includes(searchQuery))),
  );
}
