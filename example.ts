interface K {
  /**
   * @property prop1: string
   */
  prop1: string
  /**
   * @property prop2: string
   */
  prop2: string
}

class A {

}
class Z {

}
/**
 * Description
 */
export default class B<T extends K, L> implements A, Z {
  /**
   * @property prop: string - description
   */
  private prop: (T & K) | T
  /**
   * Initialize the class
   * 
   */
  constructor() {
    // super()
  }
}

