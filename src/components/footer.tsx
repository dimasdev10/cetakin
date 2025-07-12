import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-primary text-white h-32 px-4 flex flex-col justify-center">
      <div className="flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center space-x-2 mb-2">
          <Image
            src="/logo-wm.png"
            alt="CetakIn Logo"
            width={40}
            height={40}
            className="rounded-md shadow-md"
          />
          <span className="text-lg font-bold tracking-widest">W&M.</span>
        </Link>

        <p className="text-xs text-white/80">
          &copy; {new Date().getFullYear()} W&M. Semua hak cipta dilindungi oleh
          undang-undang.
        </p>
      </div>
    </footer>
  );
}
