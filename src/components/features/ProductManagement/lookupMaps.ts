import { Seller } from "@/services/sellerService";
import { MultiCategory } from "@/types";

export function mapCategoryTitles(items: MultiCategory[]) {
  return Object.fromEntries(items.map((item) => [item.id, item.title]));
}

export function mapSellersById(items: Seller[]) {
  return Object.fromEntries(items.map((seller) => [seller.id, seller.name]));
}

export function mapBrandsToLookup(items: any[]) {
  return Object.fromEntries(
    items.map((brand) => [brand.id, { en: brand.name.en, ar: brand.name.ar }]),
  );
}
