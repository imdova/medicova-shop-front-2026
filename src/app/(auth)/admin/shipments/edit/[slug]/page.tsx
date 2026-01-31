"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/UI/form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import Link from "next/link";
import { MapPin, Printer } from "lucide-react";
import { dummyShipments } from "@/constants/shipments";
import Image from "next/image";
import { History, Product, Shipment } from "@/types/product";

// ---------------- Schema & Types ----------------
const messages = {
  shipping_company_required: {
    en: "Shipping company name is required",
    ar: "اسم شركة الشحن مطلوب",
  },
  tracking_id_required: {
    en: "Tracking ID is required",
    ar: "معرف التتبع مطلوب",
  },
  tracking_link_required: {
    en: "Tracking link is required",
    ar: "رابط التتبع مطلوب",
  },
  estimate_date_required: {
    en: "Estimate date shipped is required",
    ar: "تاريخ الشحن المقدر مطلوب",
  },
};

const shipmentStatusEnum = z.enum([
  "pending",
  "approved",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

const shipmentSchema = z.object({
  shippingCompany: z.object({
    en: z.string().min(1, messages.shipping_company_required.en),
    ar: z.string().min(1, messages.shipping_company_required.ar),
  }),
  trackingId: z.string().min(1, messages.tracking_id_required.en), // 🔹 only EN
  trackingLink: z.string().min(1, messages.tracking_link_required.en), // 🔹 only EN
  estimateDateShipped: z.string().min(1, messages.estimate_date_required.en),
  note: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  shippingStatus: shipmentStatusEnum,
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const shippingStatusOptions = [
  { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
  { id: "approved", name: { en: "Approved", ar: "معتمد" } },
  { id: "processing", name: { en: "Processing", ar: "قيد المعالجة" } },
  { id: "shipped", name: { en: "Shipped", ar: "تم الشحن" } },
  { id: "delivered", name: { en: "Delivered", ar: "تم التوصيل" } },
  { id: "cancelled", name: { en: "Cancelled", ar: "ملغى" } },
  { id: "returned", name: { en: "Returned", ar: "تم الإرجاع" } },
];

// ---------------- Component ----------------
export default function EditShipmentPage() {
  const { language } = useLanguage();
  const params = useParams();
  const shipmentId = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment>();

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      shippingCompany: { en: "", ar: "" },
      trackingId: "",
      trackingLink: "",
      estimateDateShipped: "",
      note: { en: "", ar: "" },
      shippingStatus: "pending",
    },
  });

  // Find the shipment by ID
  useEffect(() => {
    let isMounted = true;

    const fetchShipment = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const shipment = dummyShipments.find((ship) => ship.id === shipmentId);

        if (shipment && isMounted) {
          setCurrentShipment(shipment);

          const shippingStatus =
            typeof shipment.shippingStatus === "object"
              ? shipment.shippingStatus.en
              : shipment.shippingStatus;

          form.reset({
            shippingCompany:
              typeof shipment.shippingCompany === "object"
                ? shipment.shippingCompany
                : { en: shipment.shippingCompany || "", ar: "" },

            trackingId: shipment.trackingId || "",
            trackingLink: shipment.trackingLink || "",

            estimateDateShipped: shipment.estimateDateShipped || "",

            note:
              typeof shipment.note === "object"
                ? shipment.note
                : { en: shipment.note || "", ar: "" },

            shippingStatus: shippingStatus || "pending",
          });
        }
      } catch (error) {
        console.error("Error fetching shipment:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (shipmentId) {
      fetchShipment();
    }

    return () => {
      isMounted = false;
    };
  }, [shipmentId, form]);

  const onSubmit = async (data: ShipmentFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Updating Shipment:", data);
      console.log("Shipment ID:", shipmentId);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Shipment updated successfully");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Update failed", error);
      setIsSubmitting(false);
    }
  };

  const t = {
    en: {
      title: "Edit Shipping",
      back_to_shipments: "Back to shipments",
      order_details: "Order Details",
      view_order: "View Order",
      additional_shipment_info: "Additional shipment information",
      shipping_company: "Shipping Company Name",
      shipping_company_en: "Shipping Company Name (English)",
      shipping_company_ar: "Shipping Company Name (Arabic)",
      tracking_id: "Tracking ID",
      tracking_id_en: "Tracking ID (English)",
      tracking_id_ar: "Tracking ID (Arabic)",
      tracking_link: "Tracking Link",
      tracking_link_en: "Tracking Link (English)",
      tracking_link_ar: "Tracking Link (Arabic)",
      estimate_date_shipped: "Estimate Date Shipped",
      note: "Note",
      note_en: "Note (English)",
      note_ar: "Note (Arabic)",
      note_placeholder: "Add note...",
      history: "History",
      shipment_information: "Shipment Information",
      order_number: "Order number",
      shipping_method: "Shipping method",
      shipping_fee: "Shipping fee",
      shipping_status: "Shipping status",
      update_shipping_status: "Update shipping status",
      customer_information: "Customer Information",
      see_on_maps: "See on maps",
      shipping_label: "Shipping label",
      print: "Print",
      save_changes: "Save Changes",
      save: "Save",
      loading: "Loading...",
      not_found: "Shipment not found",
      update: "Update",
    },
    ar: {
      title: "تحرير الشحنة",
      back_to_shipments: "العودة إلى الشحنات",
      order_details: "تفاصيل الطلب",
      view_order: "عرض الطلب",
      additional_shipment_info: "معلومات الشحنة الإضافية",
      shipping_company: "اسم شركة الشحن",
      shipping_company_en: "اسم شركة الشحن (الإنجليزية)",
      shipping_company_ar: "اسم شركة الشحن (العربية)",
      tracking_id: "معرف التتبع",
      tracking_link: "رابط التتبع",
      estimate_date_shipped: "تاريخ الشحن المقدر",
      note: "ملاحظة",
      note_en: "ملاحظة (الإنجليزية)",
      note_ar: "ملاحظة (العربية)",
      note_placeholder: "إضافة ملاحظة...",
      history: "السجل",
      shipment_information: "معلومات الشحنة",
      order_number: "رقم الطلب",
      shipping_method: "طريقة الشحن",
      shipping_fee: "رسوم الشحن",
      shipping_status: "حالة الشحن",
      update_shipping_status: "تحديث حالة الشحن",
      customer_information: "معلومات العميل",
      see_on_maps: "عرض على الخريطة",
      shipping_label: "ملصق الشحن",
      print: "طباعة",
      save_changes: "حفظ التغييرات",
      save: "حفظ",
      loading: "جاري التحميل...",
      not_found: "الشحنة غير موجودة",
      update: "تحديث",
    },
  }[language];
  if (isLoading) {
    return <Loading />;
  }

  if (!currentShipment) {
    return <NotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {t.title} #{currentShipment.id}
            </h1>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Order Details */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.order_details}</h3>
                <Link
                  href={`/admin/orders/edit/${currentShipment.orderId}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {t.view_order} {currentShipment.orderId}
                </Link>
              </div>

              {currentShipment.products?.map(
                (product: Product, index: number) => (
                  <Card
                    key={index}
                    className="border-b border-gray-200 py-0 last:border-b-0"
                  >
                    <div className="flex flex-col justify-between md:flex-row">
                      <div className="flex gap-3 p-3">
                        <Image
                          src={product.images[0]}
                          width={100}
                          height={100}
                          className="h-16 w-16 rounded-md object-cover"
                          alt={product.title[language] ?? "product name"}
                        />
                        <div className="max-w-xs">
                          <h4 className="font-semibold">
                            {typeof product.title === "object"
                              ? product.title[language]
                              : product.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {product.specifications
                              .map(
                                (specification) =>
                                  `(${specification.label[language]}: ${specification.content[language]})`,
                              )
                              .join(", ")}
                          </p>
                          {product.sku && (
                            <p className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center md:justify-start">
                        <p className="flex items-center justify-center border-gray-200 p-3 text-sm font-semibold md:border-x">
                          3 x ${product.price.toFixed(2)}
                        </p>
                        <p className="flex items-center justify-center p-3 text-sm font-semibold">
                          ${(3 * product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ),
              )}

              {/* Additional Shipment Information */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    {t.additional_shipment_info}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {/* Shipping Company - English */}
                    <FormField
                      control={form.control}
                      name="shippingCompany.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.shipping_company_en}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shipping Company - Arabic */}
                    <FormField
                      control={form.control}
                      name="shippingCompany.ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.shipping_company_ar}</FormLabel>
                          <FormControl>
                            <Input {...field} dir="rtl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Tracking ID - English */}
                  <FormField
                    control={form.control}
                    name="trackingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.tracking_id}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tracking Link - English */}
                  <FormField
                    control={form.control}
                    name="trackingLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.tracking_link}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimateDateShipped"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.estimate_date_shipped}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {/* Note - English */}
                    <FormField
                      control={form.control}
                      name="note.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.note_en}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.note_placeholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Note - Arabic */}
                    <FormField
                      control={form.control}
                      name="note.ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.note_ar}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.note_placeholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{t.history}</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentShipment.history?.map(
                    (event: History, index: number) => (
                      <div
                        key={index}
                        className="border-l-2 border-gray-200 pl-4"
                      >
                        <p className="text-sm font-semibold">
                          {typeof event.action === "object"
                            ? event.action[language]
                            : event.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.timestamp}
                        </p>
                        {event.by && (
                          <p className="text-xs text-gray-500">
                            Updated by: {event.by}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Shipment Information */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    {t.shipment_information}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      {t.order_number}
                    </label>
                    <p className="font-semibold">{currentShipment.orderId}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      {t.shipping_method}
                    </label>
                    <p>
                      {typeof currentShipment.shippingMethod === "object"
                        ? currentShipment.shippingMethod[language]
                        : currentShipment.shippingMethod}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      {t.shipping_fee}
                    </label>
                    <p>${currentShipment.shippingFee?.toFixed(2)}</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="shippingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t.shipping_status}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  {
                                    en: "Select status",
                                    ar: "اختر الحالة",
                                  }[language]
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shippingStatusOptions.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name[language]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full"
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {isSubmitting ? `${t.update}...` : t.update_shipping_status}
                  </Button>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    {t.customer_information}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="font-semibold">
                    {typeof currentShipment.customer.firstName === "object"
                      ? currentShipment.customer.firstName[language]
                      : currentShipment.customer.firstName}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {currentShipment.customer.phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentShipment.customer.email}
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {currentShipment.customer.addresses.map((addr) => (
                      <div key={addr.id} className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {`${addr.label}: ${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}`}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    {t.see_on_maps}
                  </Button>
                </CardContent>
              </Card>

              {/* Shipping Label */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{t.shipping_label}</h3>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    {t.print}
                  </Button>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card className="p-3">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{t.save}</h3>
                </CardHeader>
                <CardContent className="p-0">
                  <Button
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? `${t.update}...` : t.save_changes}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
