import type { ItemSnapshot } from './contracts';

export function filterItems(items: ItemSnapshot[], query: string): ItemSnapshot[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return items;
  }

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) || item.content.toLowerCase().includes(needle),
  );
}
