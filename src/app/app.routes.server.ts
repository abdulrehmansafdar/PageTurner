import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'book/:id',
    renderMode: RenderMode.Server // Change from Prerender to Dynamic
  },
  {
    path: 'verify-email',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];