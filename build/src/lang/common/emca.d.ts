export interface NodeProperties {
    exports: Partial<NodeExports>;
    inheritance: Partial<NodeInheritance>;
}
export interface NodeExports {
    export: boolean;
    default: boolean;
}
export interface NodeInheritance {
    extends: boolean;
    implements: boolean;
}
