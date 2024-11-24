import React from 'react';
import { BookOpen, PenTool, Github, Linkedin } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">Dr. David Rodenas</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="https://github.com/drpicox" target="_blank"
                               rel="noopener noreferrer"><Github
                                className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer"/></a>
                            <a href="https://www.linkedin.com/in/davidrodenas/" target="_blank"
                               rel="noopener noreferrer"><Linkedin
                                className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer"/></a>
                            {/* <Mail className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer"/> */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/3 flex justify-center mb-8 md:mb-0">
                            <div className="relative">
                                <img
                                    src="/david2.jpeg"
                                    alt="David Rodenas"
                                    className="rounded-full w-48 h-48 object-cover border-4 border-gray-200"
                                />
                                <div
                                    className="absolute -bottom-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                                    PhD
                                </div>
                            </div>
                        </div>
                        <div className="md:w-2/3 md:pl-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Software Engineering Professional</h1>
                            <div className="flex items-center space-x-4 mb-6">
                                <span
                                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Software Engineering</span>
                                <span
                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Educator</span>
                                <span
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Researcher</span>
                            </div>
                            <p className="text-lg text-gray-600 mb-6">
                                Transforming software engineering practices with over three decades of hands-on
                                expertise.
                            </p>
                            <a
                                href="https://medium.com/@drpicox"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                <BookOpen className="w-5 h-5 mr-2"/>
                                Read My Articles
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">About Me</h2>
                <div className="prose prose-lg max-w-none">
                    <p className="mb-4">
                        Let me introduce myself, I&#39;m David Rodenas, PhD in Computer Science. My journey in the world of
                        computing began at the tender age of eight, kindling a passion that has only grown stronger over
                        the
                        years.
                    </p>
                    <p className="mb-4">
                        During my early teens, this passion manifested in ambitious projects: developing a CRM for a
                        local shop,
                        building a ray tracer, and experimenting with back-propagation neural networks using C and C++.
                        These
                        early experiences laid the foundation for what would become a lifelong commitment to the field
                        of
                        software engineering.
                    </p>
                    <p className="mb-4">
                        In 1998, I transitioned from hobbyist to professional, embarking on a career that has been as
                        challenging as it has been rewarding. Recognizing the importance of knowledge sharing in our
                        rapidly
                        evolving field, I began teaching as a side project in 2002, a practice that continues to enrich
                        both my
                        students and me.
                    </p>
                    <p className="mb-4">
                        My professional journey led me to join the Official Professional Association of Computer
                        Engineering of
                        Catalonia (COEINF) in 2008. And I had the privilege of serving as Vice-dean from 2016 to 2020,
                        during
                        which time I focused on promoting the concept of developer professionalism —a cause I continue
                        to
                        champion.
                    </p>
                    <p className="mb-4">
                        Since 2011, I&#39;ve been a regular speaker at professional events, sharing insights and promoting
                        discussions within our community. This aligns with my firm belief that knowledge shared is
                        knowledge
                        multiplied, a philosophy that brings me to platforms like Medium to engage with a broader
                        audience.
                    </p>
                    <p className="mb-4">
                        My multifaceted background as a researcher, educator, and industry consultant has provided me
                        with a
                        comprehensive and unique perspective on the software engineering landscape.
                    </p>
                    <p>
                        Currently, I&#39;m engaged in the vital task of documenting and disseminating contemporary software
                        engineering strategies. This work synthesizes my experiences as a researcher, educator, and
                        industry
                        consultant, aiming to contribute meaningfully to the ongoing evolution of our field. My goal is
                        to
                        encourage a culture of professionalism and continuous improvement within the software
                        engineering
                        community, helping to shape the future of our dynamic and essential profession.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <div className="flex items-center space-x-4">
                                <a href="https://github.com/drpicox" target="_blank"
                                   rel="noopener noreferrer"><Github className="w-5 h-5"/></a>
                                <a href="https://www.linkedin.com/in/davidrodenas/" target="_blank"
                                   rel="noopener noreferrer"><Linkedin className="w-5 h-5"/></a>
                                {/* <Mail className="w-5 h-5"/> */}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="https://medium.com/@drpicox" target="_blank"
                                       rel="noopener noreferrer">Articles</a></li>
                                {/* <li>Speaking</li>
                  <li>Research</li>
                  <li>Teaching</li> */}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Follow My Writing</h3>
                            <p className="mb-4">Get access to my latest articles and insights on software
                                engineering.</p>
                            <a
                                href="https://drpicox.medium.com/subscribe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-md"
                            >
                                <PenTool className="w-5 h-5 mr-2"/>
                                Subscribe on Medium
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                        <p>&copy; {new Date().getFullYear()} Dr. David Rodenas. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}


