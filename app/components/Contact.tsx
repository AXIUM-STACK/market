
import img1 from "../assets/cont1.jpg"
import img2 from "../assets/cont2.jpg"
import Form from "./Form"
import Title from './Title'

const Contact = () => {
    return (
        <div id="Contact">
            <Title title="Contact" description="Restons en contact, communiquons..." />

            <div className="mb-3 px-1">
                <p className="title text-[13px] md:text-[16px]">L'école du cinquantenaire, étant parmi les plus bonnes écoles de la ville de Goma 
                    avec une réputation sans précedent, celle-ci représente le plus bon cadre d'enseignement, de formation et d'éducation. 
                </p>
                <p className="p text-[13px] md:text-[16px]">Pour obtenir beaucoup plus de détails de précision et d'information, contactez-nous
                    et obtenez des réponses à toutes vos questions d'éducation
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-2 px-2 bg-black">
                <div className="relative degradee">
                    <div className="absolute h-full w-full bg-black/40"></div>
                    <img src={img1.src} alt="Bus" className="h-full w-full object-cover"/>
                </div>

                <div className="relative degradee">
                    <div className="absolute h-full w-full bg-black/40"></div>
                    <img src={img2.src} alt="Salle de classe" className="h-full w-full object-cover"/>
                </div>
            </div>
        
            <h2 className="text-center titre font-bold md:text-xl underline py-2">Remplissez ce formulaire</h2>
            <Form />
        </div>
    )
}

export default Contact