"use client"

import React, { useEffect, useState } from 'react'
import Title from './Title'
import img1 from "../assets/img08.jpg"
import img2 from "../assets/img01.jpg"
import img3 from "../assets/img03.jpg"
import img4 from "../assets/img04.jpg"
import img5 from "../assets/img05.jpg"
import img6 from "../assets/img06.jpg"
import img7 from "../assets/img07.jpg"
import img8 from "../assets/homep.jpg"
import img9 from "../assets/img09.jpeg"
import img10 from "../assets/img10.jpg"
import img11 from "../assets/img11.jpg"
import img12 from "../assets/img12.jpg"
import img13 from "../assets/ps01.jpg"
import img14 from "../assets/ps02.jpg"
import img15 from "../assets/ps2.jpg"
import img16 from "../assets/ps03.jpg"
import img17 from "../assets/ps5.jpg"
import img18 from "../assets/ps8.jpg"
import Image, { StaticImageData } from 'next/image'
import { ArrowRight, ShoppingCartIcon, Trash2 } from 'lucide-react'

type Pictures = {
    id: number,
    image: StaticImageData,
    imgSize: string,
    filter: string,
    title: string,
    description: string,
    href: string,
    animation: string,
    price: number,
}

type Filter = "school" | "teacher" | "labo"


const pictures: Pictures[] = [
    {
        id: 1,
        image: img8,
        imgSize: "object-cover",
        filter: "Tous",
        title: "Bienvenu sur SMallBAGS",
        description: "Votre satisfaction est notre priorité",
        href: "/",
        animation: "image_animate",
        price: 14000,
    },
    {
        image: img1,
        imgSize: "object-cover",
        filter: "school",
        title: "Produit1",
        description: "Logo de l'école du cinquantenaire",
        href: "/",
        animation: "",
        id: 2,
        price: 14000,
    },

    {
        image: img2,
        imgSize: "object-cover",
        filter: "teacher",
        title: "Produit2",
        description: "The quick brown fox jumps over the lazsy dog",
        href: "/",
        animation: "",
        id: 3,
        price: 14000,
    },

    {
        image: img3,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit3",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 4,
        price: 14000,
    },

    {
        image: img5,
        imgSize: "object-cover",
        filter: "school",
        title: "Produit4",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 5,
        price: 14000,
    },

    {
        image: img7,
        imgSize: "object-cover",
        filter: "school",
        title: "Produit5",
        description: "T-SHirt dans le bon, magasin, disponible chez papa kasé",
        href: "/",
        animation: "",
        id: 6,
        price: 14000,
    },

    {
        image: img6,
        imgSize: "object-cover",
        filter: "school",
        title: "Produit6",
        description: "The quick brown fox jumps  over the lazy dog",
        href: "/",
        animation: "",
        id: 7,
        price: 14000,
    },

    {
        image: img4,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit7",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 8,
        price: 14000,
    },

    {
        image: img9,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit8",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 9,
        price: 14000,
    },

    {
        image: img10,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit9",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 10,
        price: 14000,
    },

    {
        image: img11,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit10",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 11,
        price: 14000,
    },

    {
        image: img12,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit11",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 12,
        price: 14000,
    },


    {
        image: img13,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit12",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 13,
        price: 14000,
    },

    {
        image: img14,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit13",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 14,
        price: 14000,
    },

    {
        image: img15,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit14",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 15,
        price: 14000,
    },


    {
        image: img16,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit15",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 16,
        price: 14000,
    },

    {
        image: img17,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit16",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 17,
        price: 14000,
    },

    {
        image: img18,
        imgSize: "object-cover",
        filter: "labo",
        title: "Produit17",
        description: "The quick brown fox jumps over the lazy dog",
        href: "/",
        animation: "",
        id: 18,
        price: 14000,
    },
]

const FilteredPictures = () => {
    const [filter, setFilter] = useState<Filter | "Tous">("Tous")
    const [appar, setAppar] = useState(false)
    const [nameInput, setNameInput] = useState<string>("")
    const [classInput, setClassInput] = useState<string>("")
    const [mailInput, setMailInput] = useState<string>("")

    const savedCommands = localStorage.getItem("commands")
    const initialCommands = savedCommands ? JSON.parse(savedCommands) : []
    const [commands, setCommands] = useState<Pictures[]>(initialCommands)

    useEffect(() => {
        localStorage.setItem("commands", JSON.stringify(commands))
    }, [commands])

    let filtered: Pictures[] = []
    if (filter === "Tous") {
        filtered = pictures
    } else {
        filtered = pictures.filter((todo) => todo.filter === filter)
    }

    function addCommands(object: Pictures) {
        // if (commands.length === 0) {
        //     return;
        // }
        const newCommand: Pictures = object;

        const NewCommands = [newCommand, ...commands]
        setCommands(NewCommands)
        console.log(NewCommands)

        return NewCommands
    }
    function deleteCommand(id: number) {
        const newCommands = commands.filter((command) => command.id !== id)
        setCommands(newCommands)
    }

    const totalPrice = commands.reduce((acc, command) => {
        return acc + command.price
    }, 0)


    return (
        <div className="relative w-full" id='Produits'>
            <Title title="Produits" description="Decouvez les produits encore disponibles sur la plate-forme" />
            <div className="flex items-center gap-3 justify-center py-3 sticky top-20 left-0 w-full z-40 backdrop-blur-[5px] backdrop-contrast-150">
                <button className={`btn ${filter === "Tous" ? "btn-warning" : "btn_warning_outline"} btn-xs md:btn-sm text-white`} onClick={() => setFilter("Tous")}>Tous</button>
                <button className={`btn ${filter === "school" ? "btn-warning" : "btn_warning_outline"} btn-xs md:btn-sm`} onClick={() => setFilter("school")}>En vente</button>
                <button className={`btn ${filter === "labo" ? "btn-warning" : "btn_warning_outline"} btn-xs md:btn-sm`} onClick={() => setFilter("labo")}>Promo</button>
                <button className={`btn ${filter === "teacher" ? "btn-warning" : "btn_warning_outline"} btn-xs md:btn-sm`} onClick={() => setFilter("teacher")}>Dispo</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 items-center">
                {filtered.map((filt, index) => (
                    <div key={index} className={`scale_animate`}>
                        <div className='h-70 md:h-100 rounded-t-lg overflow-hidden' onClick={() => setAppar(!appar)}>
                            <Image src={filt.image} alt={filt.description} className={`h-full w-full ${filt.imgSize} ${filt.animation}`} />
                        </div>
                        <div className='flex flex-col gap-2 bg-base-300 py-3 rounded-b-lg'>
                            <div className="text-center">
                                <h1 className='text-center font-bold text-success'>{filt.title} </h1>
                                <p className='text-gray-500 text-[14px]'> {filt.description} </p>
                            </div>
                            <div className="flex gap-2 justify-center items-center overflow-hidden">
                                <button className='btn md:btn-sm btn-xs btn_warning_outline' onClick={() => addCommands(filt)}>Commander</button>
                                {/* Open the modal using document.getElementById('ID').showModal() method */}
                                <button className="btn md:btn-sm btn-xs gap-1 btn-success" onClick={() => (document.getElementById(`${filt.id}`) as HTMLDialogElement).showModal()}>Ajouter <ShoppingCartIcon className="w-4 h-4" /></button>
                                <dialog id={`${filt.id}`} className="modal">
                                    <div className="modal-box">
                                        <form method="dialog">
                                            {/* if there is a button in form, it will close the modal */}
                                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-warning">✕</button>
                                        </form>
                                        <h3 className="font-bold text-lg text-success">{filt.title}</h3>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="overflow-hidden h-15 w-15 bg-base-100 p-2">
                                                <Image src={filt.image} alt={filt.title} className="h-full w-full object-cover mix-blend-darken" />
                                            </div>
                                            <p className="text-sm text-center">{filt.description}</p>
                                        </div>
                                        <div className="flex gap-2 w-full justify-center items-center">
                                            <form className="w-1/3 py-3" method="dialog">
                                                <button className="btn btn-warning btn-sm w-full" onClick={() => addCommands(filt)}> Commander </button>
                                            </form>
                                            <div className="w-1/3 flex justify-center items-center">
                                                <button className="badge badge-success text-white badge-sm w-fit animate-bounce"> {filt.price}fc </button>
                                            </div>
                                        </div>
                                    </div>
                                </dialog>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {commands.length === 0 ? (
                <div></div>
            ) : (
                <div className={`z-50 fixed bottom-5 right-5 text-white command_animate bg-warning rounded-full duration-700`} onClick={() => (document.getElementById('shop') as HTMLDialogElement).showModal()}>
                    <div className="p-2 relative w-full h-full">
                        <ShoppingCartIcon />
                        <div className="absolute -top-2 right-0 text-gray-400">
                            {commands.length}
                        </div>
                    </div>
                </div>
            )}

            <dialog id="shop" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-sm md:text-md title_gradient text-gray-400">Passez votre commande</h3>
                    <div className="grid grid-cols-3 gap-2 items-center w-full py-2">
                        {commands.map((command, index) => (
                            <div key={index} className="flex flex-col gap-2 justify-center items-center bg-base-300 py-2 rounded-lg">
                                <div className="h-10 w-10 overflow-hidden">
                                    <Image src={command.image} alt={`commande -${command.id}`} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="badge bg-success-opacity badge-xs text-success">
                                        {command.price}fc
                                    </div>
                                    <button className="btn btn-xs bg-warning-opacity">
                                        <Trash2 className="h-4 w-4 text-warning" onClick={() => deleteCommand(command.id)} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="py-2">
                        <button className="badge badge-warning w-full badge-sm py-2 text-white "> Total: {totalPrice}fc </button>
                    </div>
                    <form method="dialog">
                        <button className="btn btn-sm w-full btn-success" onClick={() => (document.getElementById('form') as HTMLDialogElement).showModal()}
                            disabled={commands.length === 0}
                        >
                            Suivant <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </dialog>

            <dialog id="form" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-sm md:text-md title_gradient text-gray-400">Entez vos identités</h3>
                    <div className="py-4 flex flex-col gap-2 w-full">
                        <input type="text" placeholder="Entrez votre nom"
                            value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                            required
                            className="input input-bordered w-full input-sm" />
                        <input type="text" placeholder="Entrez votre classe"
                            value={classInput} onChange={(e) => setClassInput(e.target.value)}
                            required
                            className="input input-bordered w-full input-sm" />
                        <input type="email" placeholder="Adresse mail Exemple:text@example.com"
                            value={mailInput} onChange={(e) => setMailInput(e.target.value)}
                            required
                            className="input input-bordered w-full input-sm" />
                        <form method="dialog">
                            <input type="submit" value="Envoyer" className="w-full btn btn-sm btn-success"
                                disabled={
                                    nameInput.trim() === "" || classInput.trim() === "" || mailInput.trim() === ""
                                }
                            />
                        </form>
                    </div>

                </div>
            </dialog>

        </div>
    )
}

export default FilteredPictures