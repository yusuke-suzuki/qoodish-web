import { createContext } from 'react';

type ContextProps = {
  registration: ServiceWorkerRegistration | null;
};

const ServiceWorkerContext = createContext<ContextProps>({
  registration: null
});

export default ServiceWorkerContext;
