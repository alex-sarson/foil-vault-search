import { Type } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

/** Configure RouterTestingHarness with optional extra routes. */
export async function setupRouterTesting(
  routes: Routes,
  initialUrl = '/',
): Promise<RouterTestingHarness> {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes)],
  });

  const harness = await RouterTestingHarness.create();
  if (initialUrl !== '/') {
    await harness.navigateByUrl(initialUrl);
  }
  return harness;
}

/** Navigate to a route with query params via RouterTestingHarness. */
export async function navigateWithQueryParams(
  harness: RouterTestingHarness,
  path: string,
  queryParams: Record<string, string>,
): Promise<void> {
  const query = new URLSearchParams(queryParams).toString();
  const url = query ? `${path}?${query}` : path;
  await harness.navigateByUrl(url);
}

/** Shorthand to navigate and return the routed component instance. */
export async function navigateToComponent<T>(
  harness: RouterTestingHarness,
  url: string,
  componentType: Type<T>,
): Promise<T> {
  await harness.navigateByUrl(url);
  return harness.routeDebugElement!.componentInstance as T;
}
