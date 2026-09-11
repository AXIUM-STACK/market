
import background from "../assets/img01.jpg"
const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen flex-col text-center background relative" style={{
      backgroundImage: `url(${background.src})`,
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      backgroundSize: "cover"
    }}>
      <div className="h-full w-full absolute bg-black/70 backanimation"></div>
      <h1 className="text-[25px] md:text-4xl font-bold p_home text-center uppercase z-10"> école du <span className="title_home px-2">cinquantenaire</span> / goma </h1>
      <p className="title_home font-semibold text-[15px] md:text-xl z-10"> Ordre, Discipline, Rigueur, Excellence</p>
    </div>
  )
}

export default Home