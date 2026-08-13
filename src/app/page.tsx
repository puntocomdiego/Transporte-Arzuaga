import Link from "next/link";
import { TrackingSearch } from "@/components/TrackingSearch";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">{SITE.companyName}</span>
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900">
            Acceso agencia
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-16">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Rastreá tu encomienda
        </h1>
        <p className="mt-3 max-w-md text-center text-zinc-600">
          Ingresá el número de envío que te dieron en la agencia para ver dónde está.
        </p>

        <div className="mt-8 flex justify-center">
          <TrackingSearch />
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          Realizamos envíos entre {SITE.destinations.join(", ")} y otros destinos.
        </p>
      </main>
    </div>
  );
}
