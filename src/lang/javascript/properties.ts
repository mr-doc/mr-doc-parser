export interface JavaScriptProperties {
  exports: Partial<JavaScriptExports>
  inheritance: Partial<JavaScriptInheritance>
  namespace: boolean,
  module: boolean
}

export interface JavaScriptExports {
  export: boolean,
  default: boolean
}

export interface JavaScriptInheritance {
  extends: boolean,
  implements: boolean
}