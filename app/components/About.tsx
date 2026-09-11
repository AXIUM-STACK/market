// import img01 from "../assets/img1.jpg"
// import img02 from "../assets/background.png"
// import img03 from "../assets/img2.jpg"
// import img04 from "../assets/img3.jpg"
// import img05 from "../assets/img4.jpg"
// import img06 from "../assets/image.jpg"
// import img07 from "../assets/img5.webp"
import Title from "../components/Title"
import image1 from "../assets/sch3.jpg"
import AboutGrid from "./AboutGrid"

/*
const cards = [
    {
        id: 1,
        image: img01,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
    {
        id: 2,
        image: img07,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
    {
        id: 3,
        image: img03,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
    {
        id: 4,
        image: img04,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
    {
        id: 5,
        image: img05,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
    {
        id: 6,
        image: img06,
        title: "Nos services",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita, deserunt!",
    },
];

*/

const About = () => {
    return (
        <div id="About">
            <Title title="A Propos" description="Découvrez notre établissement" />

            {/* 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                {cards.map((card) => (
                    <div className="card bg-base-100 image-full w-full h-100 shadow-sm">
                        <figure>
                            <img
                                src={card.image}
                                alt="IMAGE1" 
                                className="h-full w-full object-cover"/>
                        </figure>
                        <div className="card-body top-full translate-y-[-50%]">
                            <h2 className="card-title font-bold text-lg p">{card.title}</h2>
                            <p className="title">{card.description}</p>
                            <div className="card-actions justify-end">
                                <button className="hidden btn btn-primary">Buy Now</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
*/}

            <div className="px-2 md:px-4 py-3">
                <div className="">
                    <p className="title text-[13px] md:text-[16px] degradee">
                        Œuvre du gouvernement provincial du Nord-Kivu, il a été conçu à l'occasion du cinquantième anniversaire de l'indépendance du pays.
                        Dirigée par une sœur religieuse, notre école a aussi deux directeurs des études, Un directeur de discipline et les enseignants de renommés.
                    </p>

                    <p className="p text-[13px] md:text-[16px] degradee">Ainsi, pour favoriser le dévéloppement de notre communauté, nous organisons quatre sections techniques, fournissant aux élèves
                        les connaissances et les compétences nécessaire pour développer le pays. Ces quatre sections sont: <span className="uppercase font-bold titre">électronique, aviation,
                            construction et petrochimie</span>
                    </p>
                </div>

                <div className="relative w-full h-120 md:h-150 pt-4 overflow-hidden degradee">
                    <div className="absolute h-full w-full bg-black/0" style={{backdropFilter: `blur(0px)`}}></div>
                    <img src={image1.src} alt="photo de l'école du cinquantenaire" className="h-full w-full object-cover" />
                </div>
            </div>

            <h1 className="titre underline font-bold md:text-xl text-[18px] text-center my-2">Notre organisation</h1>

            <AboutGrid />
            <div className="grid md:grid-cols-2 gap-4 px-2">
                <div>

                </div>
            </div>

        </div>
    )
}

export default About