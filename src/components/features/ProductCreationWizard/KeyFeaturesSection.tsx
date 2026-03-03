import { useState } from "react";
import {
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/shared/card";
import { Button } from "@/components/shared/button";
import { Label } from "@/components/shared/label";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";

export interface KeyFeature {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

interface KeyFeaturesSectionProps {
  t: any;
  locale: string;
}

export const KeyFeaturesSection = ({ t, locale }: KeyFeaturesSectionProps) => {
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([]);
  const [showArabicKeyFeatures, setShowArabicKeyFeatures] = useState(false);
  const [collapsedFeatureIds, setCollapsedFeatureIds] = useState<Set<string>>(
    new Set(),
  );
  const [isKeyFeaturesCollapsed, setIsKeyFeaturesCollapsed] = useState(false);

  const toggleFeatureCollapse = (featureId: string) => {
    setCollapsedFeatureIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const handleAddKeyFeature = () => {
    const newKeyFeature: KeyFeature = {
      id: Date.now().toString(),
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
    };
    setKeyFeatures([...keyFeatures, newKeyFeature]);
  };

  const handleUpdateKeyFeature = (
    id: string,
    field: "title" | "description",
    lang: "en" | "ar",
    value: string,
  ) => {
    setKeyFeatures(
      keyFeatures.map((feature) =>
        feature.id === id
          ? { ...feature, [field]: { ...feature[field], [lang]: value } }
          : feature,
      ),
    );
  };

  const handleRemoveKeyFeature = (id: string) => {
    setKeyFeatures(keyFeatures.filter((feature) => feature.id !== id));
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-none bg-white/40 shadow-2xl shadow-gray-200/50 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100 bg-white/50 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-gray-900">
                {t.keyFeatures}
              </CardTitle>
              <CardDescription className="font-medium text-gray-500">
                Add key features with titles and descriptions in both languages
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsKeyFeaturesCollapsed(!isKeyFeaturesCollapsed)}
            className="h-10 w-10 rounded-xl p-0 hover:bg-gray-100"
          >
            {isKeyFeaturesCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isKeyFeaturesCollapsed && (
        <>
          <CardContent className="space-y-6 p-6">
            {keyFeatures.map((feature, index) => {
              const isFeatureCollapsed = collapsedFeatureIds.has(feature.id);
              return (
                <div
                  key={feature.id}
                  className="group relative space-y-4 rounded-3xl border-2 border-gray-100 bg-white/50 p-6 transition-all hover:border-emerald-200 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatureCollapse(feature.id)}
                        className="h-8 w-8 rounded-lg p-0 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        {isFeatureCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                      <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">
                        Feature #{index + 1}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKeyFeature(feature.id)}
                      className="h-8 w-8 rounded-lg p-0 text-red-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {!isFeatureCollapsed && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-6 duration-300">
                      <div
                        className={`grid gap-6 ${showArabicKeyFeatures ? "md:grid-cols-2" : "grid-cols-1"}`}
                      >
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-xs font-black text-gray-700">
                            <Globe className="h-3 w-3 text-emerald-500" />
                            {t.keyFeaturesTitleEn}
                          </Label>
                          <Input
                            placeholder="Enter title in English"
                            value={feature.title.en}
                            onChange={(e) =>
                              handleUpdateKeyFeature(
                                feature.id,
                                "title",
                                "en",
                                e.target.value,
                              )
                            }
                            className="h-11 rounded-xl border-2 border-gray-100 focus:border-emerald-500"
                            dir="ltr"
                          />
                        </div>

                        {showArabicKeyFeatures && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-xs font-black text-gray-700">
                              <Globe className="h-3 w-3 text-emerald-500" />
                              {t.keyFeaturesTitleAr}
                            </Label>
                            <Input
                              placeholder="أدخل العنوان بالعربية"
                              value={feature.title.ar}
                              onChange={(e) =>
                                handleUpdateKeyFeature(
                                  feature.id,
                                  "title",
                                  "ar",
                                  e.target.value,
                                )
                              }
                              className="h-11 rounded-xl border-2 border-gray-100 text-right focus:border-emerald-500"
                              dir="rtl"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`grid gap-6 ${showArabicKeyFeatures ? "md:grid-cols-2" : "grid-cols-1"}`}
                      >
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-xs font-black text-gray-700">
                            <Globe className="h-3 w-3 text-emerald-500" />
                            {t.keyFeaturesDescEn}
                          </Label>
                          <Textarea
                            placeholder="Enter description in English"
                            value={feature.description.en}
                            onChange={(e) =>
                              handleUpdateKeyFeature(
                                feature.id,
                                "description",
                                "en",
                                e.target.value,
                              )
                            }
                            className="min-h-[100px] rounded-xl border-2 border-gray-100 focus:border-emerald-500"
                            dir="ltr"
                            rows={3}
                          />
                        </div>

                        {showArabicKeyFeatures && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-xs font-black text-gray-700">
                              <Globe className="h-3 w-3 text-emerald-500" />
                              {t.keyFeaturesDescAr}
                            </Label>
                            <Textarea
                              placeholder="أدخل الوصف بالعربية"
                              value={feature.description.ar}
                              onChange={(e) =>
                                handleUpdateKeyFeature(
                                  feature.id,
                                  "description",
                                  "ar",
                                  e.target.value,
                                )
                              }
                              className="min-h-[100px] rounded-xl border-2 border-gray-100 text-right focus:border-emerald-500"
                              dir="rtl"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {keyFeatures.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 bg-white/20 py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-400">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  No key features added
                </h3>
                <p className="mt-2 max-w-[280px] text-sm font-medium text-gray-400">
                  Highlight what makes your product special to attract more
                  customers.
                </p>
                <Button
                  onClick={handleAddKeyFeature}
                  className="mt-8 rounded-2xl bg-[#31533A] px-8 py-6 font-black text-white shadow-xl shadow-emerald-900/10 transition-all hover:scale-105"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t.addFeature}
                </Button>
              </div>
            )}
          </CardContent>
          {keyFeatures.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t border-gray-100 bg-white/50 p-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddKeyFeature}
                className="h-12 gap-2 rounded-2xl border-2 border-gray-100 px-6 font-black transition-all hover:border-[#31533A] hover:text-[#31533A]"
              >
                <Plus className="h-5 w-5" />
                {t.addFeature}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArabicKeyFeatures(!showArabicKeyFeatures)}
                className="h-12 gap-2 rounded-2xl px-6 font-black text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-600"
              >
                {showArabicKeyFeatures ? (
                  <Minus className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {showArabicKeyFeatures
                  ? t.hideArabicDescription
                  : t.addArabicDescription}
              </Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
};
