/**
 * @ignore
 * @packageDocumentation
 */
export const mockPostSwap = jest.fn().mockImplementation(async () => {
  return Promise.resolve("/mock/swap/location");
});

export const mockFetch = jest.fn().mockImplementation(async () => {
  return Promise.resolve({
    data: {
      properties: { id: "123456" },
      links: [{ rel: "self", href: "/mock/self/href" }]
    }
  });
});

export const Cnd = jest.fn().mockImplementation(() => {
  return {
    postSwap: mockPostSwap,
    fetch: mockFetch
  };
});
