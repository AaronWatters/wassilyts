import { drawOn } from './diagram';

// export a name string to test module structure
export const name = 'wassilyjs';

// expose all tsVector functions
export * as tsvector from 'tsvector' ;

// export the diagram module
export * as diagram from './diagram';

// export the frame module
export * as frame from './frame';

// export the marking module
export * as marking from './marking';

export * as projection from './projection';

// export the drawOn function
export { drawOn };
