"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import DeliverToModal from "@/components/UI/Modals/DeliverToModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  type: string;
  name: string;
  details: string;
  area: string;
  city: string;
  country?: string; // Add country
  country_code?: string; // Add country code
  isDefault: boolean;
  location: Location;
}

const translations = {
  myAddresses: {
    en: "My Addresses",
    ar: "عناويني",
  },
  defaultAddress: {
    en: "Default Address",
    ar: "العنوان الافتراضي",
  },
  noAddress: {
    en: "No default address set",
    ar: "لم يتم تعيين عنوان افتراضي",
  },
  savedAddresses: {
    en: "Saved Addresses",
    ar: "العناوين المحفوظة",
  },
  defaultTag: {
    en: "Default",
    ar: "افتراضي",
  },
  addNewAddress: {
    en: "Add New Address",
    ar: "إضافة عنوان جديد",
  },
  edit: {
    en: "Edit",
    ar: "تعديل",
  },
  setAsDefault: {
    en: "Set As Default",
    ar: "تعيين كافتراضي",
  },
  delete: {
    en: "Delete",
    ar: "حذف",
  },
};

const AddressPage = () => {
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const loadAddresses = () => {
      // Load default address
      const defaultAddrString = localStorage.getItem("userAddress");
      if (defaultAddrString) {
        try {
          const parsedDefaultAddr: Address = JSON.parse(defaultAddrString);
          setDefaultAddress(parsedDefaultAddr);
        } catch (error) {
          console.error(
            "Error parsing default address from localStorage:",
            error,
          );
          localStorage.removeItem("userAddress"); // Clear invalid data
        }
      } else {
        setDefaultAddress(null);
      }

      // Load saved addresses
      const savedAddrsString = localStorage.getItem("savedAddresses");
      if (savedAddrsString) {
        try {
          const parsedSavedAddresses: Address[] = JSON.parse(savedAddrsString);
          // Filter out the default address from saved addresses if it happens to be duplicated
          setSavedAddresses(
            parsedSavedAddresses.filter((addr) =>
              defaultAddress ? addr.id !== defaultAddress.id : true,
            ),
          );
        } catch (error) {
          console.error(
            "Error parsing saved addresses from localStorage:",
            error,
          );
          localStorage.removeItem("savedAddresses"); // Clear invalid data
        }
      } else {
        setSavedAddresses([]);
      }
    };
    loadAddresses();
  }, []); // Empty dependency array means this runs once on mount

  const saveAddressesToLocalStorage = (
    newDefault: Address | null,
    newSaved: Address[],
  ) => {
    // Save default address
    if (newDefault) {
      localStorage.setItem("userAddress", JSON.stringify(newDefault));
    } else {
      localStorage.removeItem("userAddress");
    }

    // Save non-default addresses
    localStorage.setItem("savedAddresses", JSON.stringify(newSaved));

    setDefaultAddress(newDefault);
    setSavedAddresses(newSaved);
  };

  const handleAddressSelectedFromModal = (address: Address) => {
    let newDefault: Address | null = defaultAddress;
    let newSaved: Address[] = [...savedAddresses];

    if (addressToEdit) {
      // Editing an existing address
      if (address.isDefault) {
        // If the edited address is now default
        newDefault = address;
        newSaved = newSaved.filter((addr) => addr.id !== address.id); // Remove from saved
      } else {
        // If the edited address is no longer default or was never default
        if (newDefault && newDefault.id === addressToEdit.id) {
          // If the edited address was previously default and is now not
          newDefault = null; // Unset default
          newSaved = newSaved.map((addr) =>
            addr.id === addressToEdit.id ? address : addr,
          ); // Update in saved
          if (newSaved.length > 0) {
            // If there are other saved addresses, make the first one default
            newDefault = { ...newSaved[0], isDefault: true };
            newSaved = newSaved
              .slice(1)
              .map((addr) => ({ ...addr, isDefault: false })); // Remove the new default from saved
          }
        } else {
          // Update in saved addresses
          newSaved = newSaved.map((addr) =>
            addr.id === addressToEdit.id ? address : addr,
          );
        }
      }
    } else {
      // Adding a new address
      const newId = crypto.randomUUID(); // Generate a unique ID for the new address
      const newAddressWithId = { ...address, id: newId };

      if (newAddressWithId.isDefault) {
        // If new address is default, it becomes the new default
        if (newDefault) {
          // Old default becomes a regular saved address (if not already the new default)
          newSaved.push({ ...newDefault, isDefault: false });
        }
        newDefault = newAddressWithId;
      } else {
        // New address is a regular saved address
        newSaved.push(newAddressWithId);
      }
    }

    // After all logic, ensure only one default and update isDefault flags
    let finalDefault: Address | null = newDefault;
    let finalSaved: Address[] = [];

    if (finalDefault) {
      finalDefault = { ...finalDefault, isDefault: true };
      finalSaved = newSaved
        .filter((addr) => addr.id !== finalDefault?.id)
        .map((addr) => ({ ...addr, isDefault: false }));
    } else {
      // If no default is explicitly set (e.g., deleted the default), and there are saved addresses, make the first one default.
      if (newSaved.length > 0) {
        finalDefault = { ...newSaved[0], isDefault: true };
        finalSaved = newSaved
          .slice(1)
          .map((addr) => ({ ...addr, isDefault: false }));
      } else {
        finalSaved = newSaved.map((addr) => ({ ...addr, isDefault: false }));
      }
    }

    saveAddressesToLocalStorage(finalDefault, finalSaved);
    setAddressToEdit(null); // Reset edit state
    setIsDeliverModalOpen(false);
  };

  const setAsDefault = (address: Address) => {
    const newDefault: Address = { ...address, isDefault: true };
    let newSaved: Address[] = [];

    if (defaultAddress) {
      newSaved.push({ ...defaultAddress, isDefault: false });
    }
    newSaved = newSaved.concat(
      savedAddresses
        .filter((addr) => addr.id !== address.id)
        .map((addr) => ({ ...addr, isDefault: false })),
    );

    saveAddressesToLocalStorage(newDefault, newSaved);
  };

  const editAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsDeliverModalOpen(true);
  };

  const deleteAddress = (id: string) => {
    let newDefault: Address | null = defaultAddress;
    let newSaved: Address[] = [...savedAddresses];

    if (newDefault && newDefault.id === id) {
      // If the deleted address is the default one
      newDefault = null;
      if (newSaved.length > 0) {
        // If there are other saved addresses, make the first one default
        newDefault = { ...newSaved[0], isDefault: true };
        newSaved = newSaved.slice(1); // Remove the new default from saved
      }
    } else {
      // If the deleted address is a saved one
      newSaved = newSaved.filter((addr) => addr.id !== id);
    }
    saveAddressesToLocalStorage(newDefault, newSaved);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="text-green-500" size={20} />;
      case "work":
        return <Briefcase className="text-green-500" size={20} />;
      default:
        return <MapPin className="text-purple-500" size={20} />;
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-700">
        {translations.myAddresses[language]}
      </h1>

      {/* Default Address Section */}
      <div
        className={`mb-8 ${language === "ar" ? "text-right" : ""}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <h2 className="mb-2 text-sm font-semibold">
          {translations.defaultAddress[language]}
        </h2>

        {defaultAddress ? (
          <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start">
              <div className={`mt-1 ${language === "ar" ? "ml-3" : "mr-3"}`}>
                {getAddressIcon(defaultAddress.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{defaultAddress.name}</h3>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                    {translations.defaultTag[language]}
                  </span>
                </div>
                <p className="text-gray-700">{defaultAddress.details}</p>
                <p className="text-gray-600">
                  {defaultAddress.area}, {defaultAddress.city}
                </p>
              </div>
            </div>
            <div
              className={`mt-2 flex ${language === "ar" ? "justify-start space-x-reverse" : "justify-end"} space-x-2`}
            >
              <button
                onClick={() => editAddress(defaultAddress)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-green-600 hover:text-green-800"
                title={translations.edit[language]}
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => deleteAddress(defaultAddress.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-red-600 hover:text-red-800"
                title={translations.delete[language]}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
            {translations.noAddress[language]}
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {translations.savedAddresses[language]}
          </h2>
          <button
            onClick={() => {
              setAddressToEdit(null); // Ensure we're adding, not editing
              setIsDeliverModalOpen(true);
            }}
            className="flex items-center rounded-full bg-green-600 px-4 py-2 text-white hover:bg-green-700 md:rounded-lg"
          >
            <Plus size={18} />
            <span className="hidden md:block">
              {translations.addNewAddress[language]}
            </span>
          </button>
        </div>

        {savedAddresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start gap-2">
                  <div className="mr-3 mt-1">
                    {getAddressIcon(address.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{address.name}</h3>
                    <p className="text-gray-700">{address.details}</p>
                    <p className="text-gray-600">
                      {address.area}, {address.city}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setAsDefault(address)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-green-600 hover:text-green-800"
                    title={translations.setAsDefault[language]}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => editAddress(address)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-green-600 hover:text-green-800"
                    title={translations.edit[language]}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-red-600 hover:text-red-800"
                    title={translations.delete[language]}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
            No saved addresses yet
          </div>
        )}
      </div>

      {/* DeliverToModal Integration */}
      <DeliverToModal
        isOpen={isDeliverModalOpen}
        onClose={() => {
          setIsDeliverModalOpen(false);
          setAddressToEdit(null); // Reset addressToEdit when closing modal
        }}
        onAddressSelect={handleAddressSelectedFromModal}
        locale={language}
      />
    </div>
  );
};

export default AddressPage;
