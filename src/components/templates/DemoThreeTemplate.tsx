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
import BaseInfo from "@/components/preview/BaseInfo";
import GithubContribution from "@/components/shared/GithubContribution";
import * as Icons from "lucide-react";

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
  const goldColor = "#d4af37"; // 金色装饰条
  const deepBlueColor = "#1e40af"; // 深蓝色标签（稍微亮一点以提升可读性）
  const pagePadding =
    data.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const sectionSpacing =
    data.globalSettings?.sectionSpacing ?? template.spacing.sectionGap;
  const paragraphSpacing =
    data.globalSettings?.paragraphSpacing ?? template.spacing.itemGap;
  const headerFontSize = data.globalSettings?.headerSize ?? 24;
  const subheaderFontSize = data.globalSettings?.subheaderSize ?? 16;

  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

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
      { key: "email", label: "邮箱", value: basic.email },
      { key: "phone", label: "电话", value: basic.phone },
      { key: "location", label: "所在地", value: basic.location },
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

  const getIcon = (iconName: string | undefined) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ElementType;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        // 基本信息部分特殊处理，显示在内容区
        return (
          <div className="space-y-4">
            <BaseInfo
              basic={data.basic}
              globalSettings={sharedSectionSettings}
              template={template}
              showTitle={false}
            />
          </div>
        );
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

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "#f5f6fb",
        color: "#111827",
      }}
    >
      <div
        className="mx-auto max-w-full bg-white"
        style={{
          padding: `${pagePadding}px`,
        }}
      >
        {/* 顶部金色装饰条 + 标题 */}
        <div className="relative mb-8">
          <div
            className="h-1.5 w-full mb-5"
            style={{
              backgroundColor: goldColor,
              boxShadow: "0 2px 4px rgba(212, 175, 55, 0.3)",
            }}
          />
          <h1
            className="text-center font-bold tracking-wide"
            style={{
              fontSize: `${headerFontSize + 6}px`,
              color: "#111827",
              letterSpacing: "0.05em",
            }}
          >
            个人简历
          </h1>
        </div>

        {/* 主要内容区域：左侧导航 + 右侧内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8">
          {/* 左侧垂直导航栏 */}
          <div
            className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible"
            style={{
              backgroundColor: "#f9fafb",
              padding: "20px 8px",
              borderRadius: "4px",
            }}
          >
            {sortedSections.map((section) => {
              const sectionTitle =
                data.menuSections.find((item) => item.id === section.id)
                  ?.title || section.id;
              const sectionIcon = section.icon;

              return (
                <div
                  key={section.id}
                  className="px-3 py-2.5"
                  style={{
                    backgroundColor: deepBlueColor,
                    color: "#ffffff",
                    borderRadius: "4px",
                    fontSize: `${subheaderFontSize - 2}px`,
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {sectionIcon && getIcon(sectionIcon)}
                  <span className="whitespace-nowrap">{sectionTitle}</span>
                </div>
              );
            })}
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1">
            {sortedSections.map((section, index) => {
              const content = renderSectionContent(section.id);
              if (!content) return null;

              return (
                <div
                  key={section.id}
                  className="mb-6 pb-6"
                  style={{
                    borderBottom:
                      index < sortedSections.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {content}
                </div>
              );
            })}

            {/* GitHub Contributions */}
            {data.basic.githubContributionsVisible && (
              <div className="mb-6 pb-6">
                <GithubContribution
                  githubKey={data.basic.githubKey}
                  username={data.basic.githubUseName}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoThreeTemplate;

