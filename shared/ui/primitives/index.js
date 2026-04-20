/**
 * /shared/ui/primitives/index.js
 * UI Primitives - Barrel Export
 * LAW: No business logic, pure UI primitives
 */

export {
  createButton,
  createPrimaryButton,
  createSecondaryButton,
  createIconButton,
  BUTTON_VARIANTS,
  BUTTON_SIZES
} from './button.js';

export {
  createInput,
  createFormGroup,
  createTextarea,
  createSelect,
  INPUT_TYPES
} from './input.js';

export {
  createCard,
  createCardLayout,
  createGlassCard,
  createStatCard,
  CARD_VARIANTS
} from './card.js';

// Default export
export { default as button } from './button.js';
export { default as input } from './input.js';
export { default as card } from './card.js';
