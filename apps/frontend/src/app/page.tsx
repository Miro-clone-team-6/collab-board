import { appConfig } from '@/shared/config/app-config';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{appConfig.name}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">{appConfig.description}</p>
      <p className="text-sm text-neutral-500">
        Boards may hold up to {appConfig.maxBoardObjects.toLocaleString('en-US')} objects.
      </p>
    </main>
  );
}
