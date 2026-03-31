import React, { lazy, Suspense } from "react";
import Hero from "./Hero";
import Category from "./Category";
import PromotionBanner from "../../components/PromotionBanner";

// Lazy load below-the-fold components for faster initial page load
const CollectionSection = lazy(() => import("../../components/CollectionSection"));
const BestSellingProduct = lazy(() => import("./BestSellingProduct"));
const ReviewList = lazy(() => import("./ReviewList"));

const Home = () => {
  const bgUrl = `${import.meta.env.BASE_URL}project_bg.png`;

  return (
    <>
      <div className="relative p-0 m-0 overflow-hidden bg-[#f9fbf9]">
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.5]"
          style={{
            backgroundImage: `url('${bgUrl}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '1000px',
            backgroundPosition: '150px 100px'
          }}
        />
        <div className="relative z-10">
          <Hero />
          <Category />
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <PromotionBanner
              image="/snack.png"
              alt="Traditional Snacks Banner"
              link="/product?category=Snacks"
            />
            <CollectionSection
              title="Our Food Products "
              subtext="tasty and healthy snacks"
              categoryName="Food Products"
            />

            <PromotionBanner
              image="/skincare_1600x375.png"
              alt="Skin and Hair Care Banner"
              link="/product?category=Skin And Hair"
            />
            <CollectionSection
              title="Our Hair And Skin Care Collection"
              subtext="Restore your hair's natural shine with our organic treatments."
              categoryName="Skin And Hair"
            />
            <PromotionBanner
              image="/fabrics_banner.png"
              alt="Traditional Fabrics Banner"
              link="/product?category=Fabrics"
            />
            <CollectionSection
              title="Our Fabric Collections"
              subtext="Best Quality Fabrics."
              categoryName="Fabrics"
            />

            <BestSellingProduct />
            <ReviewList />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Home;
