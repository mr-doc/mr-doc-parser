
interface A {

}

/**
 * Description
 */
interface B<T extends A, K> extends A {
  /**
   * description
   */
  (x: string): void
  /**
   * description
   */
  func (x: string): void
}