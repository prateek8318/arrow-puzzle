export type Mask = string[];
export function isInsideMask(mask: Mask, x: number, y: number): boolean;
export function getExitCells(head: { x: number; y: number }, direction: number, mask: Mask): { x: number; y: number }[];
