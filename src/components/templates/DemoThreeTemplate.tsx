import React from "react";
import {
  BasicInfo,
  CustomFieldType,
  getBorderRadiusValue,
  GlobalSettings,
  MenuSection,
  ResumeData,
} from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import ExperienceSection from "@/components/preview/ExperienceSection";
import EducationSection from "@/components/preview/EducationSection";
import ProjectSection from "@/components/preview/ProjectSection";
import SkillSection from "@/components/preview/SkillPanel";
import CustomSection from "@/components/preview/CustomSection";
import GithubContribution from "@/components/shared/GithubContribution";

interface DemoThreeTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const DemoThreeTemplate: React.FC<DemoThreeTemplateProps> = ({
  data,
  template,
}) => {
  const accentColor =
    data.globalSettings?.themeColor || template.colorScheme.primary;
  const secondaryColor = template.colorScheme.secondary || "#d4af37";
  const pagePadding =
    data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const sectionSpacing =
    data.globalSettings?.sectionSpacing ?? template.spacing.sectionGap;
  const paragraphSpacing =
    data.globalSettings?.paragraphSpacing ?? template.spacing.itemGap;
  const headerFontSize = (data.globalSettings?.headerSize ?? 28) + 2;
  const subheaderFontSize = data.globalSettings?.subheaderSize ?? 18;
  const baseTextColor = template.colorScheme.text || "#1f2937";

  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);
  const nonBasicSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  const mainSectionIds = ["experience", "projects", "education"];
  const primarySections: MenuSection[] = [];
  const secondarySections: MenuSection[] = [];

  nonBasicSections.forEach((section) => {
    if (mainSectionIds.includes(section.id)) {
      primarySections.push(section);
    } else {
      secondarySections.push(section);
    }
  });

  const sharedSectionSettings: GlobalSettings = {
    ...data.globalSettings,
    paragraphSpacing,
    sectionSpacing: 0,
  };

  const locale =
    typeof window !== "undefined" && window.navigator?.language
      ? window.navigator.language
      : "zh-CN";

  const formatDate = (value?: string) => {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const collectBasicFields = (basic: BasicInfo) => {
    const fallbackFields = [
      { key: "email", label: "Email", value: basic.email },
      { key: "phone", label: "Phone", value: basic.phone },
      { key: "location", label: "Location", value: basic.location },
    ];

    const orderedFields = basic.fieldOrder
      ? basic.fieldOrder
          .filter(
            (field) =>
              field.visible !== false &&
              field.key !== "name" &&
              field.key !== "title"
          )
          .map((field) => {
            const rawValue =
              field.key === "birthDate"
                ? formatDate(basic[field.key] as string)
                : ((basic as BasicInfo)[field.key] as string);

            return {
              key: field.key,
              label: field.label,
              value: rawValue,
            };
          })
          .filter((field) => field.value)
      : fallbackFields.filter((field) => field.value);

    const customFields: CustomFieldType[] =
      basic.customFields?.filter((field) => field.visible !== false) || [];

    return [
      ...orderedFields,
      ...customFields.map((field) => ({
        key: field.id,
        label: field.label,
        value: field.value,
      })),
    ].filter((field) => field.value);
  };

  const contactFields = collectBasicFields(data.basic);

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={sharedSectionSettings}
            showTitle={false}
          />
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle =
            data.menuSections.find((section) => section.id === sectionId)
              ?.title || sectionId;
          return (
            <CustomSection
              sectionId={sectionId}
              title={sectionTitle}
              items={data.customData[sectionId]}
              globalSettings={sharedSectionSettings}
              showTitle={false}
            />
          );
        }
        return null;
    }
  };

  const SectionBlock = ({ section }: { section: MenuSection }) => {
    const sectionTitle =
      data.menuSections.find((item) => item.id === section.id)?.title ||
      section.id;
    const sectionContent = renderSectionContent(section.id);

    if (!sectionContent) return null;

    return (
      <div
        key={section.id}
        className="space-y-3"
        style={{ marginBottom: `${sectionSpacing}px` }}
      >
        <div className="inline-flex items-center gap-3">
          <span
            className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            style={{
              backgroundColor: accentColor,
              letterSpacing: "0.3rem",
            }}
          >
            {sectionTitle}
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/90 px-5 py-5 shadow-sm">
          {sectionContent}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    const photoVisible = data.basic.photo && data.basic.photoConfig?.visible;

    return (
      <div className="relative">
        <div
          className="h-2 w-full"
          style={{
            backgroundColor: secondaryColor,
          }}
        />
        <div className="flex flex-col gap-8 px-10 py-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5 text-slate-600">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
              <span className="text-slate-500">个人简历</span>
              {data.basic.employementStatus && (
                <span className="rounded-full bg-slate-100 px-3 py-1 tracking-[0.2em] text-slate-500">
                  {data.basic.employementStatus}
                </span>
              )}
            </div>
            <div className="space-y-2 text-slate-900">
              <h1
                className="font-bold leading-snug"
                style={{
                  fontSize: `${headerFontSize}px`,
                  color: baseTextColor,
                }}
              >
                {data.basic.name || "您的姓名"}
              </h1>
              {data.basic.title && (
                <p
                  className="font-medium text-slate-500"
                  style={{
                    fontSize: `${subheaderFontSize}px`,
                  }}
                >
                  {data.basic.title}
                </p>
              )}
            </div>
            {contactFields.length > 0 && (
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                {contactFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {field.label}
                    </span>
                    <p className="mt-1 font-semibold text-slate-700">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {photoVisible && (
            <div className="shrink-0 self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_15px_45px_rgba(15,23,42,0.08)]">
              <div
                style={{
                  width: data.basic.photoConfig?.width || 120,
                  height: data.basic.photoConfig?.height || 150,
                  borderRadius: getBorderRadiusValue(data.basic.photoConfig),
                  overflow: "hidden",
                }}
              >
                <img
                  src={data.basic.photo}
                  alt={`${data.basic.name || "avatar"} photo`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: template.colorScheme.background,
        color: baseTextColor,
      }}
    >
      <div
        className="mx-auto max-w-[980px]"
        style={{
          padding: `${pagePadding}px`,
        }}
      >
        <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_35px_60px_rgba(15,23,42,0.08)]">
          {renderHeader()}
          <div className="bg-slate-50/60 px-10 py-10">
            <div className="grid gap-8 lg:grid-cols-[2.2fr_1.2fr]">
              <div className="space-y-6">
                {primarySections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}
              </div>
              <div className="space-y-6">
                {secondarySections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}
                {data.basic.githubContributionsVisible && (
                  <div
                    className="space-y-3"
                    style={{ marginTop: `${sectionSpacing}px` }}
                  >
                    <div className="inline-flex items-center gap-3">
                      <span
                        className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white"
                        style={{
                          backgroundColor: accentColor,
                          letterSpacing: "0.3rem",
                        }}
                      >
                        GitHub
                      </span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm">
                      <GithubContribution
                        githubKey={data.basic.githubKey}
                        username={data.basic.githubUseName}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoThreeTemplate;

