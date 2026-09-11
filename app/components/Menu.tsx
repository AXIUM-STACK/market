'use client'

import { X, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


export default function Menus() {

    const [menu, setMenu] = useState(false)
    return (
        <div>
            <button onClick={() => setMenu(!menu)} className='btn z-100 md:hidden'>
                {menu ? <X /> : <Menu />}
            </button>

            <div className={`absolute left-0 ${menu ? "top-0" : "-top-full"} transition-all duration-700 h-fit w-full bg-transparent backdrop-blur-xl backdrop-brightness-120 backdrop-saturate-180 px-6`} onClick={() => setMenu(false)}>
                

                <div className="flex justify-evenly items-center mb-10">
                    <h1 className="text-2xl text-primary font-bold">Ecole du cinquantenaire</h1>
                    <X onClick={() => setMenu(false)}/>
                </div>
                <ul className='h-full flex justify-center items-center flex-col gap-5 mb-5'>
                    <li className="w-full">
                        <Link href={"./school"} className='btn btn-outline btn-primary btn-sm w-full p-3 rounded-full'>
                            A propos
                        </Link>
                    </li>

                    <li className="w-full">
                        <Link href={"./teachers"} className='btn btn-outline btn-primary btn-sm w-full p-3 rounded-full'>
                            Enseignants
                        </Link>
                    </li>

                    <li className="w-full">
                        <Link href={"./gallerie"} className='btn btn-outline btn-primary btn-sm w-full p-3 rounded-full'>
                            Gallerie
                        </Link>
                    </li>

                    <li className="w-full">
                        <Link href={"./activities"} className='btn btn-outline btn-primary btn-sm w-full p-3 rounded-full'>
                            Activités
                        </Link>
                    </li>

                    <li className="w-full">
                        <Link href={"./contacts"} className='btn btn-outline btn-primary btn-sm w-full p-3 rounded-full'>
                            Contacts
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}