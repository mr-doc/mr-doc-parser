/**
 * An interface that represents a range.
 *
 * @interface Range
 */
export interface Range {
    start: number;
    end: number;
}
/**
 * An interface that represents the positional
 * and locational ranges of a source code.
 *
 * @interface TextRange
 */
export default interface TextRange {
    /**
     * Represents a context's start and end position.
     * @property position: {
     *  start: number,
     *  end: number
     * }
     */
    position: Range;
    /**
     * Represents a context's row and column location.
     *
     * @location: {
     *  row: Range,
     *  column: Range
     * }
     */
    location: {
        row: Range;
        column: Range;
    };
}
