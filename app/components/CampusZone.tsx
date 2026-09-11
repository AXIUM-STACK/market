import Gallerie from "./Gallerie"
import Title from "./Title"
import Zone from "./Zone"

const CampusZone = () => {
    return (
        <div id="CampusZone">
            <Title title="campuszone" description="Découvrez la vie à l'établissement" />

            <div>
                <div className="mb-3">
                    <p className="title text-[13px] md:text-[16px] degradee">Nous disposons des équipements, des endroits, des salles adaptées et appropriées
                        pour la bonne transmission de la matière. Nous disposons des bons laboratoires, d'un bibliothèque, des bureaux appropriés,
                        les matériels de travail adaptés pour marier la théorie à la pratique de nos futurs techniciens en électronique, petrochimie,
                        aviation et construction.
                    </p>
                    <p className="p text-[13px] md:text-[16px] degradee"> Nous organisons aussi des visites guidées, des stages, des séances pratiques de
                        compréhension en vue de préparer les futurs ingénieurs à la vie professionnelle et cela avec des équipements adaptés, des
                        formateurs compétents et dans des bonnes conditions.
                    </p>
                </div>

                <Gallerie />
                <Zone />
            </div>
        </div>
    )
}

export default CampusZone