import { ILocation } from "../../interfaces/ILocation";

export interface NodeContext extends ILocation {
  text: string
}

export interface NodeProperties {
    exports: {
      export: boolean,
      default: boolean
    }
  }
  
  
  export interface ClassNode {
    class: {
      comment: NodeContext,
      context: NodeContext,
      identifier: NodeContext,
      heritage: NodeContext,
      body: any[],
      properties: Partial<NodeProperties & {
        extends: boolean,
        implements: boolean
      }>
    }
  }
  
  export interface ClassBodyNode {
    methods: ClassMethodNode[],
    properties: any[]
  }
  
  export interface ClassMethodNode {
    identifier: NodeContext,
    // Note: parameters contains '(' ... ')'
    parameters: NodeContext[],
    comment: NodeContext,
    context: NodeContext,
    type: string,
    async: boolean,
    private: boolean
  }