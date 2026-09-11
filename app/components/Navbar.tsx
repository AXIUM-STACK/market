
"use client"


import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import background from "../assets/cart.png"
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useUser } from "@clerk/nextjs"

type Theme = "light" | "dark"


const Navbar = () => {

    const { user } = useUser()

    useEffect(() => {
        const addUser = async () => {
            if (user?.primaryEmailAddress?.emailAddress) {
                await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
                })
            }
        }
        addUser()
    }, [user])


    const pathname = usePathname() //récupérer le chemin de la page dans lequel nous sommes actuellement
    const [menuOpen, setMenuOpen] = useState(false)
    const navLinks = [

        { href: "/", label: "Acceuil" },
        { href: "/about", label: "Panier" },
        { href: "/teachers", label: "Evenements" },
        { href: "/gallerie", label: "Produits" },
        { href: "/contacts", label: "Contacts" },

    ]// Un tableau qui contient les liens de navigation, un tableau qui contient des objets json


    const renderLinks = (baseClass: string) => ( // fonction qui va nous permettre de map sur chaque élément dynamiquement en créant de bouton
        <>
            {navLinks.map(({ href, label }) => { //la fonction va itérer chaque élément, il va récuperer le href, le label ,...
                const isActive = pathname === href
                const activeClass = isActive ? "btn-success" : "btn_success_outline"
                return (
                    <Link
                        href={href}
                        key={href}
                        className={`${baseClass} ${activeClass} btn-sm flex gap-2 items-center`}
                    >
                        {label}
                    </Link>
                )
            })}

        </>
    )
    const savedTheme = localStorage.getItem("theme")
    // const initialTheme = savedTheme ? JSON.parse(savedTheme) : "";

    const [theme, setTheme] = useState<Theme>("light")
    // () => {
    //     if (initialTheme === "dark") {
    //         return initialTheme
    //     } return "light"
    // }

    useEffect(() => {
        localStorage.setItem("theme", theme)
    }, [theme])

    const handleTheme = (e: Theme) => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("light")
        }
        return document.documentElement.setAttribute("data-theme", e)
    }

    return (
        <div className='relative top-0 left-0 w-full backdrop-blur-xs background-transparent z-50'>
            <div className="px-5 md:px-10 py-4 relative">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="p-2">
                            <Image src={background} alt="Logo" className="h-10 w-10 p-2 rounded-full bg-success" />
                        </div>
                        <span className="font-extrabold text-success text-xl duration-500">
                            SMallBAGS
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button onClick={() => handleTheme(theme)} className='btn btn-sm sm:hidden flex backdrop-blur-[5px] bg-transparent text-success'>
                            {theme === "light" && <Sun className="h-4 w-4 " />}
                            {theme === "dark" && <Moon className="h-4 w-4" />}
                        </button>

                        <button
                            className="w-fit sm:hidden cursor-pointer hover:bg-base-300 p-2 rounded-lg transition-all duration-300"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <Menu className="w-4 h-4 text-success" />
                        </button>
                    </div>
                    <div className="hidden space-x-2 sm:flex items-center">
                        {renderLinks("btn btn-xs md:btn-sm")}
                    </div>
                    <button onClick={() => handleTheme(theme)} className='btn btn-sm hidden sm:flex backdrop-blur-[5px] bg-transparent text-success border border-success'>
                        {theme === "light" && <Sun className="h-4 w-4 " />}
                        {theme === "dark" && <Moon className="h-4 w-4" />}
                    </button>
                </div>
                <div className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all
                duration-300 sm:hidden z-50 ${menuOpen ? "left-0" : "-left-full"}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="p-2">
                                <Image src={background} alt="Logo" className="w-10 h-10 p-2 rounded-full bg-success" />
                            </div>
                            <span className="font-extrabold text-success text-xl duration-500">
                                SMallBAGS
                            </span>
                        </div>
                        <button
                            className="w-fit sm:hidden cursor-pointer bg-base-300 p-2 rounded-full h-8"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <X className="w-4 h-4 text-warning" />
                        </button>
                    </div>
                    {renderLinks("btn")}
                </div>


            </div>
        </div>
    )
}

export default Navbar