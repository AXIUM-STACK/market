
import whatsApp from "../assets/Black whatsapp.png"
import youtube from "../assets/Black Youtube.png"
import facebook from "../assets/Black Facebook.png"
import instagram from "../assets/Black Instagram.png"
import messenger from "../assets/Black messenger.png"
import mail from "../assets/Black mail.png"
import Image from "next/image"
import Link from "next/link"

const FooterLinks = [
    {
        id: 1,
        image: whatsApp,
        href: "/",
    },
    {
        id: 2,
        image: mail,
        href: "/",
    },
    {
        id: 3,
        image: messenger,
        href: "/",
    },
]

const FooterLinks2 = [
    {
        id: 1,
        image: facebook,
        href: "/",
    },
    {
        id: 2,
        image: instagram,
        href: "/",
    },
    {
        id: 3,
        image: youtube,
        href: "/",
    },
]

const Footer = () => {
    return (
        <footer className="footer grid md:grid-cols-2 items-center bg-base-300 text-base-content rounded p-4 pb-2 w-full translate_animate">
            <div className="flex flex-col w-full gap-5 justify-between h-30 overflow-hidden bg-base-100 rounded-lg p-4">
                <div className="flex justify-center items-center gap-4 w-full">
                    <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#About" >A Propos</Link>
                    <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Contacts" >Contacts</Link>
                    <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Home" >Acceuil</Link>
                    <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Produits" >Produits</Link>
                </div>

                <div className="flex flex-col w-full gap-5 justify-between">
                    <div className="flex justify-center items-center gap-4 w-full">
                        <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#About" >A Propos</Link>
                        <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Contacts" >Contacts</Link>
                        <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Questions" >Questions</Link>
                        <Link className="link link-hover btn-xs btn title_gradient border border-success" href="#Produits" >Produits</Link>
                    </div>
                </div>
            </div>
                <div className="flex flex-col gap-2 justify-center items-center w-full">
                    <div className="flex justify-between items-center w-full">
                        {FooterLinks2.map((link, index) => (
                            <Link href={link.href} key={index} target="_blank" className="flex justify-center items-center">
                                <div className="overflow-hidden w-10 h-10 bg-warning rounded-full">
                                    <Image src={link.image} alt={`FooterLink ${link.id}`} className="h-full w-full object-cover" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="flex justify-between items-center gap-2 w-full py-4">
                        <Link href={``} target="_blank" className="flex justify-center items-center">
                            <div className="overflow-hidden w-10 h-10 bg-warning rounded-full">
                                <Image src={mail} alt={`Mail`} className="h-full w-full object-cover" />
                            </div>
                        </Link>
                        <div className="text-center text-gray-400">
                            <p >Copyright © <span className="font-bold">SM<span className="text-warning">all</span>BAGS</span>{new Date().getFullYear()} - Tous les droits sont reservés</p>
                            <p>Designed by <a href="mailto:theophilerar@gmail.com"><span className="title_gradient font-bold ml-1">RARTech</span></a></p>
                        </div>
                        <Link href={``} target="_blank" className="flex justify-center items-center">
                            <div className="overflow-hidden w-10 h-10 bg-warning rounded-full">
                                <Image src={whatsApp} alt={`WhatsApp`} className="h-full w-full object-cover" />
                            </div>
                        </Link>
                    </div>

                    <div className="flex justify-between items-center w-full">
                        {FooterLinks.map((link, index) => (
                            <Link href={link.href} key={index} target="_blank" className="flex justify-center items-center">
                                <div className="overflow-hidden w-10 h-10 bg-warning rounded-full">
                                    <Image src={link.image} alt={`FooterLink ${link.id}`} className="h-full w-full object-cover" />
                                </div>
                            </Link>
                        ))}
                    </div>


                </div>

        </footer>
    )
}

export default Footer