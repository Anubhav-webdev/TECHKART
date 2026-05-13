import React from 'react';
import insta1 from '../assets/images/insta-item1.jpg';
import insta2 from '../assets/images/insta-item2.jpg';
import insta3 from '../assets/images/insta-item3.jpg';
import insta4 from '../assets/images/insta-item4.jpg';
import insta5 from '../assets/images/insta-item5.jpg';
import insta6 from '../assets/images/insta-item6.jpg';

const Instagram = () => {
     const images = [insta1, insta2, insta3, insta4, insta5, insta6];

     return (
          <section className="relative">
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                    {images.map((img, index) => (
                         <div key={index} className="overflow-hidden">
                              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                                   <img src={img} alt={`Instagram post ${index + 1}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                              </a>
                         </div>
                    ))}
               </div>
               <div className="absolute inset-0 flex items-end justify-center pb-8">
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white uppercase font-medium py-3 px-8 hover:bg-gray-700 transition-colors">
                         Follow us on Instagram
                    </a>
               </div>
          </section>
     );
};

export default Instagram;