import Link from "next/link";

const Header = () => {
    return (
        <div className="w-full bg-neutral-800 flex flex-row items-center justify-between px-16">
            <h1 className="h-24 text-4xl flex items-center font-bold">Saas Untlited</h1>
            <li className="flex flex-row gap-10">
               <Link href="/">Home</Link>
               <Link href="/">Pag 2</Link>
               <Link href="/">Pag 3</Link>
               <Link href="/">Pag 4</Link>
            </li>
        </div>
    );
}

export default Header;