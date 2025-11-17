import React from "react";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import ProjectSection from "../preview/ProjectSection";
import CustomSection from "../preview/CustomSection";
import GithubContribution from "../shared/GithubContribution";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";

interface PopularColumnsTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * 热门经典分栏模板
 * 对应示例图 3.png：
 * - 顶部有颜色横条与标题区域
 * - 下方内容区域轻量分栏：左侧主要信息，右侧辅助模块
 */
const PopularColumnsTemplate: React.FC<PopularColumnsTemplateProps> = ({
  data,
  template,
}) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections.filter((section) => section.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    const sectionTitle =
      data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;

    switch (sectionId) {
      case "basic":
        return (
          <>
            <BaseInfo
              basic={data.basic}
              globalSettings={data.globalSettings}
              template={template}
            />
            {data.basic.githubContributionsVisible && (
              <GithubContribution
                className="mt-2"
                githubKey={data.basic.githubKey}
                username={data.basic.githubUseName}
              />
            )}
          </>
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={data.globalSettings}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={data.globalSettings}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={data.globalSettings}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={data.globalSettings}
          />
        );
      default:
        if (sectionId in data.customData) {
          return (
            <CustomSection
              title={sectionTitle}
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={data.globalSettings}
            />
          );
        }
        return null;
    }
  };

  const basicSection = sortedSections.find((section) => section.id === "basic");
  const otherSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  const leftColumnSections = otherSections.filter(
    (section) =>
      section.id === "experience" ||
      section.id === "projects" ||
      section.id === "education"
  );
  const rightColumnSections = otherSections.filter(
    (section) =>
      !leftColumnSections.find((s) => s.id === section.id)
  );

  return (
    <div
      className="flex flex-col w-full min-h-screen"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* 顶部横条与标题区域 */}
      <div className="w-full mb-4">
        <div
          className="h-3"
          style={{
            backgroundColor: data.globalSettings.themeColor,
          }}
        />
        <div className="flex items-center justify-between px-6 py-4">
          {basicSection && renderSection(basicSection.id)}
        </div>
      </div>

      {/* 下方分栏内容区域 */}
      <div className="flex flex-row gap-6 px-6 pb-6">
        <div className="flex-1 space-y-4">
          {leftColumnSections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-200 last:border-none pb-4"
            >
              {renderSection(section.id)}
            </div>
          ))}
        </div>

        <div className="w-1/3 space-y-4">
          {rightColumnSections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-200 last:border-none pb-4"
            >
              {renderSection(section.id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularColumnsTemplate;

import React from "react";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import ProjectSection from "../preview/ProjectSection";
import CustomSection from "../preview/CustomSection";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import { Printer, Download, Share2 } from "lucide-react";

interface PopularColumnsTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const PopularColumnsTemplate: React.FC<PopularColumnsTemplateProps> = ({
  data,
  template,
}) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections.filter((s) => s.enabled);
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

  const themeColor = data.globalSettings.themeColor;

  const leftIds = new Set(["experience", "projects"]);
  const rightIds = new Set(["education", "skills"]);

  const basicSection = sortedSections.find((s) => s.id === "basic");
  const contentSections = sortedSections.filter((s) => s.id !== "basic");
  const leftSections = contentSections.filter((s) => leftIds.has(s.id));
  const rightSections = contentSections.filter((s) => rightIds.has(s.id));
  const otherSections = contentSections.filter(
    (s) => !leftIds.has(s.id) && !rightIds.has(s.id)
  );

  const renderSection = (sectionId: string, opts?: { noTitle?: boolean }) => {
    const sectionTitle =
      data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;

    switch (sectionId) {
      case "basic":
        return (
          <BaseInfo
            basic={data.basic}
            globalSettings={data.globalSettings}
            template={template}
            showTitle={false}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={data.globalSettings}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={data.globalSettings}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={data.globalSettings}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={data.globalSettings}
          />
        );
      default:
        if (sectionId in data.customData) {
          return (
            <CustomSection
              title={sectionTitle}
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={data.globalSettings}
              showTitle={!opts?.noTitle}
            />
          );
        }
        return null;
    }
  };

  return (
    <div
      className="flex flex-col w-full"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* 顶部彩色横条 + 图标按钮 */}
      <header
        className="px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: themeColor, color: "#ffffff" }}
      >
        <div className="flex-1">
          {basicSection && renderSection("basic")}
        </div>
        <div className="flex items-center gap-3 ml-6">
          <Download className="w-5 h-5" />
          <Printer className="w-5 h-5" />
          <Share2 className="w-5 h-5" />
        </div>
      </header>

      {/* 下方双栏内容 */}
      <main className="px-10 py-6 space-y-6">
        <div className="grid grid-cols-[60%_38%] gap-6">
          <div className="space-y-6">
            {leftSections.map((section) => (
              <section key={section.id} className="space-y-2">
                <h3
                  className="text-base font-semibold"
                  style={{
                    borderLeft: `4px solid ${themeColor}`,
                    paddingLeft: 8,
                  }}
                >
                  {
                    data.menuSections.find((s) => s.id === section.id)?.title ??
                    section.id
                  }
                </h3>
                {renderSection(section.id)}
              </section>
            ))}
            {/* 其他内容模块默认也放左侧 */}
            {otherSections.map((section) => (
              <section key={section.id} className="space-y-2">
                <h3
                  className="text-base font-semibold"
                  style={{
                    borderLeft: `4px solid ${themeColor}`,
                    paddingLeft: 8,
                  }}
                >
                  {
                    data.menuSections.find((s) => s.id === section.id)?.title ??
                    section.id
                  }
                </h3>
                {renderSection(section.id)}
              </section>
            ))}
          </div>

          {/* 右侧：技能 / 教育 / 兴趣等 */}
          <div className="space-y-4 relative">
            <div
              className="absolute left-0 top-0 bottom-0 w-px"
              style={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="pl-4 space-y-4">
              {rightSections.map((section) => (
                <section
                  key={section.id}
                  className="rounded-md border px-3 py-3"
                  style={{ borderColor: themeColor + "40" }}
                >
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: themeColor }}
                  >
                    {
                      data.menuSections.find((s) => s.id === section.id)?.title ??
                      section.id
                    }
                  </h3>
                  {renderSection(section.id)}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PopularColumnsTemplate;