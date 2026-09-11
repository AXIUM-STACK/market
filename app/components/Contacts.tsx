import React from 'react'
import Title from './Title'
import Questions from "./Questions"

import img1 from "../assets/Black Facebook.png"
import img2 from "../assets/Black Youtube.png"
import img3 from "../assets/Black mail.png"
import img4 from "../assets/Black whatsapp.png"
import img5 from "../assets/Black Instagram.png"
import img6 from "../assets/Black messenger.png"
import Image from 'next/image'
import Link from 'next/link'


const ContactLinks = [
    {
        id: 1,
        image: img1,
        href: "/",
        description: "Facebook",
    },

    {
        id: 2,
        image: img2,
        href: "/",
        description: "YouTube",
    },

    {
        id: 3,
        image: img3,
        href: "/",
        description: "Mail",
    },

    {
        id: 4,
        image: img4,
        href: "/",
        description: "WhatsApp",
    },

    {
        id: 5,
        image: img5,
        href: "/",
        description: "Instagram",
    },

    {
        id: 6,
        image: img6,
        href: "/",
        description: "Messenger",
    },
]

const Contacts = () => {
    return (
        <div id="Contacts">
            <Title title="Contacts"
                description="Rétrouvez plus d'informations, plus de produits, plus de choix et plus d'aide en nous contactant" />

            <div className="grid grid-cols-6 gap-2 items-center w-full max-w-250 mx-auto bg-base-200">
                {ContactLinks.map((link, index) => (
                    <Link href={link.href} key={index} className='flex flex-col items-center justify-center gap-1 py-6 w-full'>
                        <div className="md:w-14 md:h-14 w-10 h-10 bg-success rounded-full overflow-hidden">
                            <Image src={link.image} alt={link.description} className="h-full w-full object-cover animate-spin" />
                        </div>
                        <span className='text-xs md:text-sm text-gray-400'>
                            {link.description}
                        </span>
                    </Link>
                ))}
            </div>
            <div className='w-full'>
                <Questions />
            </div>
        </div>
    )
}

export default Contacts