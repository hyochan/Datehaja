import { LinkButton } from "../components/ui/primitives";
import { Logo } from "../components/layout/Logo";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <Logo className="mb-5 h-12 w-12 opacity-60" />
      <h1 className="mb-2 font-display text-[30px] leading-tight">
        Nothing dropped here.
      </h1>
      <p className="mb-7 text-[15.5px] leading-relaxed text-soft">
        That page doesn't exist — or the DateDrop it pointed at has already come
        and gone.
      </p>
      <LinkButton to="/dashboard" size="lg">
        Back to your DateDrops
      </LinkButton>
    </div>
  );
}
