"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Modal from "@/components/UI/Modals/DynamicModal";
import Image from "next/image";

type BrandApprovalFormData = {
  name: string;
  websiteLink: string;
  logo: FileList | null;
};

type BrandApprovalModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
};

const BrandApprovalModal: FC<BrandApprovalModalProps> = ({
  isModalOpen = false,
  setIsModalOpen,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BrandApprovalFormData>();

  const logoFile = watch("logo");

  // Handle image preview
  if (logoFile && logoFile.length > 0 && !previewImage) {
    const file = logoFile[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = (data: BrandApprovalFormData) => {
    console.log("Brand approval submitted:", data);
    // Here you would typically send the data to your API
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setPreviewImage(null);
        }}
        title="Brand Approval Request"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* English Brand Name */}
            <div>
              <label
                htmlFor="englishName"
                className="block text-sm font-medium text-gray-700"
              >
                Brand name*
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  {...register("name", {
                    required: "brand name is required",
                  })}
                  placeholder="example"
                  className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Website Link */}
            <div>
              <label
                htmlFor="websiteLink"
                className="block text-sm font-medium text-gray-700"
              >
                Brand official website link*
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  id="websiteLink"
                  {...register("websiteLink", {
                    required: "Website link is required",
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Please enter a valid URL",
                    },
                  })}
                  className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                    errors.websiteLink ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="https://example.com"
                />
                {errors.websiteLink && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.websiteLink.message}
                  </p>
                )}
              </div>
            </div>

            {/* Brand Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Logo*
              </label>
              <div className="mt-1 flex items-center gap-4">
                <label
                  htmlFor="logo"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                >
                  <span className="mb-2 block font-medium">Add Image</span>
                  <span className="block text-xs">PNG, JPG up to 5MB</span>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("logo", {
                      required: "Brand logo is required",
                      validate: {
                        fileSize: (files) =>
                          !files ||
                          files[0]?.size <= 5 * 1024 * 1024 ||
                          "File size should be less than 5MB",
                        fileType: (files) =>
                          !files ||
                          ["image/jpeg", "image/png"].includes(
                            files[0]?.type,
                          ) ||
                          "Only JPG and PNG files are allowed",
                      },
                    })}
                  />
                </label>
                {previewImage && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      width={300}
                      height={300}
                      src={previewImage}
                      alt="Brand logo preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        reset({ ...watch(), logo: null });
                      }}
                      className="absolute right-1 top-1 rounded-full bg-gray-800 p-0.5 text-white opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              {errors.logo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.logo.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
            Note that, approvals team will go over your request and get back to
            you within a few days.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                reset();
                setPreviewImage(null);
              }}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BrandApprovalModal;
