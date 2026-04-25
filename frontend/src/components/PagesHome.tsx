import type { SplatMetadata } from "@/types/splat";
import useSwr, { type Fetcher } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
const fetcher: Fetcher<SplatMetadata[]> = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<SplatMetadata[]>);
export default function PagesHome() {
  const { data, isLoading } = useSwr(
    "https://api-remember.theneocorner.com/splats",
    fetcher,
  );

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-slate-50 to-white px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your Splats
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse and manage your uploaded files
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {data?.length ?? 0} total
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : data?.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((splat) => (
              <li key={splat.id}>
                <Card className="h-full rounded-xl border-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-base font-semibold text-slate-800">
                      {splat.filename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://remember.theneocorner.com/splats/${splat.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Details
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              No splats yet. Add one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
