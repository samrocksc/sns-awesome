import Papa from "papaparse";
import * as fs from "fs";
import * as path from "path";
import { pipe } from "rambdax";

/**
 * A core dictionary or object of readonly types.  Notice that we use readonly?
 */
export type DataDict = {
  readonly zip: string;
  readonly buildingType: string;
  readonly consumptionTherms: string;
  readonly consumptionGigaJoules: string;
  readonly source: string;
};

/**
 * Constructs a file _path_
 * ```typescript
 * const filePath = retrieveFilePath("sample.csv")
 * ```
 */
export const retrieveFilePath = (fileName: string): string =>
  path.resolve(__dirname, fileName);

/**
 * Load a CSV in memory
 * ```typescript
 * const filePath = retrieveFilePath("sample.csv")
 * loadCsv(csvPath)
 * ```
 */
export const loadCsv = (filePath: string): string =>
  fs.readFileSync(filePath, { encoding: "utf-8" });

/**
 * Parses a CSV into usable data via papaparse
 * ```typescript
 * const filePath = retrieveFilePath("sample.csv")
 * const csvData = loadCsv(csvPath)
 * parseCsv(csvData)
 * ```
 */
export const parseCsv = (csv: string): Papa.ParseResult<DataDict> =>
  Papa.parse(csv, {
    header: true,
  });

/**
 * Generates only national grid items!
 */
export const nationalOnly = (
  input: Papa.ParseResult<DataDict>
): Papa.ParseResult<DataDict> => ({
  data: input.data.filter((input) => input.source === "National Grid"),
  errors: input.errors,
  meta: input.meta,
});

/**
 * Generates only ConEd Data
 */
export const conEdOnly = (
  input: Papa.ParseResult<DataDict>
): Papa.ParseResult<DataDict> => ({
  data: input.data.filter((input) => input.source === "ConEd"),
  errors: input.errors,
  meta: input.meta,
});

/**
 * Generates average therm readings
 * ```typescript
 * const data = pipe(retrieveFilePath, loadCsv, parseCsv)("sample.csv");
 * loggingSideEffect(averageTherms(data));
 * ```
 */
export const averageTherms = (input: Papa.ParseResult<DataDict>): number =>
  input.data.reduce((acc, cur) => acc + parseFloat(cur.consumptionTherms), 0) /
  input.data.length;

/**
 * A compartmentalized logging function that will still return the same input
 * Typed as: `<T>(input: T) => T`
 * ```typescript
 * const data = loggingSideEffect('hello');
 * typeof data; // this will be a string as a string is passed in
 * ```
 */
export const loggingSideEffect = <T>(input: T): T => {
  // eslint-disable-next-line functional/no-expression-statement
  console.log(input);
  return input;
};

/**
 * Now let's setup our function
 */

// Create an environment for being able to work with this
/* eslint-disable */

/**
 * Example 1: Functional Params
 * Hey!  Look at that, you can use a function execution as a param!
 */
loggingSideEffect(loadCsv(retrieveFilePath("sample.csv")));

/**
 * Example 2: Piping and currying
 * Now we have the opportunity to pipe.
 * Mathematically: Example 1 == Example 2(post execution)
 * - example2 could become a higher order function
 * - IMPORTANT: a function at rest is different than its executed version
 */
const example2 = pipe(
  retrieveFilePath,
  loadCsv,
  parseCsv,
  nationalOnly,
  loggingSideEffect
); // typeof function
example2("sample.csv"); // now we have executed it, this has a typeof string

/**
 * Perhaps we want to reuse data again? Only use what you need
 */
const rawCsv = pipe(retrieveFilePath, loadCsv, parseCsv)("sample.csv");
const nationalUsers = pipe(nationalOnly)(rawCsv);

// ahh, now let's get the average of national only
loggingSideEffect(averageTherms(nationalUsers));

// Now we can do some cool things like creating quick comparisons
const conEdUsers = pipe(conEdOnly)(rawCsv);
