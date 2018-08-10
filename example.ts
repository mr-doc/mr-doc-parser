/**
 * # API
 * 
 * ```
 * @export
 * @class A
 * ```
 */
export default class A {
  constructor() {
    
  }
}

// /**
//  * # API
//  * 
//  * ```
//  * @export
//  * @class B
//  * ```
//  */
// export class B extends A {

// }

/**
 * # API
 * 
 * ```
 * @export
 * @class C
 * ```
 */
export class C implements A {
  /**
   * A property
   * # API
   * ```
   * @property: any
   * ```
   */
  property: any
}

// /**
//  * 
//  * # API
//  * ```
//  * @interface B
//  * 
//  * @property propertyA: any
//  * @property propertyB: any
//  * @property propertyC: any
//  * ```
//  */
// export interface D {
//   propertyA
//   propertyB
//   propertyC
// }