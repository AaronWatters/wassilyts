import { drawOn } from './diagram';

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

// export the drawOn function
export { drawOn };
