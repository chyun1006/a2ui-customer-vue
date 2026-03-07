import './styles/main.css'

export { default as SpecRender } from './SpecRender.vue'
export { catalog } from './catalog'
export { registry, handlers } from './registry'
export { validateSpec } from './validateSpec'
export {
  compileSpecFromJsonl,
  buildMilkTeaDemoSpec,
  specToJsonl,
} from './compileJsonlSpec'
export {
  collectActionNames,
  createGenericActionHandler,
  mergeDynamicHandlers,
} from './collectSpecActions'
export type { ActionHandler, OnDynamicAction } from './collectSpecActions'

