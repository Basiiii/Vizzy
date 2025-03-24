/**
 * Represents a successful result containing data and no error
 * @template T The type of the successful data
 */
type Success<T> = {
  data: T;
  error: null;
};

/**
 * Represents a failure result containing an error and no data
 * @template E The type of the error
 */
type Failure<E> = {
  data: null;
  error: E;
};

/**
 * A discriminated union type representing either a successful result or a failure
 * @template T The type of the successful data
 * @template E The type of the error, defaults to Error
 */
type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * A utility function that wraps a promise execution in a try-catch block and returns a Result type
 * @template T The type of the successful data
 * @template E The type of the error, defaults to Error
 * @param {Promise<T>} promise The promise to be executed
 * @returns {Promise<Result<T, E>>} A promise that resolves to either a Success or Failure result
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
