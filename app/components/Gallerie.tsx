
import img1 from "../assets/campuszone.jpeg"
import img2 from "../assets/av.jpg"
import img3 from "../assets/avc5.jpg"
import img4 from "../assets/eo.jpg"
import img5 from "../assets/pc.jpg"
import img6 from "../assets/pc7.jpg"
import img7 from "../assets/cl.webp"
import img8 from "../assets/bibl.jpg"
import img9 from "../assets/info.jpg"


const galleries = [
    {
        id: 1,
        img: img2,
    },

    {
        id: 2,
        img: img3,
    },

    {
        id: 3,
        img: img4,
    },

    {
        id: 4,
        img: img5,
    },
]

const photos = [

    {
        id: 1,
        img: img6,
    },

    {
        id: 2,
        img: img7,
    },

    {
        id: 3,
        img: img8,
    },

    {
        id: 4,
        img: img9,
    },
]

const Gallerie = () => {
    return (
        <div>
            <div className="grid grid-cols-2 gap-2 background4 py-4">
                {galleries.map((gallerie) => (
                    <div className="overflow-hidden relative h-100 degradee" key={gallerie.id}>
                        <div className="overlay bg-black/40">
                            <img src={gallerie.img.src} alt="Gallerie éco-cinq" className="w-full h-full object-cover images" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full min-h-[110vh] relative" style={{
                backgroundImage: `url(${img1.src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
            }}>
                <div className="h-full w-full absolute bg-black/85 degradee"></div>
            </div>

            <div className="grid grid-cols-2 gap-2 background4 py-4">
                {photos.map((photo) => (
                    <div className="overflow-hidden relative h-80 md:h-100 degradee" key={photo.id}>
                        <div className="h-full w-full bg-black/40 absolute">
                            <img src={photo.img.src} alt="Gallerie éco-cinq" className="w-full h-full object-cover images" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Gallerie