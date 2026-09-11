interface TitleProps {
    title: string,
    description: string
}
const Title = ({ title, description }: TitleProps) => {

    return (
        <div className="flex justify-center items-center flex-col py-4 background3 px-6 text-center">
            <h1 className="font-bold text-2xl md:text-3xl uppercase animate-pulse text-warning">{title}</h1>
            <p className="text-xs md:text-sm p">{description}</p>
        </div>
    )
}

export default Title