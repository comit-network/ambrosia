import nock from "nock";
import { Cnd } from "./cnd";

it.each([
  ["500", "Internal Server Error", "about:blank", null],
  ["405", "Invalid action invocation", null, null],
  [
    "400",
    "Swap not supported",
    "about:blank",
    "The requested combination of ledgers and assets is not supported."
  ]
])(
  "should return a Problem if the response is application/problem+json",
  (status, title, type, detail) =>
    setup(async (interceptor, postSwap) => {
      const statusCode = parseInt(status!, 10);

      const scope = interceptor.reply(
        statusCode,
        JSON.stringify({ status, title, type, detail }),
        {
          "content-type": "application/problem+json"
        }
      );

      const promise = postSwap();

      await expect(promise).rejects.toMatchSnapshot();

      return scope;
    })
);

it("should return a generic axios error if the status code is fauly and the content type is not application/problem+json", () =>
  setup(async (interceptor, postSwap) => {
    const scope = interceptor.reply(400, JSON.stringify({}), {
      "content-type": "application/json"
    });

    const promise = postSwap();

    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Error: Request failed with status code 400]`
    );

    return scope;
  }));

it("cnd should not throw an error if the response is application/vnd.siren+json", () =>
  setup(async (interceptor, postSwap) => {
    const scope = interceptor.reply(201, JSON.stringify({}), {
      "content-type": "application/vnd.siren+json",
      location: "http://example.com/foo/bar"
    });

    const location = await postSwap();

    expect(location).toBe("http://example.com/foo/bar");

    return scope;
  }));

/**
 * Sets up a test environment around the `postSwap` call.
 *
 * For this we setup nock and a Cnd instance that is pointing to the same endpoint.
 * The actual test function is passed this interceptor to customize, what the return value should be.
 * We also pass a function or triggering the `postSwap` call to it.
 *
 * This allows the testFn to focus on the bare minimum required to understand the test:
 *
 * 1. what to we return from the route
 * 2. how do we expect the `Cnd` instance to behave
 *
 * @param testFn The actual, customized test function.
 * @returns a test function, ready to be passed to the test framework
 */
async function setup(
  testFn: (
    interceptor: nock.Interceptor,
    postSwap: () => Promise<string>
  ) => Promise<nock.Scope>
): Promise<void> {
  const basePath = "http://example.com";
  const cnd = new Cnd(basePath);

  const interceptor = nock(basePath).post("/swaps/rfc003");
  const postSwap = () => cnd.postSwap({} as any);

  const scope = await testFn(interceptor, postSwap);

  scope.done();
}
