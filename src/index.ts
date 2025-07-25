import { drawOn } from './diagram';
import { panel, swatch, cube } from './conveniences';

// export a name string to test module structure
export const name = 'wassilyjs';

// expose all tsVector functions
export * as tsvector from 'tsvector' ;

// export components
export * as diagram from './diagram';
export * as styled from './styled';
export * as marking3d from './marking3d';
export * as line3d from './line3d';
export * as frame3d from './frame3d';
export * as marking from './marking';
export * as line from './line';
export * as frame from './frame';
export * as projection from './projection';
export * as circle from './circle';
export * as rect from './rect';
export * as poly from './poly';
export * as poly3d from './poly3d';
export * as conveniences from './conveniences';

// export the main constructor functions
export { drawOn, panel, swatch, cube };
