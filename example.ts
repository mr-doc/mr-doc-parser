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

// /**
//  * # API
//  * 
//  * ```
//  * @export
//  * @class C
//  * 
//  * @property a: any - Description
//  * @property b: any - Description
//  * ```
//  */
// export class C extends A {
//   a: any
//   b: any
// }

/**
 * 
 * # API
 * ```
 * @interface B
 * 
 * @property propertyA: any
 * @property propertyB: any
 * @property propertyC: any
 * ```
 */
export interface D {
  propertyA
  propertyB
  propertyC
  /**
   * Description
   * 
   * ```xdoc 
   * @method method
   * @param x
   * @param y
   * @param z
   * ```
   */
  method<T>(x, y, z?): Promise<T>
}