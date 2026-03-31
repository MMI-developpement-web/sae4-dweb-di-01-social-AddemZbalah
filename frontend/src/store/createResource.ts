type Status = 'pending' | 'success' | 'error';

export function createResource<T>(promise: Promise<T>) {
  let status: Status = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (data) => { status = 'success'; result = data; },
    (err)  => { status = 'error';   error  = err;  }
  );

  return {
    read(): T {
      if (status === 'pending') throw suspender;  // React intercepte → affiche le fallback
      if (status === 'error')   throw error;       // React intercepte → affiche l'ErrorBoundary
      return result;
    },
  };
}
