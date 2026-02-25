export type Product = {
  name: string;
  image: string;
  quantity: number;
  price: string;
};

export type Order = {
  id: string;
  date: string;
  unit_price: string;
  customer: {
    name: string;
    phone: string;
    location: string;
  };
  products: Product[];
  seller: string;
  total: string;
  payment: {
    method: "visa" | "paypal" | "cash" | "mastercard";
    last4?: string;
  };
  status:
    | "Packaging"
    | "Pending"
    | "Delivered"
    | "For Delivery"
    | "Returned"
    | "Cancelled";
  quantity: string;
};

export const orders: Order[] = [
  {
    id: "ORD-1001",
    date: "15/5/2025",
    customer: {
      name: "Ahmed Mohamed",
      phone: "012454526885",
      location: "Nasr City, Cairo",
    },
    unit_price: "800 EGP",
    products: [
      {
        name: "Norton Utilities Ultimate",
        image: "/images/products/norton.png",
        quantity: 2,
        price: "800 EGP",
      },
      {
        name: "Wireless Mouse",
        image: "/images/products/mouse.png",
        quantity: 1,
        price: "300 EGP",
      },
    ],
    seller: "Brandova",
    total: "1900 EGP",
    payment: {
      method: "visa",
      last4: "1452",
    },
    status: "Packaging",
    quantity: "4 units",
  },
  {
    id: "ORD-1002",
    date: "14/5/2025",
    unit_price: "800 EGP",
    customer: {
      name: "Fatma Said",
      phone: "01001234567",
      location: "Maadi, Cairo",
    },
    products: [
      {
        name: "Adobe Photoshop License",
        image: "/images/products/photoshop.png",
        quantity: 1,
        price: "1200 EGP",
      },
    ],
    seller: "SoftMart",
    total: "1200 EGP",
    payment: {
      method: "paypal",
    },
    status: "Pending",
    quantity: "4 units",
  },
  {
    id: "ORD-1003",
    date: "13/5/2025",
    unit_price: "800 EGP",
    customer: {
      name: "Mohamed Ali",
      phone: "01112233445",
      location: "Dokki, Giza",
    },
    products: [
      {
        name: "Bluetooth Headphones",
        image: "/images/products/headphones.png",
        quantity: 1,
        price: "1500 EGP",
      },
      {
        name: "Phone Case",
        image: "/images/products/case.png",
        quantity: 2,
        price: "200 EGP",
      },
    ],
    seller: "TechGear",
    total: "1900 EGP",
    payment: {
      method: "mastercard",
    },
    status: "Delivered",
    quantity: "4 units",
  },
  {
    id: "ORD-1004",
    date: "12/5/2025",
    unit_price: "500 EGP",
    customer: {
      name: "Samira Ahmed",
      phone: "01098765432",
      location: "Heliopolis, Cairo",
    },
    products: [
      {
        name: "Smart Watch",
        image: "/images/products/watch.png",
        quantity: 1,
        price: "1500 EGP",
      },
    ],
    seller: "TechGear",
    total: "1500 EGP",
    payment: {
      method: "cash",
    },
    status: "For Delivery",
    quantity: "1 unit",
  },
  {
    id: "ORD-1005",
    date: "11/5/2025",
    unit_price: "350 EGP",
    customer: {
      name: "Youssef Kamal",
      phone: "01234567890",
      location: "Zamalek, Cairo",
    },
    products: [
      {
        name: "Wireless Earbuds",
        image: "/images/products/earbuds.png",
        quantity: 1,
        price: "700 EGP",
      },
    ],
    seller: "Brandova",
    total: "700 EGP",
    payment: {
      method: "visa",
      last4: "9876",
    },
    status: "Returned",
    quantity: "1 unit",
  },
  {
    id: "ORD-1006",
    date: "10/5/2025",
    unit_price: "1200 EGP",
    customer: {
      name: "Laila Hassan",
      phone: "01111222333",
      location: "6th October City",
    },
    products: [
      {
        name: "Laptop Backpack",
        image: "/images/products/backpack.png",
        quantity: 1,
        price: "600 EGP",
      },
    ],
    seller: "SoftMart",
    total: "600 EGP",
    payment: {
      method: "mastercard",
      last4: "5432",
    },
    status: "Cancelled",
    quantity: "1 unit",
  },
];
