import footerData from "./footer.json";
import headerData from "./header.json";
import categoriesData from "./categories.json";
import productsData from "./products.json";
import slidersData from "./sliders.json";
import brandsData from "./brands.json";
import productAttributesData from "./productAttributes.json";
import {
  FooterSection,
  AppLink,
  SocialMedia,
  PaymentMethod,
  LegalLink,
  linksHeader,
  CategoryType,
  MultiCategory,
  Slide,
  Brand,
} from "@/types";
import { Product, ProductAttribute } from "@/types/product";

export const getFooterData = () => {
  return footerData as {
    sections: FooterSection[];
    appLinks: AppLink[];
    socialMedia: SocialMedia[];
    paymentMethods: PaymentMethod[];
    legalLinks: LegalLink[];
  };
};

export const {
  sections: footerSections,
  appLinks: footerAppLinks,
  socialMedia: footerSocialMedia,
  paymentMethods: footerPaymentMethods,
  legalLinks: footerLegalLinks,
} = getFooterData();

export const getHeaderData = () => {
  return headerData as linksHeader[];
};

export const headerLinks = getHeaderData();

export const getCategoriesData = () => {
  return categoriesData as {
    medicalCategories: CategoryType[];
    equipmentCategories: CategoryType[];
    consumableCategories: CategoryType[];
    lifestyleCategories: CategoryType[];
    megaMenuCategories: MultiCategory[];
    allCategories: CategoryType[];
  };
};

export const {
  medicalCategories,
  equipmentCategories,
  consumableCategories,
  lifestyleCategories,
  megaMenuCategories,
  allCategories,
} = getCategoriesData();

export const getProductsData = () => {
  return productsData as Product[];
};

export const products = getProductsData();

export const getSlidersData = () => {
  return slidersData as Slide[];
};

export const sliders = getSlidersData();

export const getBrandsData = () => {
  return brandsData as Brand[];
};

export const brands = getBrandsData();

export const getProductAttributesData = () => {
  return productAttributesData as ProductAttribute[];
};

export const ProductAttributes = getProductAttributesData();
