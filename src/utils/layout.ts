/** Page dimensions in inches */
export const pageSizes = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
  legal: { width: 8.5, height: 14 }
} as const;

/** Get content area dimensions given page size and margins */
export function getContentArea(
  pageSize: keyof typeof pageSizes,
  margins: { top: number; right: number; bottom: number; left: number }
) {
  const page = pageSizes[pageSize];
  return {
    width: page.width - margins.left - margins.right,
    height: page.height - margins.top - margins.bottom
  };
}
