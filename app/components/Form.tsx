
import Image from "next/image"
import Link from "next/link"
import whatsapp from "../assets/Black whatsapp.png"
import bagImage from "../assets/ps3.jpg"

const Form = () => {
    return (
        <div className="w-full flex justify-center items-center px-3 flex-col md:flex-row gap-2">

            <div className="w-full p-6 bg-base-200 flex flex-col gap-2">
                <Link href={`https://wa.me/0985132446?text="Bonjour. J'aimerai avoir des réponses sur SMallBAGS`} className="rounded-lg bg-base-100 flex items-center gap-2 p-3 translate_animate">
                    <div className="overflow-hidden h-10 min-w-10 rounded-full bg-success">
                        <Image src={whatsapp} alt="WhatsApp" className="h-full w-full object-cover" />
                    </div>
                    <p className="text-gray-400 text-sm md:text-md">
                        Ecrivez nous sur whatsApp pour plus de réponses
                    </p>
                </Link>
                <div className="h-85 w-full overflow-hidden rounded-lg translate_animate">
                    <Image src={bagImage} alt="SMallBAG" className="h-full w-full object-cover" />
                </div>
            </div>

            <form action="" className="w-full h-auto bg-transparent p-3 grid gap-3 rounded-xl translate_animate">
                <fieldset className="title_gradient font-semibold flex items-center"> Envoyez-nous votre message </fieldset>
                <input type="text" placeholder="Entrez votre nom Ex: Doe" className="input input-bordered input-success bg-transparent rounded-lg w-full h-8 border-success" />
                <input type="text" placeholder="Entrez votre prénom Ex:John" className="input input-bordered input-success bg-transparent rounded-lg w-full h-8 border-success" />
                <input type="email" placeholder="test@example.com" className="input input-bordered input-success bg-transparent rounded-lg w-full h-8 border-success" />
                <textarea name="" id="" placeholder="Entrez l'objet de votre message" className="textarea border-warning bg-transparent rounded-xl w-full resize-none h-20"></textarea>
                <input type="submit" value="Envoyer" className="w-full border border-success btn btn-success" />
            </form>
        </div>
    )
}

export default Form