import img01 from "../assets/img1.jpg"
import img03 from "../assets/img2.jpg"
import img04 from "../assets/img3.jpg"
import img05 from "../assets/img4.jpg"
import img06 from "../assets/image.jpg"
import img07 from "../assets/img5.webp"
import Title from "../components/Title"

const cards = [
    {
        id: 1,
        image: img01,
        title: "Engagement",
        description: "Assurer un avenir radieux pour les étudiants et pour le pays",
    },
    {
        id: 2,
        image: img07,
        title: "Vision",
        description: "Transmettre les bonnes valeurs morales aux nouveaux techniciens",
    },
    {
        id: 3,
        image: img03,
        title: "Mission",
        description: "Participer au changement du monde, assurer un avenir technique radieux",
    },
    {
        id: 4,
        image: img05,
        title: "Nous",
        description: "Ecole du cinquantenaire, école de l'excellence",
    },
    {
        id: 5,
        image: img06,
        title: "Voies",
        description: "Transmettre l'excellence dans toutes les actions et pensées des apprenants",
    },
];

const Zone = () => {
    return (
        <div id="About">



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 bg-black">
                {cards.map((card) => (
                    <div className="card bg-base-100 image-full w-full h-100 shadow-sm" key={card.id}>
                        <figure className="overflow-hidden">
                            <img
                                src={card.image.src}
                                alt="IMAGE1" 
                                className="h-full w-full object-cover"/>
                        </figure>
                        <div className="card-body top-full translate-y-[-50%] overflow-hidden">
                            <h2 className="card-title font-bold text-lg text-gray-500">{card.title}</h2>
                            <p className="p">{card.description}</p>
                            <div className="hidden card-actions justify-end overflow-hidden">
                                <button className="btn btn-primary">Buy Now</button>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="titre flex justify-center items-center text-center font-bold md:py-0 py-22">
                    ORDRE, DISCIPLINE, RIGUEUR, EXCELLENCE
                </div>
            </div>




        </div>
    )
}

export default Zone