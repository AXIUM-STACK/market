import React from 'react'
import Title from './Title'
import { BadgeQuestionMarkIcon } from 'lucide-react'
import Form from "./Form"

import Link from "next/link"

const questions = [
    {
        id: 1,
        title: "Première question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
    {
        id: 2,
        title: "Deuxième question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
    {
        id: 3,
        title: "Troisième question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
    {
        id: 4,
        title: "Quatrième question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
    {
        id: 5,
        title: "Cinquième question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
    {
        id: 6,
        title: "Sixième question",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Et incidunt, suscipit nostrum deserunt porro totam labore ipsum ut. Quis consequatur deserunt distinctio asperiores nisi molestiae totam aperiam iusto. Dolor, provident."
    },
]

const Questions = () => {
    return (
        <div id="Questions">
            <Title title="Avez-vous des questions ?"
                description='Rétrouvez ici des réponses à vos différentes questions' />

            <div className="grid md:grid-cols-2 gap-2 items-center bg-base-300 p-6">
                {questions.map((question, index) => (
                    <div key={index} className="bg-base-100 p-3 rounded-lg flex flex-col gap-2 translate_animate">
                        <div className="flex items-center gap-2">
                            <button className='p-3 rounded-full bg-success-opacity text-success'>
                                <BadgeQuestionMarkIcon className="" />
                            </button>
                            <div>
                                {/* <h3 className="font-bold"> {question.title} </h3> */}
                                <p className="text-xs md:text-sm text-gray-400"> {question.description} </p>
                            </div>
                        </div>
                        <div className="flex justify-end px-3 w-full">
                            <Link href={`https://wa.me/0985132446?text=${question.description}`} target='_blank' className="btn btn-warning btn-sm md:btn-md">
                                Envoyer
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <Title title="Votre question n'est pas là ?"
                description="Envoyer votre question personnalisée sur WhatsApp, sur Mail pour avoir plus de réponses" />

            <Form />
        </div>
    )
}

export default Questions