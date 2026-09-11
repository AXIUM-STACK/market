
import image1 from "../assets/background1.jpg"
import image2 from "../assets/background.jpg"
import image3 from "../assets/homep.jpg"
import image4 from "../assets/ps00.jpg"
import image5 from "../assets/ps04.jpg"
import image6 from "../assets/ps3.jpg"
import image7 from "../assets/ps0.jpg"
import Image from "next/image"


const grids = [
    {
        id: 1,
        image: image1,
        sticky: "",
        position: "md:flex-row-reverse",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 2,
        image: image2,
        sticky: "",
        position: "",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 3,
        image: image3,
        sticky: "sticky top-20 left-0",
        position: "md:flex-row-reverse",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 4,
        image: image4,
        sticky: "sticky top-25 left-0",
        position: "",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 5,
        image: image5,
        sticky: "sticky top-30 left-0",
        position: "md:flex-row-reverse",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 6,
        image: image6,
        sticky: "sticky top-35 left-0",
        position: "",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },

    {
        id: 7,
        image: image7,
        sticky: "",
        position: "md:flex-row-reverse",
        title: "Lorem Ipsum",
        description: "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog",
    },
]



const AboutGrid = () => {
    return (
        <div className="grid gap-3 py-3 px-2 w-full">
            {grids.map((grid) => (
                <div key={grid.id} className={`flex flex-col md:flex-row md:justify-between items-center w-full ${grid.sticky} left_animate`}>
                    <div className={`w-full relative h-100 rounded-lg overflow-hidden md:flex justify-center items-center gap-2 ${grid.position} bg-base-100 shadow_color`}>
                        <div className="h-full w-full bg-black/30">
                            <Image src={grid.image} alt="Images liées à l'à-propos du site" className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute md:relative top-0 left-0 w-full h-full md:py-0 p-3 flexflex-col backdrop-blur-[3px]">
                            <div className="w-full h-full md:bg-base-100 flex md:justify-center justify-between items-center flex-col">
                                <div className="text-center p-6 md:bg-base-300 rounded-lg w-[80%] max-w-150">
                                    <h3 className="text-xl font-bold text-success title_gradient text-center"> {grid.title} </h3>
                                    <p className="text-xs md:text-sm font-semibold md:text-left text-gray-400"> {grid.description} </p>
                                </div>

                                <div className="flex justify-end md:justify-center p-3 w-full">
                                    <button className="title btn btn-warning md:btn-md btn-sm w-full md:w-fit">
                                        En savoir plus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    )
}

export default AboutGrid