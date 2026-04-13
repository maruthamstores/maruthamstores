
import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-700">
      <div className="max-w-[960px] mx-auto w-full sm:px-12">
        {/* Header Image */}
        <img
          src="https://d3k81ch9hvuctc.cloudfront.net/company/dZdz7j/images/eafecb80-cc96-431b-804d-5f1a1d4f0966.png"
          alt="Marutham Stores Header"
          className="w-full h-auto sm:h-[350px]"
        />

        {/* Spacer */}
        <div className="px-5">

          {/* Main Content */}
          <div className="text-lg leading-7">
            <h1 className="font-serif text-3xl sm:text-4xl text-yellow-700 uppercase tracking-[3px] text-center mb-10">
              Welcome to MARUTHAM STORES
            </h1>

            <p className="mb-5">
             Our brand name, “MARUTHAM,” is derived from Marutham Thinai, which represents paddy fields and agricultural landscapes. We are committed to sourcing and promoting products from farmers, women entrepreneurs, and self-help groups.

   Our primary vision is to deliver high-quality products to consumers by connecting them with genuine and dedicated producers. We strive to support and build a self-sustaining farming system, encourage a self-reliant lifestyle, and contribute towards creating a self-sufficient India
            </p>

            <h2 className="font-serif text-xl sm:text-2xl text-gray-600 uppercase tracking-wider mt-8 mb-4">
              → Our Products
            </h2>
            <ul className="list-disc list-outside ml-5 mb-5">
              <li>Varieties of Snack items</li>
              <li>Natural Hair Oil</li>
              <li>Fabrics</li>
              <li>Pickle items</li>
              <li>...and more coming soon!</li>
            </ul>
            <p className="mb-5">
              Every product is made with carefully selected natural ingredients, free
              from harsh chemicals,
              way nature intended.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl text-gray-600 uppercase tracking-wider mt-8 mb-4">
              → Our Mission
            </h2>
            <ul className="list-disc list-outside ml-5 mb-5">
              <li>Starting in-house production</li>
              <li>Designing a full-featured e-commerce website</li>
              <li>Launching new product lines</li>
              <li>Bringing more 100% herbal and organic product options to market</li>
            </ul>
            <p className="mb-5">
              Our mission is to create a brand that represents purity, trust, and
              effectiveness — all while being affordable and accessible to everyone.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl text-gray-600 uppercase tracking-wider mt-8 mb-4">
              → Our Vision
            </h2>
            <ul className="list-disc list-outside ml-5 mb-5">
              <li>
                To become the world's most trusted and loved natural Food and
                Fabric brand, rooted in Marutham Stores values
              </li>
              <li>To deliver the best quality at the best price</li>
              <li>To open multiple hubs and stores across India and beyond</li>
            </ul>
            <p className="mb-5">
              We believe true beauty lies in nature. With every product, we aim to
              bring you closer to a more natural, safe, and sustainable lifestyle.
            </p>

            {/* Core Values */}
            <h2 className="font-serif text-xl sm:text-2xl text-green-900 font-bold uppercase tracking-wider text-center mt-10 mb-6">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  img: "https://img.icons8.com/ios-filled/80/0a3d0a/ok--v1.png",
                  title: "Quality & Authenticity",
                  text: "Only genuine, high-quality products from trusted brands.",
                },
                {
                  img: "https://img.icons8.com/ios-filled/80/0a3d0a/customer-support.png",
                  title: "Customer First",
                  text: "Your satisfaction and confidence are our top priorities.",
                },
                {
                  img: "https://img.icons8.com/ios-filled/80/0a3d0a/conference.png",
                  title: "Diversity & Inclusion",
                  text: "Beauty for all—celebrating every skin tone, type, and style.",
                },
                {
                  img: "https://img.icons8.com/ios-filled/80/0a3d0a/delivery.png",
                  title: "Fast Delivery",
                  text: "Quick, reliable shipping and easy service.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-5"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-[50px] h-[50px] mx-auto mb-2"
                  />
                  <h4 className="text-lg text-green-900 font-semibold mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-5">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Signature */}
            <h6 className="font-sans text-2xl sm:text-3xl text-yellow-700 font-bold text-center mt-8 mb-2">
              NATURE MARUTHAM STORES
            </h6>
           
          </div>

          {/* Footer Image */}
          <img
            src="https://d3k81ch9hvuctc.cloudfront.net/company/dZdz7j/images/676a222a-e1bd-4bef-8b52-c2454e94164c.png"
            alt="Marutham Stores Footer"
            className="w-full h-auto"
          />

          {/* Spacer and Divider */}
          <div className="h-[30px]"></div>
          <div className="h-[1px] bg-gray-200"></div>
          <div className="h-[10px]"></div>

          {/* Discover More */}
          <div className="text-center text-base text-gray-500 font-bold uppercase tracking-wider py-8">
            Discover More
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link
              to="/login"
              className="w-full sm:w-[295px]"
            >
              <img
                src="https://d3k81ch9hvuctc.cloudfront.net/company/dZdz7j/images/49e55025-8a8c-441c-acd9-a96e8e42d09d.png"
                alt="Sign Up / Login"
                className="w-full h-auto"
              />
            </Link>
            <Link 
              to="/category"
              className="w-full sm:w-[295px]"
            >
              <img
                src="https://d3k81ch9hvuctc.cloudfront.net/company/dZdz7j/images/ebb42a62-3905-4fac-847e-571420b47dc1.jpeg"
                alt="Go to Categories"
                className="w-full h-auto"
              />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
