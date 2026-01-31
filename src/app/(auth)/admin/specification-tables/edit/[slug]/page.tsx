"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOutIcon, GripVertical, X } from "lucide-react";
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
import { Textarea } from "@/components/UI/textarea";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/UI/Check-Box";
import { useParams } from "next/navigation";
import { dummySpecificationTables } from "@/constants/specificationTables";
import { dummySpecificationGroups } from "@/constants/specificationGroups";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import { SpecificationGroup, SpecificationTable } from "@/types/product";

// ---------------- Schema & Types ----------------
const messages = {
  name_en_required: {
    en: "Name in English is required",
    ar: "الاسم بالإنجليزية مطلوب",
  },
  name_ar_required: {
    en: "Name in Arabic is required",
    ar: "الاسم بالعربية مطلوب",
  },
  groups_required: {
    en: "At least one group must be selected",
    ar: "يجب اختيار مجموعة واحدة على الأقل",
  },
};

const specificationTableSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  description: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  selectedGroups: z.array(z.string()).min(1, messages.groups_required.en),
});

type SpecificationTableFormData = z.infer<typeof specificationTableSchema>;

// ---------------- Component ----------------
export default function EditSpecificationTablePage() {
  const { language } = useLanguage();
  const params = useParams();
  const tableId = params.slug as string;
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTable, setCurrentTable] = useState<SpecificationTable>();

  const form = useForm<SpecificationTableFormData>({
    resolver: zodResolver(specificationTableSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      selectedGroups: [],
    },
  });

  // Find the table by ID
  useEffect(() => {
    const fetchTable = async () => {
      setIsLoading(true);
      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const table = dummySpecificationTables.find(
          (table) => table.id === tableId,
        );

        if (table) {
          setCurrentTable(table);

          // ✅ store only IDs
          const ids = table.assignedGroups.map((g: SpecificationGroup) => g.id);
          setSelectedGroups(ids);
          setGroupOrder(table.groupOrder ?? ids); // fallback to ids order

          form.reset({
            name: table.name,
            description: table.description,
            selectedGroups: ids,
          });
        }
      } catch (error) {
        console.error("Error fetching table:", error);
      } finally {
        setIsSubmitting(false); // ✅ reset after done
        setIsLoading(false);
      }
    };

    if (tableId) {
      fetchTable();
    }
  }, [tableId, form]);

  const onSubmit = async (data: SpecificationTableFormData) => {
    try {
      console.log("Updating Specification Table:", {
        ...data,
        groupOrder,
      });
      console.log("Table ID:", tableId);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Table updated successfully");
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleGroupSelection = (groupId: string, checked: boolean) => {
    const newSelectedGroups = checked
      ? [...selectedGroups, groupId]
      : selectedGroups.filter((id) => id !== groupId);

    setSelectedGroups(newSelectedGroups);

    const newGroupOrder = groupOrder.filter((id) =>
      newSelectedGroups.includes(id),
    );
    const newlyAddedGroups = newSelectedGroups.filter(
      (id) => !groupOrder.includes(id),
    );
    setGroupOrder([...newGroupOrder, ...newlyAddedGroups]);

    form.setValue("selectedGroups", newSelectedGroups);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(groupOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setGroupOrder(items);
  };

  const removeGroupFromOrder = (groupId: string) => {
    const newSelectedGroups = selectedGroups.filter((id) => id !== groupId);
    const newGroupOrder = groupOrder.filter((id) => id !== groupId);

    setSelectedGroups(newSelectedGroups);
    setGroupOrder(newGroupOrder);
    form.setValue("selectedGroups", newSelectedGroups);
  };

  const t = {
    en: {
      title: "Edit Specification Table",
      language_version: "You are editing 'English' version",
      group_name: "Group name",
      description: "Description",
      select_groups: "Select the groups to display in this table",
      group_sorting: "Group Sorting",
      drag_to_reorder: "Drag to reorder groups in the table",
      no_groups_selected: "No groups selected",
      add_groups_first: "Add groups first to reorder them",
      update: "Update",
      updateExit: "Update and Exit",
      published: "Published",
      required_field: "Required field",
      english: "English",
      arabic: "Arabic",
      name_placeholder: "Enter table name",
      description_placeholder: "Enter description",
      languages: "Languages",
      loading: "Loading...",
      not_found: "Table not found",
    },
    ar: {
      title: "تحرير جدول المواصفات",
      language_version: "أنت تقوم بتحرير النسخة 'الإنجليزية'",
      group_name: "اسم المجموعة",
      description: "الوصف",
      select_groups: "اختر المجموعات المعروضة في هذا الجدول",
      group_sorting: "ترتيب المجموعات",
      drag_to_reorder: "اسحب لإعادة ترتيب المجموعات في الجدول",
      no_groups_selected: "لم يتم اختيار أي مجموعات",
      add_groups_first: "أضف المجموعات أولاً لإعادة ترتيبها",
      update: "حفظ التغييرات",
      updateExit: "حفظ وخروج",
      published: "منشور",
      required_field: "حقل مطلوب",
      english: "الإنجليزية",
      arabic: "العربية",
      name_placeholder: "أدخل اسم الجدول",
      description_placeholder: "أدخل الوصف",
      languages: "اللغات",
      loading: "جاري التحميل...",
      not_found: "الجدول غير موجود",
    },
  }[language];

  const getGroupName = (groupId: string) => {
    const group = dummySpecificationGroups.find((g) => g.id === groupId);
    return group ? group.name[language] : groupId;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!currentTable) {
    return <NotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Group Name Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.group_name} *</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.group_name} ({t.english}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.name_placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.group_name} ({t.arabic}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.name_placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Description Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.description}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.description} ({t.english})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.description_placeholder}
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.description} ({t.arabic})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.description_placeholder}
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Group Selection Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.select_groups} *</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {dummySpecificationGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={(checked) =>
                          handleGroupSelection(group.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`group-${group.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {group.name[language]}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage>
                  {form.formState.errors.selectedGroups?.message}
                </FormMessage>
              </Card>

              {/* Group Sorting Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.group_sorting}</h3>
                  <p className="text-sm text-gray-600">{t.drag_to_reorder}</p>
                </div>

                {groupOrder.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="groups">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {groupOrder.map((groupId, index) => (
                            <Draggable
                              key={groupId}
                              draggableId={groupId}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  <span className="flex-1 text-sm font-medium">
                                    {getGroupName(groupId)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeGroupFromOrder(groupId)
                                    }
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <p className="text-gray-500">{t.no_groups_selected}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {t.add_groups_first}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardHeader className="text-xl font-semibold">
                  {t.published}
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-0 md:flex-row">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex flex-1 items-center gap-2 truncate"
                    disabled={isSubmitting}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t.updateExit}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 truncate"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? `${t.update}...` : t.update}
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
