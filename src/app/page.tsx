import { InteractiveLogo } from "@/components/InteractiveLogo";
import { MusicToggle } from "@/components/MusicToggle";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="ritual-page" aria-label="Ritual Nexus resource shortcuts">
      <Image
        src="/ritual-starfield.jpg"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="select-none object-cover"
      />
      <h1 className="sr-only">Ritual Nexus</h1>
      <p className="corner-text corner-text--top-left">Ritual Nexus</p>
      <p className="corner-text corner-text--bottom-left">Ritual Testnet</p>
      <p className="corner-text corner-text--bottom-right">Powered by Ritual</p>
      <MusicToggle />
      <InteractiveLogo />
      <Link href="/onnx" className="onnx-entry">
        ONNX AI
      </Link>
    </main>
  );
}
