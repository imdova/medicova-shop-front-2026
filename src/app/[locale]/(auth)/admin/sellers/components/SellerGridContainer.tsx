"use client";

import React from "react";
import { Seller } from "@/types/product";
import { LanguageType } from "@/util/translations";
import SellerCard from "@/components/features/cards/SellerCard";
import { Pagination } from "@/components/shared/Pagination";

interface SellerGridContainerProps {
  data: Seller[];
  locale: LanguageType;
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

const SellerGridContainer: React.FC<SellerGridContainerProps> = ({
  data,
  locale,
  totalItems,
  itemsPerPage,
  currentPage,
}) => {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}

        />
      </div>
    </div>
  );
};

export default SellerGridContainer;
