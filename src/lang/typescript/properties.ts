export interface TypeScriptProperties {
  exports: Partial<TypeScriptExports>
  inheritance: Partial<TypeScriptInheritance>
  namespace: boolean,
  module: boolean
}

export interface TypeScriptExports {
  export: boolean,
  default: boolean
}

export interface TypeScriptInheritance {
  extends: boolean,
  implements: boolean
}