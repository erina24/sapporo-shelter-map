import ShelterExplorer from "@/components/ShelterExplorer";
import shelterData from "@/data/shelters.json";

export default function Home() {
  const { shelters, source } = shelterData;

  return (
    <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-8 sm:py-9 lg:px-10">
      <header className="mb-6 flex items-center gap-3.5 sm:mb-8 sm:gap-4">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-900 sm:size-14">
          <span className="grid size-5 -translate-y-0.5 -rotate-45 place-items-center rounded-[50%_50%_50%_0] bg-white sm:size-6">
            <span className="size-2 rounded-full bg-navy-900" />
          </span>
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            札幌防災マップ
          </h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">GIS学習・ポートフォリオ作品</p>
        </div>
      </header>

      <ShelterExplorer />

      <footer className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
        <p>
          実際の避難判断には、
          <a className="font-semibold text-navy-800 underline underline-offset-4" href="https://bousai.city.sapporo.jp/">
            さっぽろ防災ポータル
          </a>
          で最新情報を確認してください。
        </p>
        <p>
          指定避難所（基幹）を一部掲載（{shelters.length}件）。
          出典は
          <a className="font-medium text-navy-800 underline underline-offset-4" href={source.url}>
            札幌市「避難場所一覧（全区）」
          </a>
          （CC BY 4.0、確認日 {source.checkedOn}）。
        </p>
      </footer>
    </main>
  );
}
