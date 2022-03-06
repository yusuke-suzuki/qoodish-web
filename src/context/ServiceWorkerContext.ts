import { createContext } from 'react';

type ContextProps = {
  registration: ServiceWorkerRegistration;
};

const ServiceWorkerContext = createContext<ContextProps>({
  registration: null
});

export default ServiceWorkerContext;
