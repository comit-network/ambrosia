import { useEffect, useReducer } from 'react';

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.data
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
        error: action.error
      };
    default:
      throw new Error();
  }
};

// Hook for data fetching with built-in loading flags, error flags, and refetch capability.
const useFetch = (func, initialData) => {
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
    error: null
  });
  const [refetchFlag, refetch] = useReducer(r => r + 1, 0);

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await func();

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', data: result });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE', error });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [func, refetchFlag]);

  return { ...state, refetch };
};

export default useFetch;
