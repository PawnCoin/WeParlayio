import React, { Suspense, startTransition } from 'react';
import { Route, RouteComponentProps } from 'wouter';
import LoadingFallback from './LoadingFallback';

interface SuspenseRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export default function SuspenseRoute({ path, component: Component }: SuspenseRouteProps) {
  const WrappedComponent = (props: RouteComponentProps) => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    );
  };

  return <Route path={path} component={WrappedComponent} />;
}