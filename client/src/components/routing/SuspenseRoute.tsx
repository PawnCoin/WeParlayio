import React, { Suspense, startTransition } from 'react';
import { Route, RouteComponentProps } from 'wouter';
import LoadingFallback from './LoadingFallback';

interface SuspenseRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export default function SuspenseRoute({ path, component: Component }: SuspenseRouteProps) {
  const WrappedComponent = (props: RouteComponentProps) => {
    const [component, setComponent] = React.useState<React.ComponentType | null>(null);
    
    React.useEffect(() => {
      startTransition(() => {
        setComponent(() => Component);
      });
    }, []);

    if (!component) {
      return <LoadingFallback />;
    }

    const LoadedComponent = component;
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LoadedComponent {...props} />
      </Suspense>
    );
  };

  return <Route path={path} component={WrappedComponent} />;
}