import Link from "next/link";
import { TrackingSearch } from "@/components/TrackingSearch";
import { SITE } from "@/lib/site";

export default async function RastreoPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {SITE.companyName}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-16">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Rastreá tu encomienda
        </h1>
        <p className="mt-3 max-w-md text-center text-zinc-600">
          Este es el estado de tu envío. También podés buscar otro número acá abajo.
        </p>

        <div className="mt-8 flex justify-center">
          <TrackingSearch initialTrackingNumber={decodeURIComponent(trackingNumber)} />
        </div>
      </main>
    </div>
  );
}
